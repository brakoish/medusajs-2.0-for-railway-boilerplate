import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { sendTrackingEmailForFulfillment } from "../../../../../lib/tracking-email"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { fulfillment_id } = (req.body || {}) as { fulfillment_id?: string }
  if (!fulfillment_id) { res.status(400).json({ error: "Fulfillment is required" }); return }
  const query = req.scope.resolve("query")
  const { data } = await query.graph({ entity: "order", filters: { id: req.params.id }, fields: ["id", "fulfillments.id"] })
  if (!data[0]?.fulfillments?.some((f: { id: string }) => f.id === fulfillment_id)) {
    res.status(404).json({ error: "Fulfillment not found on this order" }); return
  }
  const result = await sendTrackingEmailForFulfillment(req.scope, fulfillment_id)
  if (result === "waiting_for_carrier") { res.status(409).json({ error: "Shipping email waits for the first carrier scan." }); return }
  if (result === "needs_attention" || result === "missing_data") { res.status(409).json({ error: "Review this notification in Email Studio before sending again." }); return }
  res.json({ ok: true, status: result })
}
