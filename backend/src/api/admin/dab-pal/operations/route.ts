import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listOperations, operationsSummary } from "../../../../lib/dabpal-operations"
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orders = await listOperations(req.scope)
  res.json({ orders, summary: operationsSummary(orders) })
}
