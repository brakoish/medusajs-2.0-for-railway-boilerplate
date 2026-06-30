type QueryGraph = {
  graph(input: {
    entity: string
    filters?: Record<string, unknown>
    fields: string[]
  }): Promise<{ data?: ShippableOrder[] }>
}

export type ShippableLineItem = {
  id?: string
  quantity?: number | string | null
  requires_shipping?: boolean | null
  detail?: {
    fulfilled_quantity?: number | string | null
  } | null
}

export type ShippableOrder = {
  id?: string
  status?: string | null
  payment_status?: string | null
  canceled_at?: string | Date | null
  metadata?: Record<string, unknown> | null
  items?: ShippableLineItem[] | null
  fulfillments?: { id?: string | null }[] | null
}

export const UNSHIPPED_REMINDER_SUPPRESSED_AT =
  "unshipped_reminder_suppressed_at"

export const isCanceledOrder = (order: ShippableOrder) =>
  order.status === "canceled" || Boolean(order.canceled_at)

export const isRefundedOrder = (order: ShippableOrder) =>
  order.payment_status === "refunded"

export const isUnshippedReminderSuppressed = (order: ShippableOrder) =>
  Boolean(order.metadata?.[UNSHIPPED_REMINDER_SUPPRESSED_AT])

export const remainingQuantity = (item: ShippableLineItem) => {
  const quantity = Number(item.quantity ?? 0)
  const fulfilled = Number(item.detail?.fulfilled_quantity ?? 0)

  return Math.max(0, quantity - fulfilled)
}

export const remainingShippableItems = (order: ShippableOrder) =>
  (order.items || [])
    .filter((item) => item.requires_shipping !== false)
    .map((item) => {
      const remaining = remainingQuantity(item)

      return item.id && remaining > 0
        ? { id: item.id, quantity: remaining }
        : null
    })
    .filter((item): item is { id: string; quantity: number } => Boolean(item))

export const hasRemainingShippableItems = (order: ShippableOrder) =>
  remainingShippableItems(order).length > 0

export const hasFulfillment = (order: ShippableOrder) =>
  (order.fulfillments || []).some((fulfillment) => Boolean(fulfillment.id))

export const isShippableOrder = (order: ShippableOrder) =>
  !isCanceledOrder(order) &&
  !isRefundedOrder(order) &&
  !isUnshippedReminderSuppressed(order) &&
  !hasFulfillment(order) &&
  hasRemainingShippableItems(order)

export async function fulfilledOrderIds(
  query: QueryGraph,
  orderIds: string[]
) {
  if (!orderIds.length) return new Set<string>()

  const { data: orders = [] } = await query.graph({
    entity: "order",
    filters: { id: orderIds },
    fields: ["id", "metadata", "fulfillments.id"],
  })

  return new Set(
    orders
      .filter((order) => hasFulfillment(order) || isUnshippedReminderSuppressed(order))
      .map((order) => order.id)
      .filter((id): id is string => Boolean(id))
  )
}

export async function filterShippableOrders<T extends ShippableOrder>(
  query: QueryGraph,
  orders: T[]
) {
  const candidates = orders.filter(
    (order) =>
      !isCanceledOrder(order) &&
      !isRefundedOrder(order) &&
      !isUnshippedReminderSuppressed(order) &&
      hasRemainingShippableItems(order)
  )
  const ids = candidates.map((order) => order.id).filter((id): id is string => Boolean(id))
  const fulfilled = await fulfilledOrderIds(query, ids)

  return candidates.filter((order) => !fulfilled.has(order.id || ""))
}
