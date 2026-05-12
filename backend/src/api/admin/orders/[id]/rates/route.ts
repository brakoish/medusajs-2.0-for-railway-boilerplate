import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import ShippoProviderService from "../../../../../modules/shippo/service"

/**
 * GET /admin/orders/:id/rates
 *
 * Returns live Shippo rates for this order so the admin widget can
 * show pricing before the operator clicks "Create Fulfillment".
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void | MedusaResponse> {
  const orderId = req.params.id as string
  const query = req.scope.resolve("query")

  const { data: orders } = await query.graph({
    entity: "order",
    filters: { id: orderId },
    fields: [
      "id",
      "display_id",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.address_1",
      "shipping_address.address_2",
      "shipping_address.city",
      "shipping_address.province",
      "shipping_address.postal_code",
      "shipping_address.country_code",
      "shipping_address.phone",
      "items.title",
      "items.quantity",
      "items.variant_sku",
      "items.unit_price",
      "items.variant.weight",
    ],
  })

  if (!orders?.length) {
    return res.status(404).json({ error: "Order not found" })
  }

  const order = orders[0] as Record<string, unknown>
  const shippingAddr = order.shipping_address as Record<string, unknown> | null

  if (!shippingAddr) {
    return res.status(400).json({ error: "Order has no shipping address" })
  }

  // Resolve the Shippo provider
  const fulfillmentModule = req.scope.resolve(Modules.FULFILLMENT)
  // @ts-ignore provider resolution
  const provider = await fulfillmentModule.retrieveFulfillmentProvider?.("shippo_shippo")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch(() => null) as ShippoProviderService | null

  // Fall back: resolve via the module registry
  let shippo: ShippoProviderService | null = provider
  if (!shippo) {
    try {
      shippo = req.scope.resolve("shippo_shippo") as ShippoProviderService
    } catch {
      // not registered under that key
    }
  }

  if (!shippo) {
    return res.status(503).json({ error: "Shippo provider not available" })
  }

  const items = (order.items as Record<string, unknown>[]) || []

  // Build parcels from item weights (same logic as ShippoProviderService.buildParcel)
  const totalGrams = items.reduce((sum: number, item: Record<string, unknown>) => {
    const variant = item.variant as Record<string, unknown> | undefined
    const perUnit = (variant?.weight as number | undefined) ?? 0
    return sum + perUnit * Number(item.quantity || 1)
  }, 0)
  const totalOz = Math.max(1, totalGrams / 28.3495 + 1)

  const toAddr = {
    name: [shippingAddr.first_name, shippingAddr.last_name].filter(Boolean).join(" ") || "Customer",
    street1: (shippingAddr.address_1 as string) || "",
    street2: (shippingAddr.address_2 as string) || undefined,
    city: (shippingAddr.city as string) || "",
    state: (shippingAddr.province as string) || "",
    zip: (shippingAddr.postal_code as string) || "",
    country: ((shippingAddr.country_code as string) || "US").toUpperCase(),
  }

  // @ts-ignore access client directly
  const client = shippo.client as {
    createShipment: (input: Record<string, unknown>) => Promise<{ rates?: Rate[] }>
  }

  interface Rate {
    object_id: string
    provider: string
    servicelevel?: { name?: string; token?: string }
    amount: string
    currency: string
    estimated_days?: number
    duration_terms?: string
  }

  let rates: Rate[] = []
  try {
    const shipment = await client.createShipment({
      address_from: {
        name: "Dab Pal",
        company: "Dab Pal",
        street1: "361 Stagg St #201",
        city: "Brooklyn",
        state: "NY",
        zip: "11206",
        country: "US",
        email: "hello@thedabpal.com",
      },
      address_to: toAddr,
      parcels: [
        {
          length: "9",
          width: "6",
          height: "2",
          distance_unit: "in",
          weight: Math.round(totalOz * 100) / 100,
          mass_unit: "oz",
        },
      ],
    })
    rates = shipment.rates || []
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }

  // Deduplicate (Shippo sometimes returns dupes for multi-carrier accounts)
  const seen = new Set<string>()
  const unique = rates.filter((r) => {
    const key = `${r.provider}|${r.servicelevel?.token}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const formatted = unique
    .sort((a, b) => Number(a.amount) - Number(b.amount))
    .map((r) => ({
      object_id: r.object_id,
      carrier: r.provider,
      service: r.servicelevel?.name,
      service_token: r.servicelevel?.token,
      amount: Number(r.amount),
      currency: r.currency,
      estimated_days: r.estimated_days,
      duration_terms: r.duration_terms,
    }))

  res.json({
    order_id: orderId,
    to: `${toAddr.city}, ${toAddr.state} ${toAddr.zip}`,
    weight_oz: Math.round(totalOz * 10) / 10,
    rates: formatted,
  })
}
