import { MedusaContainer } from "@medusajs/framework/types"
import { isShippableOrder, ShippableOrder } from "./shippable-orders"
import { shippingAttempts } from "./shipping-attempts"
import { ShippingFulfillment, shippingProgress } from "./shipping-progress"

export async function shippingQueue(
  scope: MedusaContainer,
  orderIds?: string[],
) {
  const query = scope.resolve("query")
  const attempts = await shippingAttempts(orderIds)
  const byOrder = new Map(
    attempts.map((attempt) => [attempt.order_id, attempt]),
  )
  const orders: any[] = []
  // Walk pages so older unfinished labels do not vanish behind recent orders.
  for (let skip = 0; ; skip += 100) {
    const { data } = await query.graph({
      entity: "order",
      filters: orderIds ? { id: orderIds } : {},
      fields: [
        "id",
        "display_id",
        "email",
        "created_at",
        "status",
        "canceled_at",
        "metadata",
        "shipping_address.*",
        "items.id",
        "items.title",
        "items.quantity",
        "items.variant_sku",
        "items.requires_shipping",
        "items.metadata",
        "items.detail.fulfilled_quantity",
        "fulfillments.id",
        "fulfillments.data",
        "fulfillments.tracking_numbers",
        "fulfillments.created_at",
        "fulfillments.shipped_at",
        "fulfillments.delivered_at",
        "fulfillments.canceled_at",
      ],
      pagination: { take: 100, skip, order: { created_at: "DESC", id: "ASC" } },
    })
    orders.push(...data)
    if (data.length < 100) break
  }
  const progress = orders.flatMap((order) => {
    const attempt = byOrder.get(order.id)
    const fulfillments: ShippingFulfillment[] = order.fulfillments || []
    const entries = fulfillments.map(shippingProgress)
    if (!entries.length && attempt)
      entries.push({
        fulfillment_id: attempt.fulfillment_id || "",
        stage:
          attempt.state === "processing" &&
          Date.now() - new Date(attempt.updated_at).getTime() < 15 * 60 * 1000
            ? "processing"
            : "needs_attention",
        label_url: null,
        message:
          attempt.details.error ||
          "A label purchase was started but its fulfillment is not confirmed. Review the existing transaction before buying again.",
        tracking_number: attempt.details.tracking_number || null,
        tracking_url: attempt.details.tracking_url || null,
        carrier: attempt.details.carrier || null,
        service: attempt.details.service || null,
        batch_id: attempt.details.batch_id || null,
        transaction_id: attempt.details.transaction_id || null,
        batch_label_urls: [],
        email_status: "waiting_for_carrier",
      })
    return entries.map((entry) => ({
      ...entry,
      order_id: order.id,
      display_id: order.display_id,
      customer: [
        order.shipping_address?.first_name,
        order.shipping_address?.last_name,
      ]
        .filter(Boolean)
        .join(" "),
    }))
  })
  return {
    orders: orders.filter(
      (order: ShippableOrder) =>
        isShippableOrder(order) && !byOrder.has(order.id!),
    ),
    progress,
  }
}
