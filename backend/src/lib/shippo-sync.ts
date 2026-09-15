import { MedusaRequest } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { IFulfillmentModuleService } from "@medusajs/framework/types"
import { ShippoClient } from "../modules/shippo/client"
import { ShippoBatchShipment, ShippoTransaction } from "../modules/shippo/types"

import { withShippingLock } from "./shipping-attempts"

const isFulfillmentId = (value?: string): value is string =>
  typeof value === "string" && value.startsWith("ful_")

export async function updateFulfillmentFromTransaction(
  req: MedusaRequest,
  tx: Omit<Partial<ShippoTransaction>, "status"> & {
    object_id: string
    status?: string
  },
): Promise<boolean> {
  const logger = req.scope.resolve("logger")
  const fulfillmentId = isFulfillmentId(tx.metadata) ? tx.metadata : undefined

  if (!fulfillmentId) {
    logger.info(
      `[shippo webhook] transaction ${tx.object_id} has no fulfillment metadata; no order mutation`,
    )
    return false
  }

  const fulfillmentModuleService: IFulfillmentModuleService = req.scope.resolve(
    Modules.FULFILLMENT,
  )
  const hasTracking = !!tx.tracking_number
  const currentData = await withShippingLock(
    `fulfillment:${fulfillmentId}`,
    async () => {
      const fulfillment =
        await fulfillmentModuleService.retrieveFulfillment(fulfillmentId)
      const currentData = ((fulfillment as { data?: Record<string, unknown> })
        .data || {}) as Record<string, unknown>

      await fulfillmentModuleService.updateFulfillment(fulfillmentId, {
        data: {
          ...currentData,
          transaction_id: tx.object_id,
          transaction_status: {
            status: tx.status,
            messages: tx.messages || [],
            updated_at: new Date().toISOString(),
          },
          ...(tx.label_url ? { label_url: tx.label_url } : {}),
          ...(tx.tracking_number
            ? { tracking_number: tx.tracking_number }
            : {}),
          ...(tx.tracking_url_provider
            ? { tracking_url: tx.tracking_url_provider }
            : {}),
          ...(tx.provider ? { carrier: tx.provider } : {}),
          ...(tx.servicelevel?.name ? { service: tx.servicelevel.name } : {}),
        },
      })

      return currentData
    },
  )

  if (hasTracking && tx.provider && !currentData.tracking_registered_at) {
    const client = new ShippoClient({
      api_token: process.env.SHIPPO_API_TOKEN!,
      api_url: process.env.SHIPPO_API_URL,
    })
    await client.registerTracking({
      carrier: tx.provider.toLowerCase(),
      tracking_number: tx.tracking_number!,
      metadata: fulfillmentId,
    })
    await withShippingLock(`fulfillment:${fulfillmentId}`, async () => {
      const latest =
        await fulfillmentModuleService.retrieveFulfillment(fulfillmentId)
      await fulfillmentModuleService.updateFulfillment(fulfillmentId, {
        data: {
          ...(latest.data || {}),
          tracking_registered_at: new Date().toISOString(),
        },
      })
    })
  }

  return true
}

async function updateFulfillmentBatchStatus(
  req: MedusaRequest,
  fulfillmentId: string,
  batchId: string,
  status: string,
  messages?: { code?: string; text: string }[],
  labelUrls: string[] = [],
): Promise<void> {
  const fulfillmentModuleService: IFulfillmentModuleService = req.scope.resolve(
    Modules.FULFILLMENT,
  )
  await withShippingLock(`fulfillment:${fulfillmentId}`, async () => {
    const fulfillment =
      await fulfillmentModuleService.retrieveFulfillment(fulfillmentId)
    const currentData = ((fulfillment as { data?: Record<string, unknown> })
      .data || {}) as Record<string, unknown>

    await fulfillmentModuleService.updateFulfillment(fulfillmentId, {
      data: {
        ...currentData,
        batch_id: batchId,
        ...(labelUrls.length ? { batch_label_urls: labelUrls } : {}),
        batch_status: {
          status,
          messages: messages || [],
          updated_at: new Date().toISOString(),
        },
      },
    })
  })
}

export async function updateFromBatchShipment(
  req: MedusaRequest,
  client: ShippoClient,
  batchId: string,
  shipment: ShippoBatchShipment,
  labelUrls: string[] = [],
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
    shipment.messages,
    labelUrls,
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
