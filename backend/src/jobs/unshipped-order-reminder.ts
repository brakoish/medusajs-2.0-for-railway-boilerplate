import { INotificationModuleService, MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { EmailTemplates, ReminderOrder } from "../modules/email-notifications/templates"

type QueryGraph = {
  graph(input: { entity: string; filters?: Record<string, unknown>; fields: string[] }): Promise<{ data?: ReminderOrder[] }>
}

const ADMIN_EMAIL = "willbrako@gmail.com"

const remainingQuantity = (item: NonNullable<ReminderOrder["items"]>[number]) => {
  const quantity = Number(item.quantity ?? 0)
  const fulfilled = Number(item.detail?.fulfilled_quantity ?? 0)

  return Math.max(0, quantity - fulfilled)
}

const hasRemainingItems = (order: ReminderOrder) => (order.items || []).some((item) => remainingQuantity(item) > 0)

export default async function unshippedOrderReminder(container: MedusaContainer) {
  const query: QueryGraph = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)

  const { data: orders = [] } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "status", "fulfillment_status", "email", "created_at", "shipping_address.first_name", "shipping_address.last_name", "shipping_address.city", "shipping_address.province", "shipping_address.postal_code", "items.id", "items.title", "items.variant_sku", "items.quantity", "items.detail.fulfilled_quantity"],
  })

  const pendingStatuses = new Set(["not_fulfilled", "partially_fulfilled"])
  const pending = orders.filter((order) => order.status !== "canceled" && pendingStatuses.has(order.fulfillment_status) && hasRemainingItems(order))

  if (!pending.length) {
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
        subject: `Dab Pal unshipped orders: ${pending.length}`,
      },
      orders: pending,
      generatedAt: new Date().toISOString(),
      preview: `${pending.length} Dab Pal order${pending.length === 1 ? "" : "s"} still need shipping.`,
    },
  })

  console.log(`[unshipped-order-reminder] Sent ${pending.length} unshipped order reminder${pending.length === 1 ? "" : "s"} to ${ADMIN_EMAIL}`)
}

export const config = {
  name: "unshipped-order-reminder",
  schedule: {
    cron: "0 14 * * *",
    concurrency: "forbid" as const,
  },
}
