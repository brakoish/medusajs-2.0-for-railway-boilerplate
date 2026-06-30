import { ExecArgs, IOrderModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { UNSHIPPED_REMINDER_SUPPRESSED_AT } from "../lib/shippable-orders"

export default async function suppressUnshippedReminder({ container }: ExecArgs) {
  const orderId = process.env.SUPPRESS_UNSHIPPED_ORDER_ID

  if (!orderId) {
    throw new Error("SUPPRESS_UNSHIPPED_ORDER_ID is required")
  }

  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(orderId)
  const metadata = order.metadata || {}
  const suppressedAt =
    metadata[UNSHIPPED_REMINDER_SUPPRESSED_AT] || new Date().toISOString()

  const updated = await orderModuleService.updateOrders(orderId, {
    metadata: {
      ...metadata,
      [UNSHIPPED_REMINDER_SUPPRESSED_AT]: suppressedAt,
      unshipped_reminder_suppressed_reason:
        metadata.unshipped_reminder_suppressed_reason ||
        "internal comp order, do not send daily reminder",
    },
  })

  console.log(
    `suppressed unshipped reminder for order ${updated.display_id ?? updated.id}`
  )
}
