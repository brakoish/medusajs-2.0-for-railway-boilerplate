import { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"
import { getProductByHandle } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductActions from "@modules/products/components/product-actions"
import ProductActionsWrapper from "@modules/products/templates/product-actions-wrapper"
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
      className="bg-white py-16 small:py-24 border-b border-gray-100 scroll-mt-16"
    >
      <div className="content-container">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-10 small:gap-16 items-start">
          {/* Left: product gallery */}
          <div className="w-full">
            <ProductGallery images={product.images || []} />
          </div>

          {/* Right: title, variant selector, add-to-cart */}
          <div className="w-full small:sticky small:top-24 flex flex-col gap-6">
            <div>
              <span className="uppercase tracking-[0.25em] text-xs text-gray-500">
                Made to order in NY
              </span>
              <h2 className="text-3xl small:text-4xl font-semibold tracking-tight mt-3 leading-tight">
                Dab Pal — portable Q-tip & iso case
              </h2>
              <p className="text-gray-600 mt-3 leading-relaxed">
                Hold 30 Q-tips and a 1oz iso bottle in a slim, friction-fit case with a built-in clean/dirty slider. Perfect for Puffco rigs and quartz bangers.
              </p>
            </div>
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
            <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4 mt-2">
              Ships in 2–3 business days from Astoria, NY · Free shipping over $50 · 14-day returns
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
