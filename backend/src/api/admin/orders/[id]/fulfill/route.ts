import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createOrderFulfillmentWorkflow } from "@medusajs/medusa/core-flows"
import { preSelectedRates } from "../../../../../modules/shippo/pre-selected-rates"
import { remainingShippableItems, isCanceledOrder, isRefundedOrder, ShippableOrder } from "../../../../../lib/shippable-orders"

/**
 * POST /admin/orders/:id/fulfill
 *
 * One-shot: stash the operator-selected Shippo rate, then run the standard
 * Medusa fulfillment workflow. The Shippo provider picks up the pre-selected
 * rate and skips re-rating.
 *
 * Body: { rate_object_id: string }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderId = req.params.id as string
  const { rate_object_id } = req.body as { rate_object_id?: string }

  if (!rate_object_id) {
    res.status(400).json({ error: "rate_object_id required" })
    return
  }

  // Pull order items + location
  const query = req.scope.resolve("query")
  const { data: orders } = await query.graph({
    entity: "order",
    filters: { id: orderId },
    fields: [
      "id",
      "status",
      "canceled_at",
      "fulfillments.id",
      "items.id",
      "items.quantity",
      "items.requires_shipping",
      "items.detail.fulfilled_quantity",
      "items.detail.quantity",
    ],
  })

  const order = orders?.[0] as Record<string, unknown> | undefined
  if (!order) {
    res.status(404).json({ error: "Order not found" })
    return
  }

  const shippingOrder = order as ShippableOrder
  if (isCanceledOrder(shippingOrder) || isRefundedOrder(shippingOrder) || shippingOrder.fulfillments?.length) {
    res.status(409).json({ error: "This order is not available for a new label. Review its shipping progress." })
    return
  }
  const items = remainingShippableItems(shippingOrder)

  if (!items.length) {
    res.status(400).json({ error: "No items found on this order" })
    return
  }

  // Stash the rate — the Shippo provider will consume it during createFulfillment
  preSelectedRates.set(orderId, rate_object_id)

  try {
    await createOrderFulfillmentWorkflow(req.scope).run({
      input: {
        order_id: orderId,
        items,
        no_notification: false,
      },
    })
  } catch (e) {
    // Clean up stale entry if workflow blew up before the provider ran
    preSelectedRates.delete(orderId)
    res.status(500).json({ error: (e as Error).message })
    return
  }

  // Pull back the fulfillment to return label data to the widget
  const { data: fulfillments } = await query.graph({
    entity: "fulfillment",
    filters: { order_id: orderId },
    fields: ["id", "data", "tracking_numbers", "created_at", "shipped_at"],
  })

  const latest = fulfillments
    ?.slice()
    .sort((a, b) => {
      const ad = (a as Record<string, unknown>)
      const bd = (b as Record<string, unknown>)
      return Date.parse(String(bd.created_at)) - Date.parse(String(ad.created_at))
    })[0] as Record<string, unknown> | undefined

  const fdata = (latest?.data || {}) as Record<string, unknown>
  res.status(200).json({
    fulfillment_id: latest?.id,
    label_url: fdata.label_url,
    tracking_number: fdata.tracking_number,
    tracking_url: fdata.tracking_url,
    carrier: fdata.carrier,
    service: fdata.service,
  })
}
