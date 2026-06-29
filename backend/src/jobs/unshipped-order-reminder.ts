import { INotificationModuleService, IOrderModuleService, MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { filterShippableOrders } from "../lib/shippable-orders"
import { EmailTemplates, ReminderOrder } from "../modules/email-notifications/templates"

type FulfillmentQuery = {
  graph(input: {
    entity: string
    filters?: Record<string, unknown>
    fields: string[]
  }): Promise<{ data?: { id?: string; fulfillments?: { id?: string }[] }[] }>
}

const ADMIN_EMAIL = "willbrako@gmail.com"

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

  const unfulfilled = await filterShippableOrders(query, orders as ReminderOrder[])

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
