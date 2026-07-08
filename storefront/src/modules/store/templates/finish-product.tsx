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

const VIDEO_URL =
  "https://bucket-production-a39d.up.railway.app/medusa-media/dabpal_video-01KRBQAN081CB5FHH4QC6G6PKN.mp4"

const details = [
  ["Inside", "30 Q-tips, 1oz iso bottle, clean/dirty slider."],
  ["Fit", "Pocket-sized case for Puffco and quartz banger cleaning."],
  ["Shipping", "Made in NY and ships in 1 to 2 business days."],
]

const instructions = [
  "Fill the 1oz bottle with your preferred 90%+ iso.",
  "Load clean Q-tips into the clean side.",
  "Swab your Puffco bowl, e-rig chamber, or banger after each dab.",
  "Slide used swabs behind the slider, toward the hinge, until you can toss them.",
]

const reviews = [
  {
    quote:
      "Great little tool, will work great with my erig when I'm on the go.",
    name: "RichyFlows",
  },
  {
    quote:
      "Made from a durable plastic with a moveable piece for separating used from unused.",
    name: "Verified buyer",
  },
  {
    quote: "Product is as described. This definitely exceeded my expectations.",
    name: "Martin K.",
  },
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

  const medusaProduct = await getProductByHandle(
    product.medusaHandle,
    region.id
  )
  if (!medusaProduct) notFound()

  return (
    <main className="bg-white">
      <section className="content-container py-5 small:py-12">
        <div className="mb-5 small:mb-6 flex items-center gap-2 text-sm text-gray-500">
          <LocalizedClientLink href="/store" className="hover:text-gray-900">
            Shop
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 small:grid-cols-[1.08fr_0.92fr] gap-8 small:gap-16 items-start">
          <div className="order-2 small:order-1 grid grid-cols-1 gap-3 small:gap-4">
            <ProductMedia product={product} />
            <ProductDetails className="small:hidden" />
            <ProductInstructions className="small:hidden" />
          </div>

          <div className="order-1 small:order-2 max-w-[20rem] small:max-w-none small:sticky small:top-28">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-700">
              {product.subtitle}
            </span>
            <h1 className="mt-3 text-3xl small:text-5xl font-semibold tracking-tight leading-tight text-gray-950">
              {product.title} Dab Pal
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              {product.description}
            </p>

            <div className="mt-5 small:mt-7 border-y border-gray-200 py-5 small:py-6">
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

            <ProductReviewSnippets />
            <ProductDetails className="hidden small:block" />
            <ProductInstructions className="hidden small:block" />
          </div>
        </div>
      </section>
    </main>
  )
}

const getAlternateFinish = (product: ShopProduct) =>
  product.handle === "black-speck"
    ? {
        src: "/dab-pal/product-front-white.jpg",
        alt: "White Speck Dab Pal finish",
        label: "White Speck",
      }
    : {
        src: "/dab-pal/product-front.png",
        alt: "Black Speck Dab Pal finish",
        label: "Black Speck",
      }

const ProductMedia = ({ product }: { product: ShopProduct }) => {
  const alternate = getAlternateFinish(product)

  return (
    <div className="grid grid-cols-1 gap-3 small:gap-4">
      <div className="relative aspect-[4/3] small:aspect-square rounded-lg bg-zinc-50 overflow-hidden">
        <Image
          src={product.image}
          alt={`${product.title} Dab Pal`}
          fill
          priority
          sizes="(max-width: 800px) 100vw, 55vw"
          className="object-contain p-5 small:p-14"
        />
      </div>

      <div className="overflow-hidden rounded-lg bg-black">
        <video
          controls
          muted
          playsInline
          preload="metadata"
          poster={product.image}
          className="block aspect-video w-full bg-black object-contain"
          aria-label="Dab Pal product demo video"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      <div className="grid grid-cols-2 gap-3 small:gap-4">
        <figure className="rounded-lg border border-gray-200 bg-zinc-50 p-3">
          <div className="relative aspect-[4/3]">
            <Image
              src="/dab-pal/lineup.png"
              alt="Dab Pal Black and White finish lineup"
              fill
              sizes="(max-width: 800px) 50vw, 28vw"
              className="object-contain"
            />
          </div>
          <figcaption className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-400">
            Finish lineup
          </figcaption>
        </figure>
        <figure className="rounded-lg border border-gray-200 bg-zinc-50 p-3">
          <div className="relative aspect-[4/3]">
            <Image
              src={alternate.src}
              alt={alternate.alt}
              fill
              sizes="(max-width: 800px) 50vw, 28vw"
              className="object-contain"
            />
          </div>
          <figcaption className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-400">
            {alternate.label}
          </figcaption>
        </figure>
      </div>
    </div>
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
            We are testing custom colorways and name plates next. Black Speck
            and White Speck are available now.
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

const ProductDetails = ({ className = "" }: { className?: string }) => (
  <div className={`divide-y divide-gray-200 ${className}`}>
    {details.map(([title, body]) => (
      <div key={title} className="py-4">
        <h2 className="text-sm font-semibold text-gray-950">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{body}</p>
      </div>
    ))}
  </div>
)

const ProductReviewSnippets = () => (
  <section className="border-b border-gray-200 pb-5">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-gray-950">Buyer notes</h2>
      <span className="text-xs font-semibold text-amber-700">Rated 5/5</span>
    </div>
    <div className="mt-3 grid gap-3">
      {reviews.map((review) => (
        <figure key={review.quote} className="text-sm leading-relaxed">
          <blockquote className="text-gray-700">
            &ldquo;{review.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-1 text-xs text-gray-500">
            {review.name} &middot; Verified buyer
          </figcaption>
        </figure>
      ))}
    </div>
  </section>
)

const ProductInstructions = ({ className = "" }: { className?: string }) => (
  <section className={`border-t border-gray-200 pt-5 ${className}`}>
    <h2 className="text-sm font-semibold text-gray-950">How to use it</h2>
    <ol className="mt-3 grid gap-3">
      {instructions.map((instruction, index) => (
        <li key={instruction} className="flex gap-3 text-sm leading-relaxed">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-gray-700">
            {index + 1}
          </span>
          <span className="text-gray-600">{instruction}</span>
        </li>
      ))}
    </ol>
  </section>
)

export default FinishProductTemplate
