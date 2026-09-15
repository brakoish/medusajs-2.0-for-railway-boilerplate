import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ShippoClient } from "../../../../../../modules/shippo/client"
import {
  updateFromBatchShipment,
  updateFulfillmentFromTransaction,
} from "../../../../../../lib/shippo-sync"
import { shippingQueue } from "../../../../../../lib/shipping-queue"

// Reconcile existing purchases only. Never create a batch or buy a label here.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id as string
  const token = process.env.SHIPPO_API_TOKEN
  if (!token) {
    res.status(503).json({ error: "Shippo is not configured" })
    return
  }
  const client = new ShippoClient({
    api_token: token,
    api_url: process.env.SHIPPO_API_URL,
  })
  const initial = await shippingQueue(req.scope, [orderId])
  const allowed = new Set(
    initial.progress.map((p) => p.fulfillment_id).filter(Boolean),
  )
  try {
    const batches = new Set(
      initial.progress.map((p) => p.batch_id).filter(Boolean),
    )
    for (const batchId of batches) {
      for (let page = 1; ; page++) {
        const batch = await client.getBatch(batchId, { results: 100, page })
        for (const shipment of batch.batch_shipments?.results || []) {
          if (shipment.metadata && allowed.has(shipment.metadata))
            await updateFromBatchShipment(
              req,
              client,
              batchId,
              shipment,
              batch.label_url,
            )
        }
        if (!batch.batch_shipments?.next) break
      }
    }
    for (const entry of initial.progress) {
      if (
        !entry.batch_id &&
        entry.transaction_id &&
        allowed.has(entry.fulfillment_id)
      ) {
        const tx = await client.getTransaction(entry.transaction_id)
        await updateFulfillmentFromTransaction(req, {
          ...tx,
          metadata: entry.fulfillment_id,
        })
      }
    }
    res.json(await shippingQueue(req.scope, [orderId]))
  } catch (error) {
    res
      .status(502)
      .json({
        error: `Could not refresh from Shippo. No new label was purchased. ${(error as Error).message}`,
      })
  }
}
