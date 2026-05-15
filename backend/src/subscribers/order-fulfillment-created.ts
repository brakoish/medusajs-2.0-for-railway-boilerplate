import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService, IFulfillmentModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'

export default async function orderFulfillmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  try {
    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ['items', 'summary', 'shipping_address'],
    })
    const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(
      order.shipping_address.id
    )

    // Get the fulfillment (data.fulfillment_id is set by Medusa when this event fires)
    const fulfillmentId = data.fulfillment_id
    if (!fulfillmentId) {
      console.warn('[order-fulfillment-created] No fulfillment_id in event data, skipping shipping email')
      return
    }

    const fulfillment = await fulfillmentModuleService.retrieveFulfillment(fulfillmentId)
    const fdata = (fulfillment as any).data as Record<string, unknown> | null

    // Pull tracking number — check fulfillment.tracking_numbers first, fall back to data blob
    const trackingNumbers: Array<{ tracking_number: string; tracking_url?: string }> =
      (fulfillment as any).tracking_numbers || []

    const trackingNumber: string =
      trackingNumbers[0]?.tracking_number ||
      (fdata?.tracking_number as string) ||
      ''

    const trackingUrl: string =
      trackingNumbers[0]?.tracking_url ||
      (fdata?.tracking_url as string) ||
      ''

    const carrier: string = (fdata?.carrier as string) || ''

    if (!trackingNumber) {
      console.warn(`[order-fulfillment-created] No tracking number on fulfillment ${fulfillmentId}, skipping shipping email`)
      return
    }

    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_SHIPPED,
      data: {
        emailOptions: {
          replyTo: 'hello@thedabpal.com',
          subject: 'Your Dab Pal shipped',
        },
        order,
        shippingAddress,
        trackingNumber,
        trackingUrl,
        carrier,
        preview: `Your Dab Pal is on its way, ${shippingAddress.first_name || 'there'}.`,
      },
    })

    console.log(`[order-fulfillment-created] Shipping email sent for order ${data.id}, tracking ${trackingNumber}`)
  } catch (error) {
    console.error('[order-fulfillment-created] Error sending shipping notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.fulfillment_created',
}
