import { getDabPalSettings } from "@lib/data/dabpal-settings"
import { Metadata } from "next"
import { getProductByHandle } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import CustomizerPreview from "@modules/store/components/customizer-preview"
import { getShopProduct } from "@modules/store/templates/shop-products"
import { getBaseURL } from "@lib/util/env"

export const dynamic = "force-dynamic"
export async function generateMetadata(): Promise<Metadata> {
  const { custom } = await getDabPalSettings()
  return {
  title: custom.enabled ? "Custom Dab Pal" : "Custom Dab Pal preview",
  description: custom.enabled ? "Choose your body, lid and slider colors. Each custom Dab Pal is 3D printed to order." : "Preview body, lid and slider colors. Custom orders are coming soon; Slate and Marble are available now.",
  alternates: { canonical: `${getBaseURL()}/store/custom` },
  robots: { index: false, follow: true },
  }
}

export default async function CustomPage() {
  const product = getShopProduct("custom")!
  const [region, settings] = await Promise.all([getRegion("us"), getDabPalSettings()])
  const catalog = region && product.medusaHandle
    ? await getProductByHandle(product.medusaHandle, region.id)
    : null
  return <main><CustomizerPreview product={catalog} ordersEnabled={settings.custom.enabled} palettes={settings.custom.palettes} /></main>
}
