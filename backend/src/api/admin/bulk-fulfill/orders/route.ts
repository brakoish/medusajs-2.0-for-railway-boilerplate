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
  canceled_at?: string | Date | null
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

const isCanceledOrder = (order: BulkOrder) =>
  order.status === "canceled" || Boolean(order.canceled_at)

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
    (order) => !isCanceledOrder(order) && hasRemainingShippableItems(order)
  )
  const pendingIds = pending.map((order) => order.id).filter(Boolean)

  if (!pendingIds.length) {
    return res.json({ orders: [] })
  }

  const { data: ordersWithFulfillments = [] } = await query.graph({
    entity: "order",
    filters: {
      id: pendingIds,
    },
    fields: ["id", "fulfillments.id"],
  })

  const fulfilledOrderIds = new Set(
    (ordersWithFulfillments as { id?: string; fulfillments?: { id?: string }[] }[])
      .filter((order) => (order.fulfillments || []).length > 0)
      .map((order) => order.id)
      .filter(Boolean)
  )

  res.json({ orders: pending.filter((order) => !fulfilledOrderIds.has(order.id || "")) })
}
