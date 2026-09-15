import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { sendTrackingEmailForFulfillment } from "../lib/tracking-email"

export default async function orderFulfillmentCreatedHandler({ event: { data }, container }: SubscriberArgs<{ fulfillment_id?: string }>) {
  // Carrier possession is checked centrally; label creation alone sends no
  // "out the door" email. Carrier webhooks call the same idempotent helper.
  if (data.fulfillment_id) await sendTrackingEmailForFulfillment(container, data.fulfillment_id)
}

export const config: SubscriberConfig = { event: "order.fulfillment_created" }
