import { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"
import { getProductByHandle } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductActions from "@modules/products/components/product-actions"
import ProductActionsWrapper from "@modules/products/templates/product-actions-wrapper"
import { VariantProvider } from "@modules/products/contexts/variant-context"
import ProductGallery from "./product-gallery"

const PRODUCT_HANDLE = "dab-pal"

export default async function BuySection({
  countryCode,
}: {
  countryCode: string
}) {
  const region = await getRegion(countryCode)
  if (!region) return null

  const product = await getProductByHandle(PRODUCT_HANDLE, region.id)
  if (!product) return null

  return (
    <section
      id="shop"
      className="bg-white pt-6 pb-12 small:py-24 border-b border-gray-100 scroll-mt-24"
    >
      <div className="content-container">
        <VariantProvider>
        <div className="grid grid-cols-1 small:grid-cols-2 gap-8 small:gap-16 items-start">
          {/* Product gallery — first on mobile, left on desktop.
              Gallery reads selectedVariantId from VariantProvider so it
              swaps the hero image when the buyer toggles Color. */}
          <div className="w-full">
            <ProductGallery
              images={product.images || []}
              variants={product.variants || []}
            />
          </div>

          {/* Title, variant selector, add-to-cart */}
          <div className="w-full small:sticky small:top-24 flex flex-col gap-6">
            <div>
              <h2 className="text-2xl small:text-4xl font-semibold tracking-tight leading-tight">
                Dab Pal — portable Q-tip & iso case
              </h2>
              <p className="text-gray-600 mt-3 leading-relaxed text-sm small:text-base">
                Holds 30 Q-tips and a 1oz iso bottle in a slim, friction-fit case with a built-in clean/dirty slider. Made for Puffco rigs and quartz bangers.
              </p>
            </div>
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                  hideMobileActions
                />
              }
            >
              <ProductActionsWrapper
                id={product.id}
                region={region}
                hideMobileActions
              />
            </Suspense>
            <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4 mt-2">
              Ships in 2–3 business days from Astoria, NY · 14-day returns
            </div>
          </div>
        </div>
        </VariantProvider>
      </div>
    </section>
  )
}
