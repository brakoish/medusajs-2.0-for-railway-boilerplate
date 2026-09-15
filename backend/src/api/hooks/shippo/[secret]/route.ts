import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { IFulfillmentModuleService } from "@medusajs/framework/types"
import { markFulfillmentAsDeliveredWorkflow } from "@medusajs/medusa/core-flows"
import { ShippoClient } from "../../../../modules/shippo/client"
import { updateFulfillmentFromTransaction, updateFromBatchShipment } from "../../../../lib/shippo-sync"
import { withShippingLock } from "../../../../lib/shipping-attempts"
import { carrierHasPossession } from "../../../../lib/shipping-progress"
import { sendTrackingEmailForFulfillment } from "../../../../lib/tracking-email"

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
 *  - track_updated -> persists carrier scan status and marks delivered.
 *  - transaction_created / transaction_updated -> persists label purchase
 *    status, label URLs, tracking numbers, and errors onto the fulfillment.
 *  - batch_created / batch_purchased -> reconciles each label and purchase result.
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
    metadata?: string
    provider?: string
    tracking_number?: string
    tracking_url_provider?: string
    label_url?: string
    messages?: { code?: string; text: string }[]
    servicelevel?: { name?: string; token?: string }
  }
}

type ShippoBatchPayload = {
  event: "batch_created" | "batch_purchased"
  data:
    | string
    | {
        object_id?: string
        status?: string
        metadata?: string
        object_results?: {
          purchase_succeeded?: ShippoTxUpdatedPayload["data"][]
          purchase_failed?: ShippoTxUpdatedPayload["data"][]
          creation_succeeded?: Record<string, unknown>[]
          creation_failed?: Record<string, unknown>[]
        }
      }
}

type AnyShippoWebhook =
  | ShippoTrackUpdatedPayload
  | ShippoTxUpdatedPayload
  | ShippoBatchPayload

function batchIdFromPayload(payload: ShippoBatchPayload): string | undefined {
  if (typeof payload.data !== "string") return payload.data.object_id
  return payload.data.match(/[a-f0-9]{32}/i)?.[0]
}

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

      let accepted = false
      if (metadata) {
        try {
          await withShippingLock(`fulfillment:${metadata}`, async () => {
            const fulfillmentModuleService: IFulfillmentModuleService = req.scope.resolve(Modules.FULFILLMENT)
            const fulfillment = await fulfillmentModuleService.retrieveFulfillment(metadata)
            const currentData = ((fulfillment as { data?: Record<string, unknown> }).data || {}) as Record<string, unknown>
            const shippedAt = (fulfillment as { shipped_at?: Date | string | null }).shipped_at

            const previous = currentData.tracking_status as { status?: string; status_date?: string } | undefined
            if (previous?.status === "DELIVERED" && status !== "DELIVERED") return
            if (previous?.status_date && tracking_status?.status_date && Date.parse(previous.status_date) > Date.parse(tracking_status.status_date)) return
            if (carrierHasPossession(previous?.status) && ["UNKNOWN", "PRE_TRANSIT"].includes(status || "")) return
            accepted = true
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
          })
          if (accepted && carrierHasPossession(status)) await sendTrackingEmailForFulfillment(req.scope, metadata)
        } catch (e) {
          res.status(503).json({ error: "Tracking update needs retry" })
          return

        }
      }

      if (accepted && status === "DELIVERED" && metadata) {
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
          res.status(503).json({ error: "Delivery update needs retry" })
          return
        }
      }
      break
    }
    case "transaction_updated":
    case "transaction_created": {
      logger.info(
        `[shippo webhook] ${payload.event} object_id=${payload.data.object_id} status=${payload.data.status}`
      )
      try {
        await updateFulfillmentFromTransaction(req, payload.data)
      } catch (e) {
        logger.warn(`[shippo webhook] transaction update failed: ${(e as Error).message}`)
        res.status(503).json({ error: "Transaction update needs retry" })
        return
      }
      break
    }
    case "batch_created":
    case "batch_purchased": {
      const batchId = batchIdFromPayload(payload)
      logger.info(`[shippo webhook] ${payload.event} batch_id=${batchId || "unknown"}`)

      if (!batchId) break

      const apiToken = process.env.SHIPPO_API_TOKEN
      if (!apiToken) {
        logger.warn("[shippo webhook] SHIPPO_API_TOKEN missing; cannot hydrate batch")
        break
      }

      const client = new ShippoClient({ api_token: apiToken, api_url: process.env.SHIPPO_API_URL })
      const filters =
        payload.event === "batch_purchased"
          ? ["purchase_succeeded", "purchase_failed"]
          : ["creation_succeeded", "creation_failed"]

      for (const filter of filters) {
        try {
          for (let page = 1; ; page++) {
            const batch = await client.getBatch(batchId, {
              object_results: filter, results: 100, page,
            })
            logger.info(
              `[shippo webhook] ${payload.event} batch_id=${batch.object_id} status=${batch.status} ${filter}=${batch.batch_shipments?.results?.length || 0}`
            )

            for (const shipment of batch.batch_shipments?.results || []) {
              await updateFromBatchShipment(req, client, batch.object_id, shipment, batch.label_url)
            }
            if (!batch.batch_shipments?.next) break
          }
        } catch (e) {
          res.status(503).json({ error: "Batch update needs retry" })
          return

        }
      }
      break
    }
    default:
      logger.info(`[shippo webhook] unhandled event=${(payload as { event?: string }).event}`)
  }

  res.status(200).json({ ok: true })
}
