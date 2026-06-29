import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  ABANDONED_CART_PROMO_CODE,
  ABANDONED_CART_PROMO_LIMIT,
  ABANDONED_CART_PROMO_PERCENT,
} from "../lib/abandoned-cart-offer"

export default async function setupDabback10Promo({ container }: ExecArgs) {
  const promotionService = container.resolve(Modules.PROMOTION)

  const existing = await promotionService.listPromotions(
    { code: [ABANDONED_CART_PROMO_CODE] },
    { relations: ["application_method"] }
  )

  if (!existing.length) {
    await promotionService.createPromotions([
      {
        code: ABANDONED_CART_PROMO_CODE,
        type: "standard" as const,
        status: "active" as const,
        is_automatic: false,
        limit: ABANDONED_CART_PROMO_LIMIT,
        application_method: {
          type: "percentage" as const,
          target_type: "items" as const,
          allocation: "each" as const,
          value: ABANDONED_CART_PROMO_PERCENT,
        },
      },
    ])
  }

  const [promotion] = await promotionService.listPromotions(
    { code: [ABANDONED_CART_PROMO_CODE] },
    { relations: ["application_method"] }
  )

  if (promotion) {
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
