import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

const OLD_HANDLE = "dab-pal"
const BLACK_HANDLE = "dab-pal-black-speck"
const WHITE_HANDLE = "dab-pal-white-speck"

const BLACK_IMAGE =
  "https://bucket-production-a39d.up.railway.app/medusa-media/dab-pal-real-1024-01KQT97W2TVQHA8WVCR51M0CFE.png"
const WHITE_IMAGE =
  "https://bucket-production-a39d.up.railway.app/medusa-media/dab-pal-white-speck-01KQZEYE85DNKAE6NAGKBW5S71.jpg"
const LIFESTYLE_IMAGES = [
  "https://bucket-production-a39d.up.railway.app/medusa-media/il_fullxfull.4498288466_5ynl---77d20706-64b8-4a83-93a5-c3d261a1a82f-01KRBQ8BM9YRZ3CX2AJGGH5DW8.png",
  "https://bucket-production-a39d.up.railway.app/medusa-media/il_fullxfull.4498288668_gozq---13e63da0-b9ab-4752-87d1-07d48f5b5d54-01KRBQ9AM27BG0ZYEEN35NHK8X.png",
  "https://bucket-production-a39d.up.railway.app/medusa-media/il_fullxfull.4671529917_6j4p---277aa439-cd5c-4f51-bbfe-0a19c4ac0425-01KRBQA2D8VB84KZK5TQW26FNE.png",
]

const packVariants = [
  { pack: "Single", amount: 25, suffix: "SINGLE" },
  { pack: "3-Pack", amount: 65, suffix: "3" },
  { pack: "6-Pack", amount: 120, suffix: "6" },
]

const PUBLIC_CODE = "DPSUPERFAM"
const SHIPPING_CODE = "DPSUPERFAM-SHIP-6J9K"

function targetRuleMatches(rule: {
  attribute?: string
  operator?: string
  values?: { value?: string }[]
}, variantIds: string[]) {
  const values = new Set(rule.values?.map((value) => value.value))

  return (
    rule.attribute === "items.variant_id" &&
    rule.operator === "in" &&
    variantIds.every((variantId) => values.has(variantId)) &&
    values.size === variantIds.length
  )
}

export default async function splitDabPalProducts({ container }: ExecArgs) {
  const productService = container.resolve(Modules.PRODUCT)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const promotionService = container.resolve(Modules.PROMOTION)

  const existingProducts = await productService.listProducts(
    { handle: [OLD_HANDLE, BLACK_HANDLE, WHITE_HANDLE] },
    { relations: ["variants"] }
  )
  const byHandle = new Map(
    existingProducts.map((product) => [product.handle, product])
  )
  const oldProduct = byHandle.get(OLD_HANDLE)
  const shippingProfileId = (oldProduct as { shipping_profile_id?: string })
    ?.shipping_profile_id

  if (!oldProduct || !shippingProfileId) {
    throw new Error("Legacy dab-pal product or shipping profile not found")
  }

  const [defaultSalesChannel] = await salesChannelService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!defaultSalesChannel) {
    throw new Error("Default Sales Channel not found")
  }

  const productsToCreate = []

  if (!byHandle.has(BLACK_HANDLE)) {
    productsToCreate.push({
      title: "Black Speck Dab Pal",
      subtitle: "Original finish",
      description:
        "Matte black speck case with a 1oz iso bottle, 30 Q-tips, and the clean/dirty slider.",
      handle: BLACK_HANDLE,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfileId,
      weight: 113,
      thumbnail: BLACK_IMAGE,
      images: [BLACK_IMAGE, ...LIFESTYLE_IMAGES].map((url) => ({ url })),
      options: [{ title: "Pack Size", values: ["Single", "3-Pack", "6-Pack"] }],
      variants: packVariants.map((variant) => ({
        title: variant.pack,
        sku: `DABPAL-BLK-${variant.suffix}`,
        manage_inventory: false,
        allow_backorder: false,
        weight: 113,
        thumbnail: BLACK_IMAGE,
        options: { "Pack Size": variant.pack },
        prices: [{ amount: variant.amount, currency_code: "usd" }],
      })),
      sales_channels: [{ id: defaultSalesChannel.id }],
    })
  }

  if (!byHandle.has(WHITE_HANDLE)) {
    productsToCreate.push({
      title: "White Speck Dab Pal",
      subtitle: "Bright finish",
      description:
        "White speck case with a 1oz iso bottle, 30 Q-tips, and the clean/dirty slider.",
      handle: WHITE_HANDLE,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfileId,
      weight: 113,
      thumbnail: WHITE_IMAGE,
      images: [WHITE_IMAGE, ...LIFESTYLE_IMAGES].map((url) => ({ url })),
      options: [{ title: "Pack Size", values: ["Single", "3-Pack", "6-Pack"] }],
      variants: packVariants.map((variant) => ({
        title: variant.pack,
        sku: `DABPAL-WHT-${variant.suffix}`,
        manage_inventory: false,
        allow_backorder: false,
        weight: 113,
        thumbnail: WHITE_IMAGE,
        options: { "Pack Size": variant.pack },
        prices: [{ amount: variant.amount, currency_code: "usd" }],
      })),
      sales_channels: [{ id: defaultSalesChannel.id }],
    })
  }

  if (productsToCreate.length) {
    await createProductsWorkflow(container).run({
      input: { products: productsToCreate },
    })
  }

  if (oldProduct.status !== ProductStatus.DRAFT) {
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: oldProduct.id },
        update: { status: ProductStatus.DRAFT },
      },
    })
  }

  const splitProducts = await productService.listProducts(
    { handle: [BLACK_HANDLE, WHITE_HANDLE] },
    { relations: ["variants"] }
  )
  const singleVariantIds = splitProducts
    .flatMap((product) => product.variants ?? [])
    .filter((variant) =>
      ["DABPAL-BLK-SINGLE", "DABPAL-WHT-SINGLE"].includes(variant.sku ?? "")
    )
    .map((variant) => variant.id)

  if (singleVariantIds.length !== 2) {
    throw new Error("Expected two split Single variants")
  }

  const promotions = await promotionService.listPromotions(
    { code: [PUBLIC_CODE, SHIPPING_CODE] },
    {
      relations: [
        "application_method",
        "application_method.target_rules",
        "rules",
      ],
    }
  )

  const publicPromotion = promotions.find(
    (promotion) => promotion.code === PUBLIC_CODE
  )
  const publicRules = publicPromotion?.application_method?.target_rules ?? []
  if (
    publicPromotion &&
    (publicRules.length !== 1 ||
      !targetRuleMatches(publicRules[0], singleVariantIds))
  ) {
    if (publicRules.length) {
      await promotionService.removePromotionTargetRules(
        publicPromotion.id,
        publicRules.map((rule) => rule.id)
      )
    }
    await promotionService.addPromotionTargetRules(publicPromotion.id, [
      {
        attribute: "items.variant_id",
        operator: "in",
        values: singleVariantIds,
      },
    ])
  }

  const shippingPromotion = promotions.find(
    (promotion) => promotion.code === SHIPPING_CODE
  )
  const shippingRules = shippingPromotion?.rules ?? []
  if (
    shippingPromotion &&
    (shippingRules.length !== 1 ||
      !targetRuleMatches(shippingRules[0], singleVariantIds))
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
        values: singleVariantIds,
      },
    ])
  }

  for (const product of splitProducts) {
    console.log(
      [
        product.handle,
        product.status,
        ...(product.variants ?? []).map((variant) => `${variant.sku}:${variant.id}`),
      ].join(" ")
    )
  }
  console.log(`${OLD_HANDLE} drafted`)
}
