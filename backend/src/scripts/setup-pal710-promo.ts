import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const CODE = "PAL710"
const DISCOUNT_AMOUNT = 7.1
const CAMPAIGN_IDENTIFIER = "pal710-2026-07-10"
const ENDS_AT = new Date("2026-07-13T03:59:00.000Z")

export default async function setupPal710Promo({ container }: ExecArgs) {
  const promotionService = container.resolve(Modules.PROMOTION)

  const existing = await promotionService.listPromotions(
    { code: [CODE] },
    { relations: ["application_method", "campaign"] }
  )

  if (!existing.length) {
    await promotionService.createPromotions([
      {
        code: CODE,
        type: "standard" as const,
        status: "active" as const,
        is_automatic: false,
        application_method: {
          type: "fixed" as const,
          target_type: "items" as const,
          allocation: "across" as const,
          value: DISCOUNT_AMOUNT,
          currency_code: "usd",
        },
        campaign: {
          name: "PAL710 July Sale",
          description: "$7.10 off Dab Pal orders through July 12.",
          campaign_identifier: CAMPAIGN_IDENTIFIER,
          ends_at: ENDS_AT,
        },
      },
    ])
  }

  const [promotion] = await promotionService.listPromotions(
    { code: [CODE] },
    { relations: ["application_method", "campaign"] }
  )

  if (promotion) {
    console.log(
      [
        promotion.code,
        promotion.status,
        `limit=${promotion.limit ?? "none"}`,
        `used=${promotion.used ?? 0}`,
        `target=${promotion.application_method?.target_type ?? "none"}`,
        `type=${promotion.application_method?.type ?? "none"}`,
        `value=${promotion.application_method?.value ?? "none"}`,
        `currency=${promotion.application_method?.currency_code ?? "none"}`,
        `ends=${promotion.campaign?.ends_at?.toISOString?.() ?? "none"}`,
      ].join(" ")
    )
  }
}
