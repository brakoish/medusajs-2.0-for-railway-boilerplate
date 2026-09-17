jest.mock("@medusajs/medusa/core-flows", () => ({
  addToCartWorkflow: { hooks: { validate: jest.fn() } },
  createCartWorkflow: { hooks: { validate: jest.fn() } },
  completeCartWorkflow: { hooks: { validate: jest.fn() } },
}))
jest.mock("../dabpal-settings", () => ({ ...jest.requireActual("../dabpal-settings"), readSettings: jest.fn() }))
import { addToCartWorkflow, createCartWorkflow, completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { defaultSettings, readSettings, validateCustomBuild } from "../dabpal-settings"
import "../../workflows/hooks/custom-build"

const callbacks = [addToCartWorkflow, createCartWorkflow, completeCartWorkflow].map(workflow => (workflow.hooks.validate as jest.Mock).mock.calls[0][0])
const graph = jest.fn(async () => ({ data: [{ id: "custom", sku: "DABPAL-CUSTOM-SINGLE" }, { id: "standard", sku: "DABPAL-BLK-SINGLE" }] }))
const context = { container: { resolve: () => ({ graph }) } }
const enabled = { ...defaultSettings, custom: { ...defaultSettings.custom, enabled: true } }
const metadata = validateCustomBuild({ custom_colors: { body: { value: "#252525" }, lid: { value: "#252525" }, slider: { value: "#f6f6f3" } } }, enabled)
const run = (callback: any, items: any[]) => callback({ input: { items }, cart: { items } }, context)

test("all three cart workflows reject disabled, missing and forged custom builds", async () => {
  for (const callback of callbacks) {
    await expect(run(callback, [{ variant_id: "standard", metadata }])).rejects.toThrow("custom kit")
    ;(readSettings as jest.Mock).mockResolvedValue({ settings: defaultSettings })
    await expect(run(callback, [{ variant_id: "custom", metadata }])).rejects.toThrow("not available")
    ;(readSettings as jest.Mock).mockResolvedValue({ settings: enabled })
    await expect(run(callback, [{ variant_id: "custom" }])).rejects.toThrow("body")
    await expect(run(callback, [{ variant_id: "custom", metadata: { ...metadata, custom_color_summary: "Different build" } }])).rejects.toThrow("Refresh")
    await expect(run(callback, [{ variant_id: "custom", metadata }])).resolves.toBeDefined()
  }
})
test("standard orders and completed-cart recovery do not depend on custom availability", async () => {
  ;(readSettings as jest.Mock).mockRejectedValue(new Error("Settings unavailable"))
  for (const callback of callbacks) await expect(run(callback, [{ variant_id: "standard" }])).resolves.toBeDefined()
  expect(callbacks[2]({ cart: { completed_at: new Date(), items: [{ variant_id: "custom" }] } }, context)).toBeDefined()
  expect(readSettings).not.toHaveBeenCalled()
})
