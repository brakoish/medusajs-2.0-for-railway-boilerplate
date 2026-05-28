import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ShippoClient } from "../../../../modules/shippo/client"

/**
 * POST /admin/bulk-fulfill/rates
 * Body: { order_ids: string[] }
 *
 * Fetches Shippo rates for all given orders in parallel.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { order_ids } = req.body as { order_ids: string[] }
  if (!order_ids?.length) return res.status(400).json({ error: "order_ids required" })

  const apiToken = process.env.SHIPPO_API_TOKEN
  if (!apiToken) return res.status(503).json({ error: "SHIPPO_API_TOKEN not configured" })

  const query = req.scope.resolve("query")
  const client = new ShippoClient({ api_token: apiToken })

  const results = await Promise.all(
    order_ids.map(async (orderId) => {
      try {
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
            "items.quantity",
            "items.variant_sku",
            "items.variant.weight",
          ],
        })

        const order = orders?.[0] as any
        if (!order) return { order_id: orderId, error: "Order not found", rates: [] }

        const addr = order.shipping_address
        const items = order.items || []
        const totalGrams = items.reduce((sum: number, item: any) => {
          const w = item.variant?.weight ?? 0
          return sum + w * Number(item.quantity || 1)
        }, 0)
        const totalOz = Math.max(1, Math.round((totalGrams / 28.3495) * 100) / 100)

        const skus = items.map((i: any) => i.variant_sku ?? "")
        const has6 = skus.some((s: string) => s.includes("-6-"))
        const has3 = skus.some((s: string) => s.includes("-3-"))
        const [pLen, pWid, pHgt] = has6 ? ["8","9","3"] : has3 ? ["8","8","2"] : ["4","6","1"]

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
            phone: process.env.SHIPPO_FROM_PHONE || "9709034749",
          },
          address_to: {
            name: [addr.first_name, addr.last_name].filter(Boolean).join(" ") || "Customer",
            street1: addr.address_1 || "",
            street2: addr.address_2 || undefined,
            city: addr.city,
            state: addr.province,
            zip: addr.postal_code,
            country: (addr.country_code || "US").toUpperCase(),
          },
          parcels: [{ length: pLen, width: pWid, height: pHgt, distance_unit: "in", weight: String(totalOz), mass_unit: "oz" }],
        })

        const rates = (shipment.rates || []).map((r: any) => ({
          object_id: r.object_id,
          carrier: r.provider,
          service: r.servicelevel?.name,
          service_token: r.servicelevel?.token,
          carrier_account: r.carrier_account,
          amount: Number(r.amount),
          currency: r.currency,
          estimated_days: r.estimated_days ?? null,
        })).sort((a: any, b: any) => a.amount - b.amount)

        return {
          order_id: orderId,
          display_id: order.display_id,
          name: [addr.first_name, addr.last_name].filter(Boolean).join(" "),
          address: `${addr.address_1}${addr.address_2 ? ` ${addr.address_2}` : ""}, ${addr.city}, ${addr.province} ${addr.postal_code}`,
          weight_oz: totalOz,
          rates,
        }
      } catch (e) {
        return { order_id: orderId, error: (e as Error).message, rates: [] }
      }
    })
  )

  res.json({ results })
}
