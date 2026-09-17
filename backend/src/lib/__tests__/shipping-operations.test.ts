jest.mock("pg", () => {
  const { PGlite } = require("@electric-sql/pglite")
  const db = new PGlite()
  return { closeTestDatabase: () => db.close(), Pool: class { async query(sql: string, params?: unknown[]) { const result = await db.query(sql, params); return { rows: result.rows, rowCount: result.affectedRows } } } }
})
import { defaultSettings, readSettings, saveSettings, settingsSchema, validateCustomBuild } from "../dabpal-settings"
import { describeOperation, operationsSummary, saveProduction } from "../dabpal-operations"
import { isActiveOperation } from "../dabpal-order-state"
beforeAll(() => { process.env.DATABASE_URL = "postgres://isolated-test-only" })
test("a delivered partial shipment stays active until all items are fulfilled", () => {
  expect(isActiveOperation({ stage: "printing", items: [{ remaining: 1 }], shipments: [{ stage: "delivered" }] })).toBe(true)
  expect(isActiveOperation({ stage: "shipping", items: [{ remaining: 0 }], shipments: [{ stage: "delivered" }] })).toBe(false)
})
afterAll(async () => { await (require("pg") as any).closeTestDatabase() })

test("settings and production use optimistic locking instead of lost updates", async () => {
  expect((await readSettings()).version).toBe(0)
  const initial = await saveSettings(defaultSettings, 0)
  expect(initial.version).toBe(1)
  const outcomes = await Promise.all([saveSettings({ ...defaultSettings, title: "First" }, 1), saveSettings({ ...defaultSettings, title: "Second" }, 1)])
  expect(outcomes.filter(Boolean)).toHaveLength(1)
  expect((await readSettings()).version).toBe(2)
  expect((await saveProduction("order_test", "printing", "Build note", 0, "test")).version).toBe(1)
  expect(await saveProduction("order_test", "ready_to_pack", "Stale note", 0, "test")).toBeUndefined()
})
test("custom ordering validates enabled state and all three palette choices", () => {
  expect(() => validateCustomBuild({}, defaultSettings)).toThrow("not available")
  const settings = { ...defaultSettings, custom: { ...defaultSettings.custom, enabled: true } }
  expect(() => validateCustomBuild({}, settings)).toThrow("body")
  const metadata = { custom_colors: { body: { value: "#252525", name: "Forged" }, lid: { value: "#252525" }, slider: { value: "#f6f6f3" } } }
  const validated = validateCustomBuild(metadata, settings)
  expect(validated.custom_colors.body.name).toBe("Black")
  expect(validated.custom_color_summary).toContain("Slider: White")
  expect(settingsSchema.safeParse({ ...defaultSettings, finishes: { ...defaultSettings.finishes, slate: { ...defaultSettings.finishes.slate, image: "javascript:alert(1)" } } }).success).toBe(false)
  expect(settingsSchema.safeParse(defaultSettings).success).toBe(true)
})
test("money uses actual captures/refunds and carrier states, not order.status", () => {
  const base = { id: "order_one", status: "pending", currency_code: "usd", items: [{ id: "item", quantity: 1, detail: { fulfilled_quantity: 1 } }], payment_collections: [{ amount: 65, captured_amount: 65, refunded_amount: 5 }], fulfillments: [{ id: "ful_one", data: { tracking_status: { status: "TRANSIT" } } }] }
  const paid = describeOperation(base)
  expect(paid.stage).toBe("shipping")
  const unpaid = describeOperation({ ...base, id: "order_two", payment_collections: [{ authorized_amount: 25, captured_amount: 0 }], fulfillments: [] })
  expect(unpaid.stage).toBe("awaiting_payment")
  const summary = operationsSummary([paid, unpaid])
  expect(summary.currencies.usd).toEqual({ captured: 65, refunded: 5, net: 60 })
  expect(summary.shipped_orders).toBe(1)
  expect(summary.awaiting_payment).toBe(1)
  expect(describeOperation({ ...base, payment_collections: [{ captured_amount: 65, refunded_amount: 65 }] }).stage).toBe("refunded")
  expect(describeOperation({ ...base, canceled_at: new Date() }).stage).toBe("canceled")
  expect(describeOperation({ ...base, payment_collections: [{ amount: 65, captured_amount: 25 }] }).stage).toBe("awaiting_payment")
  expect(describeOperation({ ...base, payment_collections: [{ amount: 0, captured_amount: 0, status: "completed" }] }).paid).toBe(true)
  expect(describeOperation({ ...base, fulfillments: [], items: [{ quantity: 2, detail: { fulfilled_quantity: 1 } }] }, { stage: "printing" }).stage).toBe("printing")
})
