import { MedusaRequest } from "@medusajs/framework"
import {
  IFulfillmentModuleService,
  INotificationModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { EmailTemplates } from "../modules/email-notifications/templates"
import { getEmailConfig } from "./email-config"
import { carrierHasPossession } from "./shipping-progress"
import { withShippingLock } from "./shipping-attempts"

type Scope = MedusaRequest["scope"]

type FulfillmentTrackingNumber =
  | { tracking_number?: string; tracking_url?: string }
  | string

const trackingFromFulfillment = (fulfillment: {
  data?: Record<string, unknown>
  tracking_numbers?: FulfillmentTrackingNumber[]
}) => {
  const data = fulfillment.data || {}
  const firstTracking = fulfillment.tracking_numbers?.[0]
  const trackingNumber =
    (typeof firstTracking === "string"
      ? firstTracking
      : firstTracking?.tracking_number) ||
    (data.tracking_number as string | undefined) ||
    ""
  const trackingUrl =
    (typeof firstTracking === "string"
      ? undefined
      : firstTracking?.tracking_url) ||
    (data.tracking_url as string | undefined) ||
    ""

  return {
    trackingNumber,
    trackingUrl,
    carrier: (data.carrier as string | undefined) || "",
  }
}

export async function sendTrackingEmailForFulfillment(
  scope: Scope,
  fulfillmentId: string
) {
  return withShippingLock(`email:${fulfillmentId}`, () => sendOnce(scope, fulfillmentId))
}

async function sendOnce(scope: Scope, fulfillmentId: string): Promise<"sent" | "already_sent" | "missing_data" | "waiting_for_carrier" | "needs_attention"> {
  const fulfillmentModuleService: IFulfillmentModuleService = scope.resolve(
    Modules.FULFILLMENT
  )
  const fulfillment = await fulfillmentModuleService.retrieveFulfillment(
    fulfillmentId
  )
  const data = ((fulfillment as { data?: Record<string, unknown> }).data ||
    {}) as Record<string, unknown>

  if (data.tracking_email_sent_at) return "already_sent"
  const tracking = data.tracking_status as { status?: string } | undefined
  if (!carrierHasPossession(tracking?.status)) return "waiting_for_carrier"

  const { trackingNumber, trackingUrl, carrier } = trackingFromFulfillment(
    fulfillment as {
      data?: Record<string, unknown>
      tracking_numbers?: FulfillmentTrackingNumber[]
    }
  )
  const orderId = data.order_id as string | undefined
  if (!trackingNumber || !orderId) return "missing_data"

  const orderModuleService: IOrderModuleService = scope.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(orderId, {
    relations: ["items", "summary", "shipping_address"],
  })

  if (!order.email || !order.shipping_address?.id) return "missing_data"

  const shippingAddress = await (
    orderModuleService as unknown as {
      orderAddressService_: { retrieve(id: string): Promise<unknown> }
    }
  ).orderAddressService_.retrieve(order.shipping_address.id)

  const notificationModuleService: INotificationModuleService = scope.resolve(
    Modules.NOTIFICATION
  )
  const emailConfig = await getEmailConfig(EmailTemplates.ORDER_SHIPPED)
  const idempotencyKey = `dabpal-shipped:${fulfillmentId}`
  const save = async (patch: Record<string, unknown>) => {
    await withShippingLock(`fulfillment:${fulfillmentId}`, async () => {
      const latest = await fulfillmentModuleService.retrieveFulfillment(fulfillmentId)
      await fulfillmentModuleService.updateFulfillment(fulfillmentId, { data: { ...(latest.data || {}), ...patch } })
    })
  }
  if (data.tracking_email_started_at) {
    const notifications = await notificationModuleService.listNotifications({ resource_id: fulfillmentId, template: EmailTemplates.ORDER_SHIPPED })
    if (notifications.some((notification) => notification.status === "success")) {
      await save({ tracking_email_sent_at: new Date().toISOString(), tracking_email_error: null })
      return "already_sent"
    }
    await save({ tracking_email_error: "Email delivery could not be confirmed. Review Email Studio before sending again." })
    return "needs_attention"
  }

  await save({ tracking_email_started_at: new Date().toISOString() })
  try {
    const notification = await notificationModuleService.createNotifications({
      idempotency_key: idempotencyKey,
      resource_id: fulfillmentId,
      resource_type: "fulfillment",
      to: order.email,
      channel: "email",
      template: EmailTemplates.ORDER_SHIPPED,
      data: {
        emailOptions: {
          replyTo: "hello@thedabpal.com",
          subject: emailConfig.subject,
        },
        order,
        shippingAddress,
        trackingNumber,
        trackingUrl,
        carrier,
        preview: emailConfig.preview,
      },
    })

    if (notification?.status !== "success") {
      const records = await notificationModuleService.listNotifications({ resource_id: fulfillmentId, template: EmailTemplates.ORDER_SHIPPED })
      if (!records.some((record) => record.status === "success")) {
        await save({ tracking_email_error: "Email delivery could not be confirmed. Review Email Studio before sending again." })
        return "needs_attention"
      }
    }
    await save({ tracking_email_sent_at: new Date().toISOString(), tracking_email_error: null })
  } catch (error) {
    await save({ tracking_email_error: (error as Error).message })
    throw error
  }

  return "sent"
}
