import { INotificationModuleService, IOrderModuleService, MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { EmailTemplates, ReminderOrder } from "../modules/email-notifications/templates"

const ADMIN_EMAIL = "willbrako@gmail.com"

const remainingQuantity = (item: NonNullable<ReminderOrder["items"]>[number]) => {
  const quantity = Number(item.quantity ?? 0)
  const fulfilled = Number(item.detail?.fulfilled_quantity ?? 0)

  return Math.max(0, quantity - fulfilled)
}

const hasRemainingItems = (order: ReminderOrder) =>
  (order.items || []).some((item) => remainingQuantity(item) > 0)

export default async function unshippedOrderReminder(container: MedusaContainer) {
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)

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
    (order) => order.status !== "canceled" && hasRemainingItems(order)
  )

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
