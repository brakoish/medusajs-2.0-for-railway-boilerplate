import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

type BulkOrderLineItem = {
  quantity?: number
  requires_shipping?: boolean
  detail?: {
    fulfilled_quantity?: number
  }
}

type BulkOrder = {
  status?: string
  items?: BulkOrderLineItem[]
}

const remainingQuantity = (item: BulkOrderLineItem) => {
  const quantity = Number(item.quantity ?? 0)
  const fulfilled = Number(item.detail?.fulfilled_quantity ?? 0)

  return Math.max(0, quantity - fulfilled)
}

const hasRemainingShippableItems = (order: BulkOrder) =>
  (order.items || []).some(
    (item) => item.requires_shipping !== false && remainingQuantity(item) > 0
  )

/**
 * GET /admin/bulk-fulfill/orders
 *
 * Returns all unfulfilled orders with address + items for the bulk fulfill UI.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query")

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "status", "fulfillment_status", "email", "created_at", "shipping_address.first_name", "shipping_address.last_name", "shipping_address.address_1", "shipping_address.address_2", "shipping_address.city", "shipping_address.province", "shipping_address.postal_code", "shipping_address.country_code", "items.id", "items.title", "items.variant_sku", "items.quantity", "items.requires_shipping", "items.detail.fulfilled_quantity"],
  })

  const pending = ((orders || []) as BulkOrder[]).filter(
    (order) => order.status !== "canceled" && hasRemainingShippableItems(order)
  )

  res.json({ orders: pending })
}
