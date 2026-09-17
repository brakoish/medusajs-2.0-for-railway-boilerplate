import { getDabPalSettings } from "@lib/data/dabpal-settings"
import { getProductByHandle } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { shopProducts } from "@modules/store/templates/shop-products"
import PalPickerClient from "./picker"

export default async function PalPicker({
  heading = "h2",
}: {
  heading?: "h1" | "h2"
}) {
  const [region, settings] = await Promise.all([getRegion("us"), getDabPalSettings()])
  const finishes = await Promise.all(
    shopProducts
      .filter((p) => p.available)
      .map(async (item) => {
        const product =
          region && item.medusaHandle
            ? await getProductByHandle(item.medusaHandle, region.id)
            : null
        const variant = product?.variants?.find((v) => v.sku === item.sku)
        const amount = variant?.calculated_price?.calculated_amount
        return {
          handle: item.handle,
          name: item.title,
          image: settings.finishes[item.handle === "black-speck" ? "slate" : "marble"].image,
          productId: product?.id,
          variantId: variant?.id,
          amount: typeof amount === "number" ? amount : null,
          currency: variant?.calculated_price?.currency_code || "usd",
          available:
            !!variant &&
            (!variant.manage_inventory ||
              !!variant.allow_backorder ||
              (variant.inventory_quantity || 0) > 0),
        }
      })
  )
  return <PalPickerClient finishes={finishes} heading={heading} />
}
