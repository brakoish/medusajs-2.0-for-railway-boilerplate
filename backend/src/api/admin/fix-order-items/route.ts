import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * POST /admin/fix-order-items
 *
 * One-time fix: sets requires_shipping=true on order line items that
 * were placed before the shipping profile was linked to the product.
 * Medusa's Create Fulfillment dialog only shows items with
 * requires_shipping=true; this corrects the data artifact.
 *
 * Body: { item_ids: string[] }  — or omit to fix ALL items with requires_shipping=false
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderModuleService = req.scope.resolve(Modules.ORDER)
  const { item_ids } = (req.body || {}) as { item_ids?: string[] }

  let updated: any[]

  if (item_ids?.length) {
    // Fix specific items
    const results = await Promise.all(
      item_ids.map((id) =>
        (orderModuleService as any).updateOrderLineItems(id, { requires_shipping: true })
      )
    )
    updated = results
  } else {
    // Fix all items where requires_shipping=false
    updated = await (orderModuleService as any).updateOrderLineItems(
      { requires_shipping: false },
      { requires_shipping: true }
    )
  }

  res.json({ fixed: updated.length ?? (Array.isArray(updated) ? updated.length : 1), items: updated })
}
