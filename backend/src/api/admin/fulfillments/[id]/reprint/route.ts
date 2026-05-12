import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * POST /admin/fulfillments/:id/reprint
 *
 * Re-fetches a label from Shippo if the original label_url expired or was lost.
 * Uses the Shippo REST API directly (the provider service isn't directly
 * accessible via module methods, so we hit Shippo with the stored token).
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const fulfillmentId = req.params.id as string
  const query = req.scope.resolve("query")
  const logger = req.scope.resolve("logger")

  // Pull the fulfillment with its provider data
  const { data: fulfillments } = await query.graph({
    entity: "fulfillment",
    fields: ["id", "provider_id", "data", "tracking_numbers"],
    filters: { id: fulfillmentId },
  })

  const fulfillment = fulfillments?.[0]
  if (!fulfillment) {
    res.status(404).json({ message: "Fulfillment not found" })
    return
  }

  const data = (fulfillment.data || {}) as Record<string, unknown>
  const transactionId = data.transaction_id as string | undefined

  if (!transactionId) {
    res.status(400).json({ message: "No transaction_id on fulfillment; cannot reprint" })
    return
  }

  const token = process.env.SHIPPO_API_TOKEN
  if (!token) {
    res.status(503).json({ message: "SHIPPO_API_TOKEN not configured" })
    return
  }

  try {
    const shippoRes = await fetch(
      `https://api.goshippo.com/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `ShippoToken ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!shippoRes.ok) {
      const body = await shippoRes.text()
      throw new Error(`Shippo ${shippoRes.status}: ${body}`)
    }

    const tx = await shippoRes.json()
    res.status(200).json({
      fulfillment_id: fulfillment.id,
      transaction_id: tx.object_id,
      label_url: tx.label_url,
      tracking_number: tx.tracking_number,
      tracking_url: tx.tracking_url_provider,
      carrier: tx.provider,
      service: tx.servicelevel?.name,
    })
  } catch (e) {
    logger.warn(`Reprint failed for ${transactionId}: ${(e as Error).message}`)
    res.status(502).json({
      message: "Failed to reprint label from Shippo",
      error: (e as Error).message,
    })
  }
}
