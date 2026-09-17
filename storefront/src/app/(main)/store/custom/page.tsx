import { Metadata } from "next"
import { getProductByHandle } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import CustomizerPreview from "@modules/store/components/customizer-preview"
import { getShopProduct } from "@modules/store/templates/shop-products"
import { getBaseURL } from "@lib/util/env"

export const revalidate = 300
export const metadata: Metadata = {
  title: "Custom Dab Pal preview",
  description: "Preview body, lid and slider colors. Custom orders are coming soon; Slate and Marble are available now.",
  alternates: { canonical: `${getBaseURL()}/store/custom` },
  robots: { index: false, follow: true },
}

export default async function CustomPage() {
  const product = getShopProduct("custom")!
  const region = await getRegion("us")
  const catalog = region && product.medusaHandle
    ? await getProductByHandle(product.medusaHandle, region.id)
    : null
  return <main><CustomizerPreview product={catalog} ordersEnabled={product.available} /></main>
}
