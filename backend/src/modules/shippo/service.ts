import {
  AbstractFulfillmentProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  CartAddressDTO,
  CartLineItemDTO,
  CreateFulfillmentResult,
  CreateShippingOptionDTO,
  FulfillmentOption,
  Logger,
  OrderLineItemDTO,
  StockLocationAddressDTO,
} from "@medusajs/framework/types"
import { ShippoClient, ShippoClientOptions } from "./client"
import { ShippoAddress, ShippoParcel, ShippoRate, ShippoShipment } from "./types"

export type ShippoOptions = ShippoClientOptions & {
  /**
   * Default parcel dimensions when individual line items don't carry length/width/height.
   * Falls back to the dimensions of a Dab Pal 6-pack box.
   */
  default_parcel?: Partial<ShippoParcel>
  /**
   * Pad the parcel weight (oz) to account for box + packing material when
   * line item weights only reflect the product itself.
   */
  packaging_weight_oz?: number
}

type InjectedDependencies = {
  logger: Logger
}

/**
 * Each fulfillment option maps to a "tier" of Shippo rates. We don't preselect
 * the carrier; at price-calc time we pick the best rate that matches the tier.
 *
 * id -> human label, plus a filter that runs against a ShippoRate.
 */
const OPTION_TIERS: Record<
  string,
  { name: string; filter: (r: ShippoRate) => boolean }
> = {
  cheapest_ground: {
    name: "Standard Shipping (USPS / UPS Ground)",
    filter: (r) =>
      /ground|advantage/i.test(r.servicelevel?.name || "") ||
      r.attributes?.includes("CHEAPEST") === true,
  },
  cheapest_priority: {
    name: "Priority Shipping (2 Day)",
    filter: (r) => /priority|2nd day/i.test(r.servicelevel?.name || ""),
  },
  cheapest_express: {
    name: "Express Shipping (1 Day)",
    filter: (r) =>
      /express|next day/i.test(r.servicelevel?.name || "") &&
      !/express saver/i.test(r.servicelevel?.name || ""),
  },
}

type OptionData = {
  tier: keyof typeof OPTION_TIERS
}

type ShippingMethodData = {
  rate_id?: string
  carrier?: string
  service?: string
  shipment_id?: string
}

class ShippoProviderService extends AbstractFulfillmentProviderService {
  static identifier = "shippo"

  protected logger_: Logger
  protected options_: ShippoOptions
  protected client: ShippoClient

  constructor({ logger }: InjectedDependencies, options: ShippoOptions) {
    super()
    this.logger_ = logger
    this.options_ = options
    this.client = new ShippoClient(options)
  }

  /** Tiers we expose. Admin picks one of these when creating a shipping option. */
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return Object.entries(OPTION_TIERS).map(([id, tier]) => ({
      id,
      name: tier.name,
      tier: id,
    })) as unknown as FulfillmentOption[]
  }

  async canCalculate(_data: CreateShippingOptionDTO): Promise<boolean> {
    return true
  }

  /**
   * Build a Shippo shipment from the cart's from_location + shipping_address + items,
   * then return everything rated.
   */
  private async buildAndRateShipment({
    from_address,
    to_address,
    items,
  }: {
    from_address: {
      name?: string
      address?: Omit<
        StockLocationAddressDTO,
        "created_at" | "updated_at" | "deleted_at"
      >
    }
    to_address?: Omit<
      CartAddressDTO,
      "created_at" | "updated_at" | "deleted_at" | "id"
    >
    items: (CartLineItemDTO | OrderLineItemDTO)[]
  }): Promise<ShippoShipment> {
    if (!from_address?.address) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Stock location address required to compute Shippo rates"
      )
    }
    if (!to_address) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Shipping address required to compute Shippo rates"
      )
    }

    const ship_from: ShippoAddress = {
      name: from_address.name || "Dab Pal",
      company: from_address.name || "Dab Pal",
      street1: from_address.address.address_1 || "",
      street2: from_address.address.address_2 || undefined,
      city: from_address.address.city || "",
      state: from_address.address.province || "",
      zip: from_address.address.postal_code || "",
      country: (from_address.address.country_code || "US").toUpperCase(),
      phone: from_address.address.phone || undefined,
    }

    const ship_to: ShippoAddress = {
      name:
        [to_address.first_name, to_address.last_name]
          .filter(Boolean)
          .join(" ") || "Customer",
      company: to_address.company || undefined,
      street1: to_address.address_1 || "",
      street2: to_address.address_2 || undefined,
      city: to_address.city || "",
      state: to_address.province || "",
      zip: to_address.postal_code || "",
      country: (to_address.country_code || "US").toUpperCase(),
      phone: to_address.phone || undefined,
    }

    // Sum line item weights (Medusa stores weight in grams). Convert to oz so
    // we can speak USPS. Fall back to per-unit defaults if data is missing.
    const totalGrams = items.reduce((sum, item) => {
      // @ts-ignore variant.weight exists at runtime when item has a variant
      const perUnit = (item.variant?.weight as number | undefined) ?? 0
      const qty = Number(item.quantity || 0)
      return sum + perUnit * qty
    }, 0)
    const padOz = this.options_.packaging_weight_oz ?? 1.5
    const totalOz = totalGrams / 28.3495 + padOz

    const parcel: ShippoParcel = {
      length: this.options_.default_parcel?.length ?? "5",
      width: this.options_.default_parcel?.width ?? "4",
      height: this.options_.default_parcel?.height ?? "3",
      distance_unit: this.options_.default_parcel?.distance_unit ?? "in",
      weight: Math.max(1, Math.round(totalOz * 100) / 100).toFixed(2),
      mass_unit: this.options_.default_parcel?.mass_unit ?? "oz",
    }

    return await this.client.createShipment({
      address_from: ship_from,
      address_to: ship_to,
      parcels: [parcel],
    })
  }

  private pickRate(
    shipment: ShippoShipment,
    tier: keyof typeof OPTION_TIERS
  ): ShippoRate | undefined {
    const rates = shipment.rates || []
    if (!rates.length) return undefined
    const filter = OPTION_TIERS[tier]?.filter
    const matching = filter ? rates.filter(filter) : rates
    const pool = matching.length ? matching : rates
    return pool
      .slice()
      .sort((a, b) => Number(a.amount) - Number(b.amount))[0]
  }

  /**
   * Medusa calls this when refreshing carts and creating shipping options.
   * We rate fresh every time so prices reflect the current address.
   */
  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"],
    data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    const { tier } = (optionData as OptionData) || {}
    if (!tier || !OPTION_TIERS[tier]) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown Shippo tier in optionData: ${String(tier)}`
      )
    }

    const cached = data as ShippingMethodData
    if (cached?.rate_id) {
      // We already chose a rate during validateFulfillmentData. Return its amount
      // so we don't burn another API call on every cart refresh.
      const ship = cached.shipment_id
        ? await this.client.getShipment(cached.shipment_id)
        : null
      const rate = ship?.rates?.find((r) => r.object_id === cached.rate_id)
      if (rate) {
        return {
          calculated_amount: Math.round(Number(rate.amount) * 100),
          is_calculated_price_tax_inclusive: false,
        }
      }
    }

    const shipment = await this.buildAndRateShipment({
      from_address: {
        name: context.from_location?.name,
        address: context.from_location?.address,
      },
      to_address: context.shipping_address,
      items: context.items || [],
    })

    const rate = this.pickRate(shipment, tier)
    if (!rate) {
      this.logger_?.warn(
        `Shippo: no rate matched tier ${tier} for shipment ${shipment.object_id}`
      )
      return {
        calculated_amount: 0,
        is_calculated_price_tax_inclusive: false,
      }
    }

    return {
      calculated_amount: Math.round(Number(rate.amount) * 100),
      is_calculated_price_tax_inclusive: false,
    }
  }

  /**
   * Called once when the customer commits to a shipping method. We lock in the
   * rate so we can buy that exact label later in createFulfillment.
   */
  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const { tier } = (optionData as OptionData) || {}
    if (!tier || !OPTION_TIERS[tier]) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown Shippo tier: ${String(tier)}`
      )
    }

    const shipment = await this.buildAndRateShipment({
      // @ts-ignore framework provides these on context
      from_address: {
        // @ts-ignore
        name: context.from_location?.name,
        // @ts-ignore
        address: context.from_location?.address,
      },
      // @ts-ignore
      to_address: context.shipping_address,
      // @ts-ignore
      items: context.items || [],
    })

    const rate = this.pickRate(shipment, tier)
    if (!rate) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Shippo returned no rate for tier ${tier}`
      )
    }

    return {
      ...data,
      shipment_id: shipment.object_id,
      rate_id: rate.object_id,
      carrier: rate.provider,
      service: rate.servicelevel?.name,
    }
  }

  /**
   * Buy the label. Stores label_url + tracking on the fulfillment for the admin
   * UI's "Print label" button to surface.
   */
  async createFulfillment(
    data: Record<string, unknown>,
    _items: Record<string, unknown>[],
    _order: Record<string, unknown> | undefined,
    fulfillment: Record<string, unknown>
  ): Promise<CreateFulfillmentResult> {
    const { rate_id } = data as ShippingMethodData
    if (!rate_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cannot purchase Shippo label: rate_id missing on shipping method data"
      )
    }

    const tx = await this.client.createTransaction({ rate: rate_id })

    if (tx.status === "ERROR") {
      const msg = (tx.messages || []).map((m) => m.text).join("; ")
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Shippo label purchase failed: ${msg || "no message"}`
      )
    }

    return {
      data: {
        ...((fulfillment.data as object) || {}),
        transaction_id: tx.object_id,
        rate_id,
        label_url: tx.label_url,
        tracking_number: tx.tracking_number,
        tracking_url: tx.tracking_url_provider,
      },
      labels: tx.label_url
        ? [
            {
              tracking_number: tx.tracking_number || "",
              tracking_url: tx.tracking_url_provider || "",
              label_url: tx.label_url,
            },
          ]
        : ([] as CreateFulfillmentResult["labels"]),
    }
  }

  async cancelFulfillment(data: Record<string, unknown>): Promise<unknown> {
    const { transaction_id } = data as { transaction_id?: string }
    if (!transaction_id) return {}
    try {
      await this.client.refundTransaction(transaction_id)
    } catch (e) {
      // Outside the cancellation window (used label / >24h): swallow so the
      // Medusa-side fulfillment cancel still succeeds. Logged for ops review.
      this.logger_?.warn(
        `Shippo refund for ${transaction_id} failed (likely outside cancellation window): ${
          (e as Error).message
        }`
      )
    }
    return {}
  }

  /**
   * Default to "needs further action" so Medusa shows the order as
   * awaiting-shipment. We treat label purchase + tracking number as enough to
   * mark the fulfillment shipped via the admin. (See workflows/ for the
   * subscriber that flips this when Shippo's tracking webhook fires.)
   */
  async getFulfillmentDocuments(data: Record<string, unknown>): Promise<never[]> {
    return []
  }
}

export default ShippoProviderService
