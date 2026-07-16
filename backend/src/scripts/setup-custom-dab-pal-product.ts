import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

const CUSTOM_HANDLE = "dab-pal-custom"
const CUSTOM_SKU = "DABPAL-CUSTOM-SINGLE"
const FALLBACK_SHIPPING_PROFILE_ID = "sp_01KPC1VXSBJFJCXR1ZCWZ67GW1"
const CUSTOM_IMAGE =
  "https://bucket-production-a39d.up.railway.app/medusa-media/dab-pal-real-1024-01KQT97W2TVQHA8WVCR51M0CFE.png"

export default async function setupCustomDabPalProduct({
  container,
}: ExecArgs) {
  const productService = container.resolve(Modules.PRODUCT)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

  const [defaultSalesChannel] = await salesChannelService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!defaultSalesChannel) {
    throw new Error("Default Sales Channel not found")
  }

  const existing = await productService.listProducts(
    { handle: [CUSTOM_HANDLE, "dab-pal-black-speck"] },
    { relations: ["variants"] }
  )
  const customProduct = existing.find((product) => product.handle === CUSTOM_HANDLE)
  const blackProduct = existing.find((product) => product.handle === "dab-pal-black-speck")
  const shippingProfileId =
    (blackProduct as { shipping_profile_id?: string } | undefined)
      ?.shipping_profile_id ?? FALLBACK_SHIPPING_PROFILE_ID

  if (!customProduct) {
    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "Custom Dab Pal",
            subtitle: "Made to order",
            description:
              "Made-to-order Dab Pal with customer-selected body, lid, and slider colors.",
            handle: CUSTOM_HANDLE,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfileId,
            weight: 113,
            thumbnail: CUSTOM_IMAGE,
            images: [{ url: CUSTOM_IMAGE }],
            options: [{ title: "Build", values: ["Custom Color"] }],
            variants: [
              {
                title: "Custom Color",
                sku: CUSTOM_SKU,
                manage_inventory: false,
                allow_backorder: false,
                weight: 113,
                options: { Build: "Custom Color" },
                prices: [{ amount: 35, currency_code: "usd" }],
              },
            ],
            sales_channels: [{ id: defaultSalesChannel.id }],
          },
        ],
      },
    })
  } else if (customProduct.status !== ProductStatus.PUBLISHED) {
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: customProduct.id },
        update: { status: ProductStatus.PUBLISHED },
      },
    })
  }

  const [product] = await productService.listProducts(
    { handle: [CUSTOM_HANDLE] },
    { relations: ["variants"] }
  )
  const variant = product?.variants?.find((item) => item.sku === CUSTOM_SKU)

  console.log(
    [
      product?.handle ?? CUSTOM_HANDLE,
      product?.status ?? "missing",
      variant ? `${variant.sku}:${variant.id}` : `${CUSTOM_SKU}:missing`,
    ].join(" ")
  )
}
