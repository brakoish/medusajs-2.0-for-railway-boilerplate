import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { IFulfillmentModuleService } from "@medusajs/framework/types"
import { markFulfillmentAsDeliveredWorkflow } from "@medusajs/medusa/core-flows"
import { ShippoClient } from "../../../../modules/shippo/client"
import { ShippoBatchShipment, ShippoTransaction } from "../../../../modules/shippo/types"

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
 *  - batch_created / batch_purchased -> acknowledged and summarized. Full
 *    order mutation waits until bulk shipping uses Shippo's batch API.
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

const carrierHasPossession = (status?: string): boolean =>
  status === "TRANSIT" ||
  status === "OUT_FOR_DELIVERY" ||
  status === "DELIVERED" ||
  status === "FAILURE" ||
  status === "RETURNED"

const isFulfillmentId = (value?: string): value is string =>
  typeof value === "string" && value.startsWith("ful_")

async function updateFulfillmentFromTransaction(
  req: MedusaRequest,
  tx: ShippoTxUpdatedPayload["data"]
): Promise<boolean> {
  const logger = req.scope.resolve("logger")
  const fulfillmentId = isFulfillmentId(tx.metadata) ? tx.metadata : undefined

  if (!fulfillmentId) {
    logger.info(
      `[shippo webhook] transaction ${tx.object_id} has no fulfillment metadata; no order mutation`
    )
    return false
  }

  const fulfillmentModuleService: IFulfillmentModuleService = req.scope.resolve(
    Modules.FULFILLMENT
  )
  const fulfillment = await fulfillmentModuleService.retrieveFulfillment(
    fulfillmentId
  )
  const currentData = ((fulfillment as { data?: Record<string, unknown> })
    .data || {}) as Record<string, unknown>
  const shippedAt = (fulfillment as { shipped_at?: Date | string | null })
    .shipped_at

  const hasTracking = !!tx.tracking_number

  await fulfillmentModuleService.updateFulfillment(fulfillmentId, {
    ...(hasTracking && !shippedAt ? { shipped_at: new Date() } : {}),
    data: {
      ...currentData,
      transaction_id: tx.object_id,
      transaction_status: {
        status: tx.status,
        messages: tx.messages || [],
        updated_at: new Date().toISOString(),
      },
      ...(tx.label_url ? { label_url: tx.label_url } : {}),
      ...(tx.tracking_number ? { tracking_number: tx.tracking_number } : {}),
      ...(tx.tracking_url_provider
        ? { tracking_url: tx.tracking_url_provider }
        : {}),
      ...(tx.provider ? { carrier: tx.provider } : {}),
      ...(tx.servicelevel?.name ? { service: tx.servicelevel.name } : {}),
    },
  })

  return true
}

function batchIdFromPayload(payload: ShippoBatchPayload): string | undefined {
  if (typeof payload.data !== "string") return payload.data.object_id
  return payload.data.match(/[a-f0-9]{32}/i)?.[0]
}

async function updateFulfillmentBatchStatus(
  req: MedusaRequest,
  fulfillmentId: string,
  batchId: string,
  status: string,
  messages?: { code?: string; text: string }[]
): Promise<void> {
  const fulfillmentModuleService: IFulfillmentModuleService = req.scope.resolve(
    Modules.FULFILLMENT
  )
  const fulfillment = await fulfillmentModuleService.retrieveFulfillment(
    fulfillmentId
  )
  const currentData = ((fulfillment as { data?: Record<string, unknown> })
    .data || {}) as Record<string, unknown>

  await fulfillmentModuleService.updateFulfillment(fulfillmentId, {
    data: {
      ...currentData,
      batch_id: batchId,
      batch_status: {
        status,
        messages: messages || [],
        updated_at: new Date().toISOString(),
      },
    },
  })
}

async function updateFromBatchShipment(
  req: MedusaRequest,
  client: ShippoClient,
  batchId: string,
  shipment: ShippoBatchShipment
): Promise<void> {
  const fulfillmentId = isFulfillmentId(shipment.metadata)
    ? shipment.metadata
    : undefined
  if (!fulfillmentId) return

  await updateFulfillmentBatchStatus(
    req,
    fulfillmentId,
    batchId,
    shipment.status,
    shipment.messages
  )

  if (!shipment.transaction) return

  const tx =
    typeof shipment.transaction === "string"
      ? await client.getTransaction(shipment.transaction)
      : (shipment.transaction as ShippoTransaction)

  await updateFulfillmentFromTransaction(req, {
    object_id: tx.object_id,
    status: tx.status,
    metadata: fulfillmentId,
    provider: tx.provider,
    tracking_number: tx.tracking_number,
    tracking_url_provider: tx.tracking_url_provider,
    label_url: tx.label_url,
    messages: tx.messages,
    servicelevel: tx.servicelevel,
  })
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
    case "transaction_created": {
      logger.info(
        `[shippo webhook] ${payload.event} object_id=${payload.data.object_id} status=${payload.data.status}`
      )
      try {
        await updateFulfillmentFromTransaction(req, payload.data)
      } catch (e) {
        logger.warn(
          `[shippo webhook] failed to update transaction ${payload.data.object_id}: ${
            (e as Error).message
          }`
        )
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

      const client = new ShippoClient({ api_token: apiToken })
      const filters =
        payload.event === "batch_purchased"
          ? ["purchase_succeeded", "purchase_failed"]
          : ["creation_succeeded", "creation_failed"]

      for (const filter of filters) {
        try {
          const batch = await client.getBatch(batchId, {
            object_results: filter,
            results: 100,
          })
          logger.info(
            `[shippo webhook] ${payload.event} batch_id=${batch.object_id} status=${batch.status} ${filter}=${batch.batch_shipments?.results?.length || 0}`
          )

          for (const shipment of batch.batch_shipments?.results || []) {
            await updateFromBatchShipment(req, client, batch.object_id, shipment)
          }
        } catch (e) {
          logger.warn(
            `[shippo webhook] failed to hydrate batch ${batchId} ${filter}: ${
              (e as Error).message
            }`
          )
        }
      }
      break
    }
    default:
      logger.info(`[shippo webhook] unhandled event=${(payload as { event?: string }).event}`)
  }

  res.status(200).json({ ok: true })
}
