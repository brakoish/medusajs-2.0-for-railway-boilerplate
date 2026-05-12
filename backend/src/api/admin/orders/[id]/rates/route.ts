import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ShippoClient } from "../../../../../modules/shippo/client"

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
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.address_1",
      "shipping_address.address_2",
      "shipping_address.city",
      "shipping_address.province",
      "shipping_address.postal_code",
      "shipping_address.country_code",
      "items.quantity",
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

  const apiToken = process.env.SHIPPO_API_TOKEN
  if (!apiToken) {
    return res.status(503).json({ error: "SHIPPO_API_TOKEN not configured" })
  }

  const client = new ShippoClient({ api_token: apiToken })

  const items = (order.items as Record<string, unknown>[]) || []
  const totalGrams = items.reduce((sum: number, item: Record<string, unknown>) => {
    const variant = item.variant as Record<string, unknown> | undefined
    const perUnit = (variant?.weight as number | undefined) ?? 0
    return sum + perUnit * Number(item.quantity || 1)
  }, 0)
  // Variant weights are actual packaged weights — no extra padding needed
  const totalOz = Math.max(1, Math.round((totalGrams / 28.3495) * 100) / 100)

  // Pick parcel dimensions based on what's in the order.
  // 1-pack: 6x9 poly mailer; 3-pack: 8x8; 6-pack: 8x9.
  // If an order mixes pack sizes, use the largest.
  const skus = items.map((i) => (i.variant_sku as string | undefined) ?? "")
  const has6 = skus.some((s) => s.includes("-6-"))
  const has3 = skus.some((s) => s.includes("-3-"))
  const [pLen, pWid, pHgt] = has6 ? ["8","9","3"] : has3 ? ["8","8","2"] : ["6","9","1"]

  const toCity = shippingAddr.city as string
  const toState = shippingAddr.province as string
  const toZip = shippingAddr.postal_code as string

  interface Rate {
    object_id: string
    provider: string
    servicelevel?: { name?: string; token?: string }
    amount: string
    currency: string
    estimated_days?: number
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
      address_to: {
        name: [shippingAddr.first_name, shippingAddr.last_name].filter(Boolean).join(" ") || "Customer",
        street1: (shippingAddr.address_1 as string) || "",
        street2: (shippingAddr.address_2 as string) || undefined,
        city: toCity,
        state: toState,
        zip: toZip,
        country: ((shippingAddr.country_code as string) || "US").toUpperCase(),
      },
      parcels: [
        {
          length: pLen,
          width: pWid,
          height: pHgt,
          distance_unit: "in",
          weight: String(totalOz),
          mass_unit: "oz",
        },
      ],
    })
    rates = (shipment.rates || []) as Rate[]
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }

  // Deduplicate
  const seen = new Set<string>()
  const unique = rates.filter((r) => {
    const key = `${r.provider}|${r.servicelevel?.token}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  res.json({
    order_id: orderId,
    to: `${toCity}, ${toState} ${toZip}`,
    weight_oz: totalOz,
    rates: unique
      .sort((a, b) => Number(a.amount) - Number(b.amount))
      .map((r) => ({
        object_id: r.object_id,
        carrier: r.provider,
        service: r.servicelevel?.name,
        service_token: r.servicelevel?.token,
        amount: Number(r.amount),
        currency: r.currency,
        estimated_days: r.estimated_days ?? null,
      })),
  })
}
