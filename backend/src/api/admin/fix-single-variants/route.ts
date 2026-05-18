import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * POST /admin/fix-single-variants
 *
 * One-time fix: DABPAL-1-BLK and DABPAL-1-WHT lost their Pack Size option
 * value when "1-Pack" was renamed to "Single". Re-attaches Pack Size=Single
 * to both variants directly via the product module service.
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const productService = req.scope.resolve(Modules.PRODUCT)

  const PACK_SIZE_OPT_ID = "opt_01KQT97EZ1APQSV4EJBHFP40GW"
  const SINGLE_OPTVAL_ID = "optval_01KRHDXCDCS5GRSB0YYVHBHNWS"

  const variants = [
    { id: "variant_01KREB21QZ5REXYNFVME6C22R2", sku: "DABPAL-1-WHT" },
    { id: "variant_01KREB7MPCF6RAXSQEXACNQT7K", sku: "DABPAL-1-BLK" },
  ]

  const results: any[] = []

  for (const variant of variants) {
    try {
      const updated = await productService.upsertProductVariants([{
        id: variant.id,
        options: [
          { option_id: PACK_SIZE_OPT_ID, value: "Single" },
        ],
      }])
      results.push({ sku: variant.sku, status: "ok", updated })
    } catch (err: any) {
      // Try alternative: update via product
      try {
        const updated2 = await (productService as any).updateVariants([{
          id: variant.id,
          options: [{ option_id: PACK_SIZE_OPT_ID, value: "Single" }],
        }])
        results.push({ sku: variant.sku, status: "ok-alt", updated: updated2 })
      } catch (err2: any) {
        results.push({ sku: variant.sku, status: "error", error: err2?.message })
      }
    }
  }

  res.json({ results })
}
