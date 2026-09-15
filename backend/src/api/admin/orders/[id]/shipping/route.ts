import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { shippingQueue } from "../../../../../lib/shipping-queue"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json(await shippingQueue(req.scope, [req.params.id as string]))
}
