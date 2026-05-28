import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { IFulfillmentModuleService } from "@medusajs/framework/types"
import { markFulfillmentAsDeliveredWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Shippo webhook receiver.
 *
 * URL: POST /hooks/shippo/<SHIPPO_WEBHOOK_SECRET>
 *
 * Shippo webhooks aren't HMAC-signed (per their docs as of 2026), so the URL
 * itself is the auth boundary. Set SHIPPO_WEBHOOK_SECRET to a random string
 * and configure the webhook URL in Shippo's dashboard to include it.
 *
 * Handles event types:
 *  - track_updated   -> updates Medusa fulfillment status (DELIVERED -> mark
 *                       fulfillment delivered; TRANSIT -> info-only log).
 *  - transaction_updated -> currently logged only; could be wired to surface
 *                           refund / void state on the order in admin.
 */

type ShippoTrackUpdatedPayload = {
  event: "track_updated"
  test?: boolean
  data: {
    carrier: string
    tracking_number: string
    tracking_status?: {
      status?:
        | "UNKNOWN"
        | "PRE_TRANSIT"
        | "TRANSIT"
        | "OUT_FOR_DELIVERY"
        | "DELIVERED"
        | "RETURNED"
        | "FAILURE"
        | string
      status_details?: string
      status_date?: string
      location?: {
        city?: string
        state?: string
        zip?: string
        country?: string
      }
    }
    tracking_history?: {
      status?: string
      status_details?: string
      status_date?: string
      location?: {
        city?: string
        state?: string
        zip?: string
        country?: string
      }
    }[]
    metadata?: string // we set this to the Medusa fulfillment id in /tracks
  }
}

type ShippoTxUpdatedPayload = {
  event: "transaction_updated" | "transaction_created"
  data: {
    object_id: string
    status?: string
    tracking_number?: string
    label_url?: string
  }
}

type AnyShippoWebhook = ShippoTrackUpdatedPayload | ShippoTxUpdatedPayload

const carrierHasPossession = (status?: string): boolean =>
  status === "TRANSIT" ||
  status === "OUT_FOR_DELIVERY" ||
  status === "DELIVERED" ||
  status === "FAILURE" ||
  status === "RETURNED"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const expected = process.env.SHIPPO_WEBHOOK_SECRET
  const provided = req.params.secret as string | undefined

  if (!expected) {
    // Webhook secret not configured. Refuse so misconfigured prod doesn't
    // accept arbitrary POSTs that could mark orders delivered.
    res.status(503).json({ error: "Webhook receiver not configured" })
    return
  }

  if (provided !== expected) {
    res.status(401).json({ error: "Invalid webhook secret" })
    return
  }

  const logger = req.scope.resolve("logger")
  const payload = (req.body || {}) as AnyShippoWebhook

  // Shippo's portal can also send a sample payload with `test: true`. Acknowledge
  // and short-circuit so test traffic doesn't accidentally mutate real
  // fulfillments.
  if ("test" in payload && (payload as ShippoTrackUpdatedPayload).test) {
    logger.info(
      `[shippo webhook] received test payload for event=${payload.event}`
    )
    res.status(200).json({ ok: true, test: true })
    return
  }

  switch (payload.event) {
    case "track_updated": {
      const { carrier, tracking_number, tracking_status, tracking_history, metadata } = payload.data
      const status = tracking_status?.status
      logger.info(
        `[shippo webhook] track_updated carrier=${carrier} tracking=${tracking_number} status=${status}`
      )

      if (metadata) {
        try {
          const fulfillmentModuleService: IFulfillmentModuleService = req.scope.resolve(Modules.FULFILLMENT)
          const fulfillment = await fulfillmentModuleService.retrieveFulfillment(metadata)
          const currentData = ((fulfillment as { data?: Record<string, unknown> }).data || {}) as Record<string, unknown>
          const shippedAt = (fulfillment as { shipped_at?: Date | string | null }).shipped_at

          await fulfillmentModuleService.updateFulfillment(metadata, {
            ...(carrierHasPossession(status) && !shippedAt ? { shipped_at: new Date() } : {}),
            data: {
              ...currentData,
              tracking_status: {
                carrier,
                tracking_number,
                status,
                status_details: tracking_status?.status_details,
                status_date: tracking_status?.status_date,
                location: tracking_status?.location,
                updated_at: new Date().toISOString(),
              },
              tracking_history: (tracking_history || []).slice(0, 20),
            },
          })
        } catch (e) {
          logger.warn(
            `[shippo webhook] failed to update tracking status for fulfillment ${metadata}: ${
              (e as Error).message
            }`
          )
        }
      }

      if (status === "DELIVERED" && metadata) {
        // metadata is the Medusa fulfillment id we passed at /tracks register time.
        try {
          await markFulfillmentAsDeliveredWorkflow(req.scope).run({
            input: { id: metadata },
          })
          logger.info(
            `[shippo webhook] marked fulfillment ${metadata} as delivered`
          )
        } catch (e) {
          logger.warn(
            `[shippo webhook] failed to mark fulfillment ${metadata} delivered: ${
              (e as Error).message
            }`
          )
        }
      }
      break
    }
    case "transaction_updated":
    case "transaction_created":
      logger.info(
        `[shippo webhook] ${payload.event} object_id=${payload.data.object_id} status=${payload.data.status}`
      )
      break
    default:
      logger.info(`[shippo webhook] unhandled event=${(payload as { event?: string }).event}`)
  }

  res.status(200).json({ ok: true })
}
