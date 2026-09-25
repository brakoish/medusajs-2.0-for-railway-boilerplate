import { Pool } from "pg"
import { z } from "@medusajs/framework/zod"

const text = z.string().trim().min(1).max(1000)
const image = z.string().refine(value => /^\/dab-pal\/[\w/.-]+$/.test(value) || /^https:\/\/bucket-production-a39d\.up\.railway\.app\/[\w/%.()-]+$/.test(value), "Choose a Dab Pal image or an uploaded product image.")
const color = z.object({ name: z.string().trim().min(1).max(40), value: z.string().regex(/^#[0-9a-fA-F]{6}$/) }).strict()
const palette = z.array(color).min(1).max(20).refine(colors => new Set(colors.map(c => c.value.toLowerCase())).size === colors.length, "Each color must be unique.")
const finish = z.object({ description: text, image, detail_image: image }).strict()
export const settingsSchema = z.object({
  title: z.string().trim().min(1).max(80), subtitle: z.string().trim().min(1).max(120),
  description: text, included: text, capacity: text, construction: text,
  instructions: z.array(text).min(1).max(8),
  finishes: z.object({ slate: finish, marble: finish }).strict(),
  custom: z.object({ enabled: z.boolean(), palettes: z.object({ body: palette, lid: palette, slider: palette }).strict() }).strict(),
}).strict()
export type DabPalSettings = z.infer<typeof settingsSchema>
export function settingsError(error: z.ZodError) {
  return error.issues.map(issue => {
    const path = issue.path.map(String)
    const label = path[0] === "custom" && path[1] === "palettes" ? `${path[2]} colors${path[3] ? `, color ${Number(path[3]) + 1}` : ""}${path[4] ? ` ${path[4]}` : ""}` : path.join(" ").replace(/_/g, " ")
    return `${label[0]?.toUpperCase()}${label.slice(1)}: ${issue.code === "too_small" && issue.type === "string" && issue.minimum === 1 ? "Enter a value." : issue.message}`
  }).join("; ")
}
const black = { name: "Black", value: "#252525" }, white = { name: "White", value: "#f6f6f3" }, pink = { name: "Pink", value: "#f4a8bf" }, amber = { name: "Amber", value: "#ed8f1f" }, sage = { name: "Sage", value: "#8fa78f" }
export const defaultSettings: DabPalSettings = {
  title: "Dab Pal", subtitle: "3D-printed swab case",
  description: "Keep fresh and used swabs separate, with space for your cleaning bottle.",
  included: "Includes case, slider, and empty 1 oz bottle. Swabs and isopropyl alcohol not included.",
  capacity: "80 × 80 × 25 mm closed. Holds 30 regular cotton swabs and the included 1 oz bottle. Specialty swab fit varies.",
  construction: "3D printed to order. Small variations in texture and visible print layers are part of the process.",
  instructions: ["Fill the 1 oz bottle with your preferred 90%+ isopropyl alcohol.", "Load clean cotton swabs into the clean side.", "Swab your Puffco bowl, e-rig chamber, or banger after each dab.", "Slide used swabs behind the slider, toward the hinge, until you can toss them."],
  finishes: {
    slate: { description: "Dark speckled finish. 3D printed to order.", image: "/dab-pal/model-2026-09/dab-pal-slate-closed.webp", detail_image: "/dab-pal/model-2026-09/dab-pal-slate-open.webp" },
    marble: { description: "Light, marble-look finish. 3D printed, not stone.", image: "/dab-pal/model-2026-09/dab-pal-marble-closed.webp", detail_image: "/dab-pal/model-2026-09/dab-pal-marble-open.webp" },
  },
  custom: { enabled: false, palettes: { body: [black, white, pink, amber, sage], lid: [black, white, amber, pink, { name: "Blue", value: "#6f95c9" }], slider: [white, black, amber, pink, sage] } },
}

let pool: Pool | undefined
let ready: Promise<unknown> | undefined
export function operationsDb() {
  if (!process.env.DATABASE_URL) throw new Error("Database unavailable")
  return pool ||= new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined })
}
async function initialize() {
  if (!ready) ready = operationsDb().query(`CREATE TABLE IF NOT EXISTS dabpal_settings (id integer PRIMARY KEY CHECK(id=1), settings jsonb NOT NULL, version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now())`).catch(error => { ready = undefined; throw error })
  await ready
}
export async function readSettings() {
  await initialize()
  const { rows } = await operationsDb().query("SELECT settings, version FROM dabpal_settings WHERE id=1")
  return rows[0] || { settings: defaultSettings, version: 0 }
}
export async function saveSettings(settings: DabPalSettings, version: number) {
  await initialize()
  const { rows } = version === 0
    ? await operationsDb().query("INSERT INTO dabpal_settings (id,settings) VALUES (1,$1) ON CONFLICT DO NOTHING RETURNING settings,version", [settings])
    : await operationsDb().query("UPDATE dabpal_settings SET settings=$1,version=version+1,updated_at=now() WHERE id=1 AND version=$2 RETURNING settings,version", [settings, version])
  return rows[0]
}

export function validateCustomBuild(metadata: Record<string, any> | undefined, settings: DabPalSettings) {
  if (!settings.custom.enabled) throw new Error("Custom orders are not available yet.")
  const colors: Record<string, { name: string; value: string }> = {}
  for (const part of ["body", "lid", "slider"] as const) {
    const selected = settings.custom.palettes[part].find(color => color.value.toLowerCase() === String(metadata?.custom_colors?.[part]?.value || "").toLowerCase())
    if (!selected) throw new Error(`Choose an available ${part} color.`)
    colors[part] = { name: selected.name!, value: selected.value! }
  }
  return { custom_build: "dab-pal", custom_colors: colors, custom_color_summary: Object.entries(colors).map(([part, c]) => `${part[0].toUpperCase()+part.slice(1)}: ${c.name} (${c.value})`).join(", ") }
}
