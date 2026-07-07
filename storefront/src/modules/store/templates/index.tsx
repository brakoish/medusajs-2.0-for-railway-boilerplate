import { Suspense } from "react"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

import { getProductByHandle } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductActions from "@modules/products/components/product-actions"
import ProductActionsWrapper from "@modules/products/templates/product-actions-wrapper"
import { VariantProvider } from "@modules/products/contexts/variant-context"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_HANDLE = "dab-pal"

const finishes = [
  {
    id: "black",
    title: "Black Speck",
    description: "The original Dab Pal, made to disappear in a travel bag.",
    image: "/dab-pal/product-front.png",
    href: "#black",
    cta: "Shop Black",
    meta: "From $25",
  },
  {
    id: "white",
    title: "White Speck",
    description: "Same pocket case, brighter finish, easy to spot on a desk.",
    image: "/dab-pal/product-front-white.jpg",
    href: "#white",
    cta: "Shop White",
    meta: "From $25",
  },
  {
    id: "custom",
    title: "Custom",
    description: "Colorways, names, and small-batch ideas are next.",
    image: "/dab-pal/lineup.png",
    href: "#custom",
    cta: "View Custom",
    meta: "Soon",
  },
]

const StoreTemplate = async ({
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const region = await getRegion(countryCode)
  if (!region) return null

  const product = await getProductByHandle(PRODUCT_HANDLE, region.id)
  if (!product) return null

  return (
    <main className="bg-white">
      <section className="border-b border-gray-100">
        <div className="content-container py-10 small:py-16">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-700">
              Shop Dab Pal
            </span>
            <h1 className="mt-3 text-3xl small:text-5xl font-semibold tracking-tight leading-tight text-gray-950">
              Pick your finish. Stock the kit.
            </h1>
            <p className="mt-4 text-base small:text-lg leading-relaxed text-gray-600">
              Black, white, and soon custom builds. Every Dab Pal holds 30 Q-tips and a 1oz iso bottle with a clean/dirty slider inside.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 small:grid-cols-3 gap-4 small:gap-6">
            {finishes.map((finish) => (
              <LocalizedClientLink
                key={finish.id}
                href={finish.href}
                className="group block rounded-lg border border-gray-200 bg-white overflow-hidden hover:border-amber-300 hover:shadow-elevation-card-rest transition"
              >
                <div className="relative aspect-square bg-zinc-50">
                  <Image
                    src={finish.image}
                    alt={`${finish.title} Dab Pal`}
                    fill
                    sizes="(max-width: 800px) 100vw, 33vw"
                    className="object-contain p-7 transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-gray-950">
                      {finish.title}
                    </h2>
                    <span className="text-sm text-gray-500">{finish.meta}</span>
                  </div>
                  <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-gray-600">
                    {finish.description}
                  </p>
                  <span className="mt-4 inline-flex text-sm font-medium text-amber-700 group-hover:text-amber-800">
                    {finish.cta}
                  </span>
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </section>

      <FinishBuyPanel
        id="black"
        title="Black Speck Dab Pal"
        description="Matte black speck finish, made to order in NY."
        image="/dab-pal/product-front.png"
        sku="DABPAL-1-BLK"
        product={product}
        region={region}
      />
      <FinishBuyPanel
        id="white"
        title="White Speck Dab Pal"
        description="White speck finish with the same slider, bottle, and Q-tip storage."
        image="/dab-pal/product-front-white.jpg"
        sku="DABPAL-1-WHT"
        product={product}
        region={region}
      />

      <section id="custom" className="bg-zinc-950 text-white scroll-mt-24">
        <div className="content-container grid grid-cols-1 small:grid-cols-[1fr_0.9fr] gap-8 small:gap-16 items-center py-12 small:py-20">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-400">
              Custom
            </span>
            <h2 className="mt-3 text-2xl small:text-4xl font-semibold tracking-tight">
              Customizer coming next.
            </h2>
            <p className="mt-4 text-sm small:text-base leading-relaxed text-white/70">
              We are testing custom colorways and name plates next. Black and white are available now with fast checkout.
            </p>
          </div>
          <div className="relative aspect-[4/3] bg-white/5 rounded-lg overflow-hidden">
            <Image
              src="/dab-pal/lineup.png"
              alt="Dab Pal color lineup"
              fill
              sizes="(max-width: 800px) 100vw, 45vw"
              className="object-contain p-6"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

const FinishBuyPanel = ({
  id,
  title,
  description,
  image,
  sku,
  product,
  region,
}: {
  id: string
  title: string
  description: string
  image: string
  sku: string
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) => {
  return (
    <section id={id} className="border-b border-gray-100 scroll-mt-24">
      <div className="content-container grid grid-cols-1 small:grid-cols-2 gap-8 small:gap-16 items-start py-12 small:py-20">
        <div className="relative aspect-square bg-zinc-50 rounded-lg overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
            className="object-contain p-8 small:p-12"
          />
        </div>
        <div className="w-full small:sticky small:top-28">
          <div className="mb-6">
            <h2 className="text-2xl small:text-4xl font-semibold tracking-tight leading-tight">
              {title}
            </h2>
            <p className="mt-3 text-sm small:text-base leading-relaxed text-gray-600">
              {description}
            </p>
          </div>
          <VariantProvider>
            <Suspense
              fallback={
                <ProductActions
                  disabled
                  product={product}
                  region={region}
                  hideMobileActions
                  initialVariantSku={sku}
                />
              }
            >
              <ProductActionsWrapper
                id={product.id!}
                region={region}
                hideMobileActions
                initialVariantSku={sku}
              />
            </Suspense>
          </VariantProvider>
        </div>
      </div>
    </section>
  )
}

export default StoreTemplate
