import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const PUBLIC_CODE = "DPSUPERFAM"
const SHIPPING_CODE = "DPSUPERFAM-SHIP-6J9K"
const SINGLE_VARIANT_IDS = [
  "variant_01KREB7MPCF6RAXSQEXACNQT7K",
  "variant_01KREB21QZ5REXYNFVME6C22R2",
]
const LIMIT = 5

function targetRuleIsCurrent(rule: {
  attribute?: string
  operator?: string
  values?: { value?: string }[]
}) {
  const values = new Set(rule.values?.map((value) => value.value))

  return (
    rule.attribute === "items.variant_id" &&
    rule.operator === "in" &&
    SINGLE_VARIANT_IDS.every((variantId) => values.has(variantId)) &&
    values.size === SINGLE_VARIANT_IDS.length
  )
}

export default async function setupDPSuperfamPromo({ container }: ExecArgs) {
  const promotionService = container.resolve(Modules.PROMOTION)

  const existing = await promotionService.listPromotions(
    { code: [PUBLIC_CODE, SHIPPING_CODE] },
    {
      relations: [
        "application_method",
        "application_method.target_rules",
        "rules",
      ],
    }
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
            attribute: "items.variant_id",
            operator: "in" as const,
            values: SINGLE_VARIANT_IDS,
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
      rules: [
        {
          attribute: "items.variant_id",
          operator: "in" as const,
          values: SINGLE_VARIANT_IDS,
        },
      ],
    })
  }

  if (promotionsData.length) {
    await promotionService.createPromotions(promotionsData)
  }

  let activePromotions = await promotionService.listPromotions(
    { code: [PUBLIC_CODE, SHIPPING_CODE] },
    {
      relations: [
        "application_method",
        "application_method.target_rules",
        "rules",
      ],
    }
  )

  const publicPromotion = activePromotions.find(
    (promotion) => promotion.code === PUBLIC_CODE
  )
  const targetRules = publicPromotion?.application_method?.target_rules ?? []
  if (
    publicPromotion &&
    (targetRules.length !== 1 || !targetRuleIsCurrent(targetRules[0]))
  ) {
    if (targetRules.length) {
      await promotionService.removePromotionTargetRules(
        publicPromotion.id,
        targetRules.map((rule) => rule.id)
      )
    }

    await promotionService.addPromotionTargetRules(publicPromotion.id, [
      {
        attribute: "items.variant_id",
        operator: "in",
        values: SINGLE_VARIANT_IDS,
      },
    ])

    activePromotions = await promotionService.listPromotions(
      { code: [PUBLIC_CODE, SHIPPING_CODE] },
      {
        relations: [
          "application_method",
          "application_method.target_rules",
          "rules",
        ],
      }
    )
  }

  const shippingPromotion = activePromotions.find(
    (promotion) => promotion.code === SHIPPING_CODE
  )
  const shippingRules = shippingPromotion?.rules ?? []
  if (
    shippingPromotion &&
    (shippingRules.length !== 1 || !targetRuleIsCurrent(shippingRules[0]))
  ) {
    if (shippingRules.length) {
      await promotionService.removePromotionRules(
        shippingPromotion.id,
        shippingRules.map((rule) => rule.id)
      )
    }

    await promotionService.addPromotionRules(shippingPromotion.id, [
      {
        attribute: "items.variant_id",
        operator: "in",
        values: SINGLE_VARIANT_IDS,
      },
    ])

    activePromotions = await promotionService.listPromotions(
      { code: [PUBLIC_CODE, SHIPPING_CODE] },
      {
        relations: [
          "application_method",
          "application_method.target_rules",
          "rules",
        ],
      }
    )
  }

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
