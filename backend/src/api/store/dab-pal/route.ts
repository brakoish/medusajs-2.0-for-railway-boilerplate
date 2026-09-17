import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readSettings } from "../../../lib/dabpal-settings"
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  res.json(await readSettings())
}
