import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const PUBLIC_CODE = "DPSUPERFAM"
const SHIPPING_CODE = "DPSUPERFAM-SHIP-6J9K"
const PRODUCT_ID = "prod_01KQT97EZ14E8HKH75BNF6GQ61"
const LIMIT = 5

export default async function setupDPSuperfamPromo({ container }: ExecArgs) {
  const promotionService = container.resolve(Modules.PROMOTION)

  const existing = await promotionService.listPromotions(
    { code: [PUBLIC_CODE, SHIPPING_CODE] },
    { relations: ["application_method", "application_method.target_rules"] }
  )

  const existingCodes = new Set(existing.map((promotion) => promotion.code))
  const promotionsData = []

  if (!existingCodes.has(PUBLIC_CODE)) {
    promotionsData.push({
      code: PUBLIC_CODE,
      type: "standard" as const,
      status: "active" as const,
      is_automatic: false,
      limit: LIMIT,
      application_method: {
        type: "percentage" as const,
        target_type: "items" as const,
        allocation: "once" as const,
        value: 100,
        max_quantity: 1,
        target_rules: [
          {
            attribute: "items.product.id",
            operator: "eq" as const,
            values: [PRODUCT_ID],
          },
        ],
      },
    })
  }

  if (!existingCodes.has(SHIPPING_CODE)) {
    promotionsData.push({
      code: SHIPPING_CODE,
      type: "standard" as const,
      status: "active" as const,
      is_automatic: false,
      limit: LIMIT,
      application_method: {
        type: "percentage" as const,
        target_type: "shipping_methods" as const,
        allocation: "each" as const,
        value: 100,
        max_quantity: 1,
      },
    })
  }

  if (promotionsData.length) {
    await promotionService.createPromotions(promotionsData)
  }

  const activePromotions = await promotionService.listPromotions(
    { code: [PUBLIC_CODE, SHIPPING_CODE] },
    { relations: ["application_method", "application_method.target_rules"] }
  )

  for (const promotion of activePromotions) {
    console.log(
      [
        promotion.code,
        promotion.status,
        `limit=${promotion.limit ?? "none"}`,
        `used=${promotion.used ?? 0}`,
        `target=${promotion.application_method?.target_type ?? "none"}`,
        `value=${promotion.application_method?.value ?? "none"}`,
      ].join(" ")
    )
  }
}
