import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  IFulfillmentModuleService,
  INotificationModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { EmailTemplates } from "../../../../../modules/email-notifications/templates"

type SendTrackingBody = {
  fulfillment_id?: string
}

type OrderForTrackingEmail = {
  id: string
  display_id: string | number
  email?: string
  shipping_address?: {
    first_name?: string
    last_name?: string
    address_1?: string
    address_2?: string
    city?: string
    province?: string
    postal_code?: string
  }
  fulfillments?: {
    id: string
    data?: Record<string, unknown>
    tracking_numbers?: ({ tracking_number?: string; tracking_url?: string } | string)[]
  }[]
}

const trackingFromFulfillment = (fulfillment: NonNullable<OrderForTrackingEmail["fulfillments"]>[number]) => {
  const data = fulfillment.data || {}
  const firstTracking = fulfillment.tracking_numbers?.[0]
  const trackingNumber =
    (typeof firstTracking === "string" ? firstTracking : firstTracking?.tracking_number) ||
    (data.tracking_number as string | undefined) ||
    ""
  const trackingUrl =
    (typeof firstTracking === "string" ? undefined : firstTracking?.tracking_url) ||
    (data.tracking_url as string | undefined) ||
    ""

  return {
    trackingNumber,
    trackingUrl,
    carrier: (data.carrier as string | undefined) || "",
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderId = req.params.id as string
  const { fulfillment_id } = req.body as SendTrackingBody

  if (!fulfillment_id) {
    res.status(400).json({ error: "fulfillment_id required" })
    return
  }

  const query = req.scope.resolve("query")
  const { data: orders } = await query.graph({
    entity: "order",
    filters: { id: orderId },
    fields: [
      "id",
      "display_id",
      "email",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.address_1",
      "shipping_address.address_2",
      "shipping_address.city",
      "shipping_address.province",
      "shipping_address.postal_code",
      "fulfillments.id",
      "fulfillments.data",
      "fulfillments.tracking_numbers",
    ],
  })

  const order = orders?.[0] as OrderForTrackingEmail | undefined
  if (!order) {
    res.status(404).json({ error: "Order not found" })
    return
  }

  if (!order.email) {
    res.status(400).json({ error: "Order has no customer email" })
    return
  }

  const fulfillment = order.fulfillments?.find((f) => f.id === fulfillment_id)
  if (!fulfillment) {
    res.status(404).json({ error: "Fulfillment not found on this order" })
    return
  }

  const { trackingNumber, trackingUrl, carrier } =
    trackingFromFulfillment(fulfillment)
  if (!trackingNumber) {
    res.status(400).json({ error: "Fulfillment has no tracking number yet" })
    return
  }

  if (!order.shipping_address) {
    res.status(400).json({ error: "Order has no shipping address" })
    return
  }

  const notificationModuleService: INotificationModuleService = req.scope.resolve(
    Modules.NOTIFICATION
  )

  await notificationModuleService.createNotifications({
    to: order.email,
    channel: "email",
    template: EmailTemplates.ORDER_SHIPPED,
    data: {
      emailOptions: {
        replyTo: "hello@thedabpal.com",
        subject: "Your Dab Pal is out the door",
      },
      order,
      shippingAddress: order.shipping_address,
      trackingNumber,
      trackingUrl,
      carrier,
      preview: `Your Dab Pal is out the door, ${order.shipping_address.first_name || "there"}.`,
    },
  })

  const fulfillmentModuleService: IFulfillmentModuleService = req.scope.resolve(
    Modules.FULFILLMENT
  )
  const currentData = fulfillment.data || {}
  await fulfillmentModuleService.updateFulfillment(fulfillment_id, {
    data: {
      ...currentData,
      tracking_email_sent_at: new Date().toISOString(),
    },
  })

  res.status(200).json({
    ok: true,
    to: order.email,
    tracking_number: trackingNumber,
  })
}
