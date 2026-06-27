import { INotificationModuleService, IOrderModuleService, MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { EmailTemplates, ReminderOrder } from "../modules/email-notifications/templates"

type FulfillmentQuery = {
  graph(input: {
    entity: string
    filters?: Record<string, unknown>
    fields: string[]
  }): Promise<{ data?: { id?: string; fulfillments?: { id?: string }[] }[] }>
}

const ADMIN_EMAIL = "willbrako@gmail.com"

const remainingQuantity = (item: NonNullable<ReminderOrder["items"]>[number]) => {
  const quantity = Number(item.quantity ?? 0)
  const fulfilled = Number(item.detail?.fulfilled_quantity ?? 0)

  return Math.max(0, quantity - fulfilled)
}

const hasRemainingItems = (order: ReminderOrder) =>
  (order.items || []).some((item) => remainingQuantity(item) > 0)

const isCanceledOrder = (order: ReminderOrder) =>
  order.status === "canceled" || Boolean(order.canceled_at)

export default async function unshippedOrderReminder(container: MedusaContainer) {
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const query: FulfillmentQuery = container.resolve(ContainerRegistrationKeys.QUERY)

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

  const pending = (orders as ReminderOrder[]).filter(
    (order) => !isCanceledOrder(order) && hasRemainingItems(order)
  )
  const pendingIds = pending.map((order) => order.id).filter(Boolean)

  const { data: ordersWithFulfillments = [] } = pendingIds.length
    ? await query.graph({
        entity: "order",
        filters: {
          id: pendingIds,
        },
        fields: ["id", "fulfillments.id"],
      })
    : { data: [] }

  const fulfilledOrderIds = new Set(
    ordersWithFulfillments
      .filter((order) => (order.fulfillments || []).length > 0)
      .map((order) => order.id)
      .filter(Boolean)
  )
  const unfulfilled = pending.filter(
    (order) => !fulfilledOrderIds.has(order.id)
  )

  if (!unfulfilled.length) {
    console.log("[unshipped-order-reminder] No unshipped orders")
    return
  }

  await notificationModuleService.createNotifications({
    to: ADMIN_EMAIL,
    channel: "email",
    template: EmailTemplates.UNSHIPPED_ORDER_REMINDER,
    data: {
      emailOptions: {
        replyTo: "hello@thedabpal.com",
        subject: `Dab Pal unshipped orders: ${unfulfilled.length}`,
      },
      orders: unfulfilled,
      generatedAt: new Date().toISOString(),
      preview: `${unfulfilled.length} Dab Pal order${unfulfilled.length === 1 ? "" : "s"} still need shipping.`,
    },
  })

  console.log(`[unshipped-order-reminder] Sent ${unfulfilled.length} unshipped order reminder${unfulfilled.length === 1 ? "" : "s"} to ${ADMIN_EMAIL}`)
}

export const config = {
  name: "unshipped-order-reminder",
  schedule: {
    cron: "0 14 * * *",
    concurrency: "forbid" as const,
  },
}
