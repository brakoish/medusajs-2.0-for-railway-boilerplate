import { defineConfig } from "vite"
import path from "path"
import { defaultSettings, settingsError, settingsSchema } from "../../src/lib/dabpal-settings"
import { describeOperation, operationsSummary } from "../../src/lib/dabpal-operations"
let settings = structuredClone(defaultSettings), version = 0
const raw = (id: string, display_id: number, extra: any = {}) => ({ id, display_id, created_at: "2026-09-17T14:00:00Z", currency_code: "usd", status: "pending", shipping_address: { first_name: "Sample", last_name: `Customer ${display_id}` }, items: [{ id: `${id}_item`, variant_sku: "DABPAL-WHT-3", variant_title: "Marble / 3-Pack", quantity: 1, requires_shipping: true, detail: { fulfilled_quantity: 0 } }], payment_collections: [{ captured_amount: 65, refunded_amount: 0, amount: 65, status: "completed" }], fulfillments: [], ...extra })
let orders = [
  describeOperation(raw("order_sample", 104)),
  describeOperation(raw("order_custom", 105, { items: [{ id: "custom_item", variant_sku: "DABPAL-CUSTOM-SINGLE", variant_title: "Custom Color", quantity: 2, metadata: { custom_build: "dab-pal", custom_colors: { body: { name: "Black", value: "#252525" }, lid: { name: "Amber", value: "#ed8f1f" }, slider: { name: "Pink", value: "#f4a8bf" } }, custom_color_summary: "Body: Black (#252525), Lid: Amber (#ed8f1f), Slider: Pink (#f4a8bf)" } }] }), { stage: "printing", note: "Keep both kits together.", version: 1 }),
  describeOperation(raw("order_shipping", 103, { items: [{ id: "sent_item", variant_sku: "DABPAL-BLK-SINGLE", quantity: 1, detail: { fulfilled_quantity: 1 } }], fulfillments: [{ id: "ful_sample", data: { tracking_status: { status: "TRANSIT" }, tracking_email_sent_at: "2026-09-17" } }] })),
  describeOperation(raw("order_unpaid", 106, { payment_collections: [{ captured_amount: 0, authorized_amount: 65, amount: 65, status: "authorized" }] })),
]
export default defineConfig({ root: __dirname, resolve: { alias: { "@medusajs/admin-sdk": path.join(__dirname, "../shipping-preview/admin-sdk.ts") } }, esbuild: { jsx: "automatic" }, server: { host: "127.0.0.1", port: 4182, strictPort: true }, plugins: [{ name: "isolated-operations-review", configureServer(server) {
  server.middlewares.use(async (req, res, next) => {
    const pathname = new URL(req.url || "/", "http://localhost").pathname
    if (!pathname.startsWith("/admin/")) { next(); return }
    const json = (body: any, status = 200) => { res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(body)) }
    let body: any = {}
    if (req.method === "POST") { let value = ""; for await (const chunk of req) value += chunk; try { body = JSON.parse(value) } catch { json({ message: "Invalid request" }, 400); return } }
    if (pathname === "/admin/dab-pal/settings") {
      if (req.method === "POST") {
        const parsed = settingsSchema.safeParse(body.settings)
        if (!parsed.success) { json({ message: settingsError(parsed.error) }, 400); return }
        if (body.version !== version) { json({ message: "Someone saved newer settings. Reload before editing again." }, 409); return }
        settings = parsed.data; version++
      }
      json({ settings, version }); return
    }
    if (pathname === "/admin/dab-pal/operations") { json({ orders, summary: operationsSummary(orders) }); return }
    if (pathname.startsWith("/admin/dab-pal/operations/")) {
      const order = orders.find(o => o.id === pathname.split("/").pop())
      if (!order || !["to_make", "printing", "ready_to_pack"].includes(order.stage)) { json({ message: "Only paid open orders can be updated." }, 409); return }
      if (body.version !== order.production.version) { json({ message: "Order changed. Refresh first." }, 409); return }
      order.stage = body.stage; order.production = { stage: body.stage, note: body.note, version: body.version + 1, updated_at: new Date().toISOString() }
      json({ production: order.production }); return
    }
    json({ message: "This is a local preview; this action is unavailable." }, 404)
  })
} }] })
