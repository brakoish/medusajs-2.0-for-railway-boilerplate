import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /admin/bulk-fulfill/orders
 *
 * Returns all unfulfilled orders with address + items for the bulk fulfill UI.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query")

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "status", "fulfillment_status", "email", "created_at", "shipping_address.first_name", "shipping_address.last_name", "shipping_address.address_1", "shipping_address.address_2", "shipping_address.city", "shipping_address.province", "shipping_address.postal_code", "shipping_address.country_code", "items.id", "items.title", "items.variant_sku", "items.quantity", "items.detail.fulfilled_quantity"],
  })

  const pendingStatuses = new Set(["not_fulfilled", "partially_fulfilled"])

  // Only include orders where there are still items to fulfill
  const pending = (orders || []).filter((o: any) => {
    if (o.status === "canceled") return false
    if (!pendingStatuses.has(o.fulfillment_status)) return false

    const items = o.items || []
    return items.some((i: any) => {
      const fulfilled = Number(i.detail?.fulfilled_quantity ?? 0)
      return Number(i.quantity) > fulfilled
    })
  })

  res.json({ orders: pending })
}
