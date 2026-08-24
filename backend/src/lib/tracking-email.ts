import { MedusaRequest } from "@medusajs/framework"
import {
  IFulfillmentModuleService,
  INotificationModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { EmailTemplates } from "../modules/email-notifications/templates"
import { getEmailConfig } from "./email-config"

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
): Promise<"sent" | "already_sent" | "missing_data"> {
  const fulfillmentModuleService: IFulfillmentModuleService = scope.resolve(
    Modules.FULFILLMENT
  )
  const fulfillment = await fulfillmentModuleService.retrieveFulfillment(
    fulfillmentId
  )
  const data = ((fulfillment as { data?: Record<string, unknown> }).data ||
    {}) as Record<string, unknown>

  if (data.tracking_email_sent_at) return "already_sent"

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

  await notificationModuleService.createNotifications({
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

  await fulfillmentModuleService.updateFulfillment(fulfillmentId, {
    data: {
      ...data,
      tracking_email_sent_at: new Date().toISOString(),
    },
  })

  return "sent"
}
