import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IOrderModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

type BulkOrderLineItem = {
  quantity?: number
  requires_shipping?: boolean
  detail?: {
    fulfilled_quantity?: number
  }
}

type BulkOrder = {
  id?: string
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
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  const query = req.scope.resolve("query")

  const orders = await orderModuleService.listOrders(
    {},
    {
      take: 200,
      order: {
        created_at: "DESC",
      },
      relations: ["shipping_address", "items", "items.detail"],
    }
  )

  const pending = ((orders || []) as BulkOrder[]).filter(
    (order) => order.status !== "canceled" && hasRemainingShippableItems(order)
  )
  const pendingIds = pending.map((order) => order.id).filter(Boolean)

  if (!pendingIds.length) {
    return res.json({ orders: [] })
  }

  const { data: fulfillments = [] } = await query.graph({
    entity: "fulfillment",
    filters: {
      order_id: pendingIds,
    },
    fields: ["id", "order_id"],
  })

  const fulfilledOrderIds = new Set(
    (fulfillments as { order_id?: string }[])
      .map((fulfillment) => fulfillment.order_id)
      .filter(Boolean)
  )

  res.json({ orders: pending.filter((order) => !fulfilledOrderIds.has(order.id || "")) })
}
