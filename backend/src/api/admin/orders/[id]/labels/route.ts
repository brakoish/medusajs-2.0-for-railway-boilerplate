import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /admin/orders/:id/labels
 *
 * Returns all shipping labels attached to fulfillments on this order.
 * Used by the admin UI widget to show "Print Label" buttons.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderId = req.params.id as string
  const query = req.scope.resolve("query")

  // Pull the order with fulfillments expanded
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "fulfillments.id",
      "fulfillments.provider_id",
      "fulfillments.data",
      "fulfillments.tracking_numbers",
      "fulfillments.created_at",
      "fulfillments.shipped_at",
      "fulfillments.delivered_at",
    ],
    filters: { id: orderId },
  })

  const order = orders?.[0]
  if (!order) {
    res.status(404).json({ message: "Order not found" })
    return
  }

  // Extract label data from each fulfillment's provider data
  const labels = (order.fulfillments || [])
    .map((f: Record<string, unknown>) => {
      const data = (f.data || {}) as Record<string, unknown>
      return {
        fulfillment_id: f.id,
        provider_id: f.provider_id,
        tracking_number: data.tracking_number || f.tracking_numbers?.[0] || null,
        tracking_url: data.tracking_url || null,
        label_url: data.label_url || null,
        carrier: data.carrier || null,
        service: data.service || null,
        transaction_id: data.transaction_id || null,
        tracking_status: data.tracking_status || null,
        tracking_history: data.tracking_history || [],
        created_at: f.created_at,
        shipped_at: f.shipped_at,
        delivered_at: f.delivered_at,
      }
    })
    .filter((l: { label_url: unknown }) => l.label_url)

  res.status(200).json({
    order_id: order.id,
    display_id: order.display_id,
    labels,
  })
}
