import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const stats = [
  ["30", "Q-tips"],
  ["1oz", "empty iso bottle"],
  ["2", "swab zones"],
]

const confidence = [
  "Made in Astoria, NY",
  "Most orders ship in 1 to 2 business days",
  "14-day returns on unopened kits",
]

const included = [
  {
    title: "Clean swab storage",
    body: "Holds regular Q-tips so your cleaning setup is ready before the bowl cools.",
  },
  {
    title: "Empty 1oz iso bottle",
    body: "Ships empty for transit. Fill it with your preferred isopropyl alcohol at home.",
  },
  {
    title: "Clean/dirty slider",
    body: "Move used swabs behind the divider so they stay away from the fresh side.",
  },
]

const compatibility = [
  "Puffco Peak, Peak Pro, Proxy, Plus, and Pivot",
  "E-rig bowls and ceramic chambers",
  "Quartz bangers and travel dab kits",
]

const reviews = [
  {
    quote:
      "Been looking for something like this for the longest, this definitely exceeded my expectations.",
    name: "Martin K.",
  },
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
]

const Stars = () => (
  <div
    className="flex items-center gap-0.5 text-amber-500"
    aria-label="5 out of 5 stars"
  >
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-current">
        <path d="M10 1l2.6 6h6.4l-5.2 4 2 6.4-5.8-4.2-5.8 4.2 2-6.4-5.2-4h6.4z" />
      </svg>
    ))}
  </div>
)

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <main data-testid="product-container" className="bg-white">
      <section className="border-b border-gray-100">
        <div className="content-container py-8 small:py-14">
          <div className="grid grid-cols-1 large:grid-cols-[minmax(0,1fr)_420px] gap-8 large:gap-14 items-start">
            <div className="order-1 large:col-span-2">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-500">
                  <span>Puffco cleaning kit</span>
                  <span className="h-1 w-1 rounded-full bg-amber-500" />
                  <span>Q-tip and iso case</span>
                </div>
                <h1 className="mt-3 text-4xl small:text-6xl font-semibold tracking-normal leading-[1.02] text-gray-950">
                  Dab Pal keeps the messy part contained.
                </h1>
                <p className="mt-4 max-w-2xl text-base small:text-lg leading-relaxed text-gray-600">
                  A pocket-sized case for Q-tips, an empty 1oz iso bottle, and
                  used swab storage. Built for Puffco, e-rig, and quartz banger
                  cleanup.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {confidence.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-gray-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-3 min-w-0 large:order-2">
              <ImageGallery images={product?.images || []} />
            </div>

            <aside className="order-2 w-full large:sticky large:top-24 large:order-3">
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm small:p-6">
                <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
                      Choose your kit
                    </span>
                    <h2 className="mt-1 text-2xl font-semibold tracking-normal text-gray-950">
                      {product.title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <Stars />
                    <p className="mt-1 text-xs text-gray-500">
                      Verified buyers
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-4">
                  {stats.map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-gray-100 bg-zinc-50 px-2 py-3 text-center"
                    >
                      <div className="text-lg font-semibold text-gray-950">
                        {value}
                      </div>
                      <div className="mt-1 text-[11px] leading-tight text-gray-500">
                        {label}
                      </div>
                    </div>
                  ))}
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
                  <ProductActionsWrapper
                    id={product.id}
                    region={region}
                    hideMobileActions
                  />
                </Suspense>

                <p className="mt-4 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
                  Bottle ships empty. Puffco is referenced for compatibility
                  with common cleaning routines.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-zinc-50 py-12 small:py-20">
        <div className="content-container">
          <div className="grid grid-cols-1 small:grid-cols-3 gap-4">
            {included.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-gray-200 bg-white p-5"
              >
                <h3 className="text-lg font-semibold text-gray-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white py-12 small:py-20">
        <div className="content-container grid grid-cols-1 large:grid-cols-[0.9fr_1.1fr] gap-8 large:gap-16">
          <div>
            <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
              Compatibility
            </span>
            <h2 className="mt-3 text-3xl small:text-5xl font-semibold tracking-normal leading-tight text-gray-950">
              Fits the cleaning routine you already use.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {compatibility.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4"
              >
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                <p className="text-base leading-relaxed text-gray-700">
                  {item}
                </p>
              </div>
            ))}
            <LocalizedClientLink
              href="/blog/how-to-clean-puffco-peak-pro-proxy"
              className="mt-2 inline-flex w-fit text-sm font-semibold text-amber-700 hover:text-amber-800"
            >
              Read the Puffco cleaning guide
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <section className="bg-black py-12 text-white small:py-20">
        <div className="content-container">
          <div className="mb-8 flex flex-col gap-3 small:flex-row small:items-end small:justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-white/50">
                Proof
              </span>
              <h2 className="mt-3 text-3xl small:text-5xl font-semibold tracking-normal leading-tight">
                Buyers get it fast.
              </h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <Stars />
              <span>5-star verified buyer feedback</span>
            </div>
          </div>
          <div className="grid grid-cols-1 small:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <figure
                key={review.quote}
                className="rounded-lg border border-white/10 bg-white/[0.06] p-5"
              >
                <Stars />
                <blockquote className="mt-4 text-base leading-relaxed text-white/85">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm text-white/50">
                  {review.name}, Verified buyer
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default ProductTemplate
