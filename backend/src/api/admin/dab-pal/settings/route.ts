import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readSettings, saveSettings, settingsError, settingsSchema } from "../../../../lib/dabpal-settings"

export async function GET(_req: MedusaRequest, res: MedusaResponse) { res.json(await readSettings()) }
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as { settings?: unknown; version?: number }
  const parsed = settingsSchema.safeParse(body?.settings)
  if (!parsed.success || !Number.isInteger(body?.version) || body.version! < 0) {
    res.status(400).json({ message: parsed.success ? "Reload the settings before saving." : settingsError(parsed.error) }); return
  }
  const result = await saveSettings(parsed.data, body.version!)
  if (!result) { res.status(409).json({ message: "Someone saved newer settings. Reload before editing again." }); return }
  res.json(result)
}
