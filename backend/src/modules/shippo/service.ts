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
import { preSelectedRates } from "./pre-selected-rates"
import {
  ShippoAddress,
  ShippoAddressWithValidation,
  ShippoLiveRateLineItem,
  ShippoParcel,
} from "./types"

export type ShippoOptions = ShippoClientOptions & {
  /**
   * Default parcel dimensions when individual line items don't carry length/width/height.
   * Falls back to the dimensions of a Dab Pal poly mailer.
   * Note: when omitted entirely, Shippo uses the default Parcel Template configured
   * on /live-rates/settings/parcel-template, so this is mainly a safety net.
   */
  default_parcel?: Partial<ShippoParcel>
  /** Pad the parcel weight (oz) to account for box + filler. */
  packaging_weight_oz?: number
  /** From-address email sent to Shippo (required by their API). */
  from_email?: string
  /** Default ship-from address. Used when the fulfillment workflow doesn't surface the stock location address. */
  default_from?: {
    name?: string
    company?: string
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
    country?: string
    phone?: string
  }
  /**
   * Fallback map from Medusa shipping_option_id → Shippo service group data.
   * Used in createFulfillment when the shipping method data has no service_group_id
   * (e.g. orders placed before the Shippo provider was wired to the options).
   */
  shipping_option_data_map?: Record<
    string,
    { service_group_id: string; service_group_name: string }
  >
}

type InjectedDependencies = {
  logger: Logger
}

/**
 * Each fulfillment option corresponds to one Shippo Service Group (configured
 * in the Shippo dashboard, e.g. "Standard Shipping" / "Priority Shipping").
 * Stored in optionData so the calc and validate paths know which group to
 * pick out of the /live-rates response.
 */
type OptionData = {
  service_group_id: string
  service_group_name: string
}

type ShippingMethodData = {
  /**
   * Stashed during validate so calculatePrice doesn't have to re-rate every
   * cart refresh. We do still hit /live-rates on the first refresh after
   * address change, but once the customer commits to a method we lock the
   * computed amount.
   */
  amount?: number
  rate_object_id?: string
  shipment_object_id?: string
  carrier?: string
  service?: string
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

  /**
   * Pull the Service Groups configured in Shippo and expose each one as a
   * Medusa fulfillment option. Admin sees exactly what's set in Shippo,
   * automatically reflecting any service / markup / fallback changes made
   * over there. Cached for 5min to keep `getOptions` calls cheap.
   */
  private serviceGroupsCache: {
    fetched_at: number
    groups: { object_id: string; name: string; description: string }[]
  } | null = null

  private async getServiceGroups() {
    const now = Date.now()
    if (
      this.serviceGroupsCache &&
      now - this.serviceGroupsCache.fetched_at < 5 * 60 * 1000
    ) {
      return this.serviceGroupsCache.groups
    }
    const groups = await this.client.listServiceGroups()
    const active = groups
      .filter((g) => g.is_active && g.type === "LIVE_RATE")
      .map((g) => ({
        object_id: g.object_id,
        name: g.name,
        description: g.description,
      }))
    this.serviceGroupsCache = { fetched_at: now, groups: active }
    return active
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    const groups = await this.getServiceGroups()
    return groups.map(
      (g) =>
        ({
          id: g.object_id,
          name: `${g.name} (${g.description})`,
          service_group_id: g.object_id,
          service_group_name: g.name,
        }) as unknown as FulfillmentOption
    )
  }

  async canCalculate(_data: CreateShippingOptionDTO): Promise<boolean> {
    return true
  }

  // ------- helpers shared between calc / validate / fulfill -------

  private toShippoAddress(
    fromOrTo: "from" | "to",
    src:
      | (Omit<
          StockLocationAddressDTO,
          "created_at" | "updated_at" | "deleted_at"
        > & { name?: string; company?: string })
      | (Omit<
          CartAddressDTO,
          "created_at" | "updated_at" | "deleted_at" | "id"
        > & { first_name?: string | null; last_name?: string | null })
  ): ShippoAddress {
    const a = src as Record<string, unknown>
    const name =
      fromOrTo === "from"
        ? (a.name as string) || "Dab Pal"
        : [a.first_name, a.last_name]
            .filter((p) => typeof p === "string" && p)
            .join(" ") || "Customer"
    return {
      name,
      company: (a.company as string) || (fromOrTo === "from" ? "Dab Pal" : undefined),
      street1: (a.address_1 as string) || "",
      street2: (a.address_2 as string) || undefined,
      city: (a.city as string) || "",
      state: (a.province as string) || "",
      zip: (a.postal_code as string) || "",
      country: ((a.country_code as string) || "US").toUpperCase(),
      phone: (a.phone as string) || undefined,
      email:
        (a.email as string) ||
        (fromOrTo === "from" ? this.options_.from_email || "hello@thedabpal.com" : undefined),
    }
  }

  private buildLineItems(
    items: (CartLineItemDTO | OrderLineItemDTO)[]
  ): ShippoLiveRateLineItem[] {
    return items.map((item) => {
      // @ts-ignore variant.weight, unit_price, etc. exist at runtime
      const weightG = (item.variant?.weight as number | undefined) ?? 0
      const weightOz = Math.max(0.1, weightG / 28.3495)
      // @ts-ignore unit_price is typed as BigNumberValue but converts cleanly
      const unitPrice = Number(item.unit_price ?? 0) / 100
      return {
        quantity: Number(item.quantity || 1),
        total_price: (unitPrice * Number(item.quantity || 1)).toFixed(2),
        currency: "USD",
        weight: weightOz.toFixed(2),
        weight_unit: "oz",
        title: (item.title as string) || (item.product_title as string) || "Item",
        // @ts-ignore variant_sku exists on cart line items
        sku: (item.variant_sku as string) || undefined,
        manufacture_country: "US",
      }
    })
  }

  private buildParcel(
    items: (CartLineItemDTO | OrderLineItemDTO)[]
  ): ShippoParcel | undefined {
    // If we have explicit defaults configured, send them. Otherwise omit so
    // Shippo uses the Default Parcel Template from the dashboard.
    const dp = this.options_.default_parcel
    if (!dp) return undefined

    const totalGrams = items.reduce((sum, item) => {
      // @ts-ignore
      const perUnit = (item.variant?.weight as number | undefined) ?? 0
      return sum + perUnit * Number(item.quantity || 0)
    }, 0)
    const padOz = this.options_.packaging_weight_oz ?? 1
    const totalOz = totalGrams / 28.3495 + padOz

    return {
      length: dp.length ?? "6",
      width: dp.width ?? "4",
      height: dp.height ?? "1",
      distance_unit: dp.distance_unit ?? "in",
      weight: Math.max(1, Math.round(totalOz * 100) / 100).toFixed(2),
      mass_unit: dp.mass_unit ?? "oz",
    }
  }

  /**
   * Hit /live-rates with cart context, return the row matching this option's
   * Service Group. Falls back to the group's flat_rate (configured in Shippo
   * dashboard) if no live row matches.
   */
  private async getLiveRateForGroup({
    optionData,
    context,
  }: {
    optionData: OptionData
    context: CalculateShippingOptionPriceDTO["context"]
  }): Promise<{
    amount_cents: number
    title?: string
    description?: string
  }> {
    if (!context?.from_location?.address) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Stock location address required for Shippo live rates"
      )
    }
    if (!context?.shipping_address) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Shipping address required for Shippo live rates"
      )
    }

    const address_from = this.toShippoAddress("from", {
      ...context.from_location.address,
      name: context.from_location.name,
    })
    const address_to = this.toShippoAddress("to", context.shipping_address)
    const items = context.items || []

    const live = await this.client.getLiveRates({
      address_from,
      address_to,
      line_items: this.buildLineItems(items),
      parcel: this.buildParcel(items),
    })

    const groupName = optionData.service_group_name?.toLowerCase()
    const match = live.results.find(
      (r) => r.title.toLowerCase() === groupName
    )

    if (match) {
      return {
        amount_cents: Math.round(Number(match.amount) * 100),
        title: match.title,
        description: match.description,
      }
    }

    // No live row matched. Fall back to the group's configured flat_rate.
    const group = (await this.getServiceGroups()).find(
      (g) => g.object_id === optionData.service_group_id
    )
    if (!group) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Service group ${optionData.service_group_id} no longer exists in Shippo`
      )
    }
    // Re-pull the full group to get flat_rate (cached version drops it).
    const full = (await this.client.listServiceGroups()).find(
      (g) => g.object_id === optionData.service_group_id
    )
    const fallback = Number(full?.flat_rate || 0)
    this.logger_?.warn(
      `Shippo: no live rate for "${optionData.service_group_name}", falling back to flat_rate $${fallback}`
    )
    return {
      amount_cents: Math.round(fallback * 100),
      title: group.name,
      description: group.description,
    }
  }

  // ------- AbstractFulfillmentProviderService implementations -------

  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"],
    data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    const cached = data as ShippingMethodData
    if (typeof cached?.amount === "number") {
      return {
        calculated_amount: cached.amount,
        is_calculated_price_tax_inclusive: false,
      }
    }

    const od = optionData as OptionData
    if (!od?.service_group_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Shippo shipping option missing service_group_id in optionData"
      )
    }

    const { amount_cents } = await this.getLiveRateForGroup({
      optionData: od,
      context,
    })

    return {
      calculated_amount: amount_cents,
      is_calculated_price_tax_inclusive: false,
    }
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const od = optionData as OptionData
    if (!od?.service_group_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Shippo shipping option missing service_group_id"
      )
    }

    // @ts-ignore framework provides full context shape
    const { amount_cents, title, description } = await this.getLiveRateForGroup(
      // @ts-ignore
      { optionData: od, context }
    )

    return {
      ...data,
      amount: amount_cents,
      service_group_id: od.service_group_id,
      service_group_name: od.service_group_name,
      service_title: title,
      service_description: description,
    }
  }

  /**
   * Buy the actual label.
   *
   * /live-rates results don't carry a transactable rate.object_id (they're
   * pre-aggregated). To purchase a label we re-create a /shipments rate
   * using the Service Group's underlying carrier/service token, then call
   * /transactions on the matching rate.
   */
  async createFulfillment(
    data: Record<string, unknown>,
    _items: Record<string, unknown>[],
    order: Record<string, unknown> | undefined,
    fulfillment: Record<string, unknown>
  ): Promise<CreateFulfillmentResult> {
    const md = data as ShippingMethodData & { service_group_id?: string }

    // Fast path: operator pre-selected a rate in the admin widget.
    // Skip shipment creation + service-group matching; buy the exact rate.
    const orderId = (order as Record<string, unknown> | undefined)?.id as string | undefined
    const preSelectedRateId = orderId ? preSelectedRates.get(orderId) : undefined
    if (preSelectedRateId) {
      preSelectedRates.delete(orderId!)
      const tx = await this.client.createTransaction({ rate: preSelectedRateId })
      if (tx.status === "ERROR") {
        const msg = (tx.messages || []).map((m) => m.text).join("; ")
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Shippo label purchase failed: ${msg || "no message"}`)
      }
      if (tx.tracking_number && tx.provider) {
        await this.registerTracking({
          carrier: tx.provider.toLowerCase(),
          tracking_number: tx.tracking_number,
          fulfillment_id: (fulfillment.id as string | undefined) ?? undefined,
        })
      }
      return {
        data: {
          ...((fulfillment.data as object) || {}),
          transaction_id: tx.object_id,
          label_url: tx.label_url,
          tracking_number: tx.tracking_number,
          tracking_url: tx.tracking_url_provider,
          carrier: tx.provider,
          service: tx.servicelevel?.name,
        },
        labels: tx.label_url
          ? [{ tracking_number: tx.tracking_number || "", tracking_url: tx.tracking_url_provider || "", label_url: tx.label_url }]
          : [],
      }
    }

    // service_group_id may be missing on orders placed before the Shippo provider
    // was wired to the shipping option (they were manual_manual at order time).
    // Fall back chain:
    //   1. method data (set by validateFulfillmentData for new orders)
    //   2. shipping_option.data if hydrated on the fulfillment object
    //   3. shipping_option_data_map in provider options (keyed by shipping_option_id)
    const shippingOptionId = (fulfillment?.shipping_option_id as string | undefined)
      ?? (fulfillment?.shipping_option as Record<string, unknown> | undefined)?.id as string | undefined
    const mapEntry = shippingOptionId
      ? this.options_.shipping_option_data_map?.[shippingOptionId]
      : undefined
    const serviceGroupId: string | undefined =
      md.service_group_id ??
      // @ts-ignore fulfillment.shipping_option may be hydrated
      ((fulfillment?.shipping_option as Record<string, unknown> | undefined)
        ?.data as Record<string, unknown> | undefined
      )?.service_group_id as string | undefined ??
      mapEntry?.service_group_id

    // Look up the Service Group's underlying service token (e.g. usps_ground_advantage).
    const groups = await this.client.listServiceGroups()
    const group = groups.find((g) => g.object_id === serviceGroupId)
    if (!group?.service_levels?.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot purchase Shippo label: service group ${serviceGroupId} has no service levels`
      )
    }
    const wantedTokens = new Set(
      // @ts-ignore service_levels exists in dashboard groups
      (group.service_levels as { service_level_token: string }[]).map(
        (s) => s.service_level_token
      )
    )

    const toAddress = (order as Record<string, unknown>)?.shipping_address
    if (!toAddress) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order shipping address missing for Shippo label purchase"
      )
    }

    const items = ((order as Record<string, unknown>)?.items ||
      []) as (CartLineItemDTO | OrderLineItemDTO)[]

    // Resolve from-address in priority order:
    //   1. from_location stashed on method data by validateFulfillmentData (when Medusa surfaces it)
    //   2. default_from configured in provider options
    //   3. throw — we refuse to send a label with the customer's address as origin
    const fromSrc: Record<string, unknown> | null =
      (md as { from_location?: unknown })?.from_location
        ? // @ts-ignore
          { ...(md as any).from_location.address, name: (md as any).from_location.name }
        : this.options_.default_from
          ? {
              address_1: this.options_.default_from.street1,
              address_2: this.options_.default_from.street2,
              city: this.options_.default_from.city,
              province: this.options_.default_from.state,
              postal_code: this.options_.default_from.zip,
              country_code: (this.options_.default_from.country || "US").toLowerCase(),
              phone: this.options_.default_from.phone,
              name: this.options_.default_from.name || "Dab Pal",
              company: this.options_.default_from.company,
            }
          : null

    if (!fromSrc) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Shippo: no from-address available. Set default_from in provider options."
      )
    }

    const shipment = await this.client.createShipment({
      address_from: this.toShippoAddress("from", fromSrc as never),
      address_to: this.toShippoAddress(
        "to",
        toAddress as Record<string, unknown> as never
      ),
      parcels: [
        this.buildParcel(items) || {
          length: "6",
          width: "4",
          height: "1",
          distance_unit: "in",
          weight: "4",
          mass_unit: "oz",
        },
      ],
    })

    const rate = (shipment.rates || [])
      .filter((r) =>
        wantedTokens.has(r.servicelevel?.token as string)
      )
      .sort((a, b) => Number(a.amount) - Number(b.amount))[0]

    if (!rate) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Shippo: no rate matched service group "${group.name}" for label purchase. Tokens wanted: ${Array.from(wantedTokens).join(", ")}`
      )
    }

    const tx = await this.client.createTransaction({ rate: rate.object_id })
    if (tx.status === "ERROR") {
      const msg = (tx.messages || []).map((m) => m.text).join("; ")
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Shippo label purchase failed: ${msg || "no message"}`
      )
    }

    // Register a tracking webhook so subsequent USPS scans update Medusa
    // automatically. Failures don't block the label purchase.
    if (tx.tracking_number && rate.provider) {
      await this.registerTracking({
        carrier: rate.provider.toLowerCase(),
        tracking_number: tx.tracking_number,
        fulfillment_id:
          (fulfillment.id as string | undefined) ?? undefined,
      })
    }

    return {
      data: {
        ...((fulfillment.data as object) || {}),
        transaction_id: tx.object_id,
        shipment_id: shipment.object_id,
        rate_id: rate.object_id,
        service_group_id: serviceGroupId,
        carrier: rate.provider,
        service: rate.servicelevel?.name,
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
      this.logger_?.warn(
        `Shippo refund for ${transaction_id} failed (likely outside cancellation window): ${
          (e as Error).message
        }`
      )
    }
    return {}
  }

  async getFulfillmentDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  // ------- public helpers (called from API routes / subscribers) -------

  /**
   * Validate a shipping address against Shippo's address-correction service.
   * Returns a normalized `{ valid, suggestion?, messages[] }` so storefront
   * can either accept the address or surface a correction.
   */
  async validateAddress(input: {
    name?: string
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
    country?: string
    phone?: string
    email?: string
  }): Promise<{
    valid: boolean
    suggestion?: ShippoAddress
    messages: { code?: string; text: string }[]
  }> {
    const result: ShippoAddressWithValidation =
      await this.client.createAndValidateAddress({
        name: input.name,
        street1: input.street1,
        street2: input.street2,
        city: input.city,
        state: input.state,
        zip: input.zip,
        country: (input.country || "US").toUpperCase(),
        phone: input.phone,
        email: input.email,
      })

    const isValid =
      result.validation_results?.is_valid === true ||
      result.is_complete === true

    return {
      valid: !!isValid,
      // Shippo returns the corrected version inline; surface it so the UI
      // can offer "did you mean ...?".
      suggestion: isValid
        ? {
            name: result.name,
            company: result.company,
            street1: result.street1,
            street2: result.street2,
            city: result.city,
            state: result.state,
            zip: result.zip,
            country: result.country,
            phone: result.phone,
            email: result.email,
          }
        : undefined,
      messages: result.validation_results?.messages || [],
    }
  }

  /**
   * Register a tracking webhook with Shippo for a carrier+tracking_number
   * pair. Called from createFulfillment after we have a label, so that
   * subsequent USPS scans flow back to /hooks/shippo/tracking and update
   * the Medusa fulfillment status.
   */
  async registerTracking(input: {
    carrier: string
    tracking_number: string
    fulfillment_id?: string
  }): Promise<void> {
    if (!input.carrier || !input.tracking_number) return
    try {
      await this.client.registerTracking({
        carrier: input.carrier,
        tracking_number: input.tracking_number,
        metadata: input.fulfillment_id,
      })
    } catch (e) {
      this.logger_?.warn(
        `Shippo tracking webhook register failed for ${input.tracking_number}: ${
          (e as Error).message
        }`
      )
    }
  }
}

export default ShippoProviderService
