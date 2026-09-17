import { addToCartWorkflow, completeCartWorkflow, createCartWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { readSettings, validateCustomBuild } from "../../lib/dabpal-settings"

async function validateItems(items: any[] | undefined, container: MedusaContainer) {
  const ids = [...new Set((items || []).map(item => item.variant_id).filter(Boolean))]
  if (!ids.length) return new StepResponse()
  const { data } = await container.resolve("query").graph({ entity: "product_variant", fields: ["id", "sku"], filters: { id: ids } })
  const customIds = new Set(data.filter(v => v.sku === "DABPAL-CUSTOM-SINGLE").map(v => v.id))
  if (items!.some(item => !customIds.has(item.variant_id) && (item.metadata?.custom_build || item.metadata?.custom_colors || item.metadata?.custom_color_summary))) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Choose the custom kit to order custom colors.")
  const customItems = items!.filter(item => customIds.has(item.variant_id))
  if (!customItems.length) return new StepResponse()
  const { settings } = await readSettings()
  for (const item of customItems) {
    try {
      const normalized = validateCustomBuild(item.metadata, settings)
      if (item.metadata?.custom_build !== normalized.custom_build || item.metadata?.custom_color_summary !== normalized.custom_color_summary || ["body", "lid", "slider"].some(part => item.metadata?.custom_colors?.[part]?.name !== normalized.custom_colors[part].name)) throw new Error("Refresh your custom build before adding it to the cart.")
    } catch (error) { throw new MedusaError(MedusaError.Types.INVALID_DATA, (error as Error).message) }
  }
  return new StepResponse()
}
addToCartWorkflow.hooks.validate(({ input }, { container }) => validateItems(input.items as any[], container))
createCartWorkflow.hooks.validate(({ cart }, { container }) => validateItems(cart.items as any[], container))
completeCartWorkflow.hooks.validate(({ cart }, { container }) => cart.completed_at ? new StepResponse() : validateItems(cart.items as any[], container))
