import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { describeOperation, productionStages, saveProduction } from "../../../../../lib/dabpal-operations"
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as { stage?: string; note?: string; version?: number }
  if (!productionStages.includes(body?.stage as any) || typeof body.note !== "string" || body.note.length > 2000 || !Number.isInteger(body.version) || body.version! < 0) {
    res.status(400).json({ message: "Choose a production stage and a note under 2,000 characters." }); return
  }
  const { data } = await req.scope.resolve("query").graph({ entity: "order", filters: { id: req.params.id }, fields: ["id", "status", "canceled_at", "payment_collections.captured_amount", "payment_collections.refunded_amount", "payment_collections.amount", "payment_collections.status", "items.quantity", "items.requires_shipping", "items.detail.fulfilled_quantity"] })
  if (!data[0]) { res.status(404).json({ message: "Order not found." }); return }
  const operation = describeOperation(data[0])
  if (["canceled", "refunded", "awaiting_payment", "shipping"].includes(operation.stage)) { res.status(409).json({ message: "Only paid orders with items left to make can change production stage." }); return }
  const result = await saveProduction(req.params.id, body.stage!, body.note.trim(), body.version!, (req as any).auth_context?.actor_id || "admin")
  if (!result) { res.status(409).json({ message: "This order changed. Refresh before updating it." }); return }
  res.json({ production: result })
}
