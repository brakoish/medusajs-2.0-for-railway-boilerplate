import { Suspense } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"

import { getProductByHandle } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductActions from "@modules/products/components/product-actions"
import { VariantProvider } from "@modules/products/contexts/variant-context"
import ProductActionsWrapper from "@modules/products/templates/product-actions-wrapper"
import { ShopProduct } from "./shop-products"

const details = [
  ["Inside", "30 Q-tips, 1oz iso bottle, clean/dirty slider."],
  ["Fit", "Pocket-sized case for Puffco and quartz banger cleaning."],
  ["Shipping", "Made in NY and ships in 1 to 2 business days."],
]

const FinishProductTemplate = async ({
  product,
  countryCode,
}: {
  product: ShopProduct
  countryCode: string
}) => {
  if (!product.available || !product.sku || !product.medusaHandle) {
    return <ComingSoonProduct product={product} />
  }

  const region = await getRegion(countryCode)
  if (!region) notFound()

  const medusaProduct = await getProductByHandle(product.medusaHandle, region.id)
  if (!medusaProduct) notFound()

  return (
    <main className="bg-white">
      <section className="content-container py-8 small:py-12">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <LocalizedClientLink href="/store" className="hover:text-gray-900">
            Shop
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 small:grid-cols-[1.08fr_0.92fr] gap-8 small:gap-16 items-start">
          <div className="grid grid-cols-1 gap-4">
            <div className="relative aspect-square rounded-lg bg-zinc-50 overflow-hidden">
              <Image
                src={product.image}
                alt={`${product.title} Dab Pal`}
                fill
                priority
                sizes="(max-width: 800px) 100vw, 55vw"
                className="object-contain p-8 small:p-14"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Front", "Bottle", "Slider"].map((label) => (
                <div
                  key={label}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <span className="text-xs uppercase tracking-[0.18em] text-gray-400">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="small:sticky small:top-28">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-700">
              {product.subtitle}
            </span>
            <h1 className="mt-3 text-3xl small:text-5xl font-semibold tracking-tight leading-tight text-gray-950">
              {product.title} Dab Pal
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              {product.description}
            </p>

            <div className="mt-7 border-y border-gray-200 py-6">
              <VariantProvider>
                <Suspense
                  fallback={
                    <ProductActions
                      disabled
                      product={medusaProduct}
                      region={region}
                      hideMobileActions
                      initialVariantSku={product.sku}
                    />
                  }
                >
                  <ProductActionsWrapper
                    id={medusaProduct.id!}
                    region={region}
                    hideMobileActions
                    initialVariantSku={product.sku}
                  />
                </Suspense>
              </VariantProvider>
            </div>

            <div className="divide-y divide-gray-200">
              {details.map(([title, body]) => (
                <div key={title} className="py-4">
                  <h2 className="text-sm font-semibold text-gray-950">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

const ComingSoonProduct = ({ product }: { product: ShopProduct }) => {
  return (
    <main className="bg-zinc-950 text-white">
      <section className="content-container grid min-h-[calc(100vh-160px)] grid-cols-1 small:grid-cols-[0.9fr_1.1fr] gap-8 small:gap-16 items-center py-12 small:py-20">
        <div>
          <LocalizedClientLink
            href="/store"
            className="text-sm text-white/60 hover:text-white"
          >
            Back to shop
          </LocalizedClientLink>
          <span className="mt-8 block text-xs uppercase tracking-[0.25em] text-amber-400">
            {product.subtitle}
          </span>
          <h1 className="mt-3 text-4xl small:text-6xl font-semibold tracking-tight leading-[1.05]">
            Custom Dab Pal.
          </h1>
          <p className="mt-5 max-w-xl text-base small:text-lg leading-relaxed text-white/70">
            We are testing custom colorways and name plates next. Black Speck and White Speck are available now.
          </p>
          <LocalizedClientLink
            href="/store"
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"
          >
            Shop available finishes
          </LocalizedClientLink>
        </div>
        <div className="relative aspect-[4/3] rounded-lg bg-white/5 overflow-hidden">
          <Image
            src={product.image}
            alt="Custom Dab Pal preview"
            fill
            sizes="(max-width: 800px) 100vw, 55vw"
            className="object-contain p-6"
          />
        </div>
      </section>
    </main>
  )
}

export default FinishProductTemplate
