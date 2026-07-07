import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { shopProducts } from "./shop-products"

const StoreTemplate = ({
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  void countryCode

  return (
    <main className="bg-white">
      <section className="border-b border-gray-100">
        <div className="content-container py-10 small:py-16">
          <div className="grid grid-cols-1 small:grid-cols-[0.95fr_1.05fr] gap-8 small:gap-16 items-end">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-amber-700">
                Shop
              </span>
              <h1 className="mt-3 text-4xl small:text-6xl font-semibold tracking-tight leading-[1.05] text-gray-950">
                Dab Pal cleaning kits.
              </h1>
            </div>
            <p className="max-w-xl text-base small:text-lg leading-relaxed text-gray-600 small:pb-2">
              Pocket cases for Q-tips and iso. Pick Black Speck or White Speck now, with custom builds coming next.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              ["All", "/store"],
              ["Black", "/store/black-speck"],
              ["White", "/store/white-speck"],
              ["Custom", "/store/custom"],
            ].map(([label, href], index) => (
              <LocalizedClientLink
                key={label}
                href={href}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  index === 0
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-700 hover:border-amber-300"
                }`}
              >
                {label}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </section>

      <section className="content-container py-8 small:py-12">
        <div className="grid grid-cols-1 small:grid-cols-3 gap-5 small:gap-6">
          {shopProducts.map((product) => (
            <LocalizedClientLink
              key={product.handle}
              href={`/store/${product.handle}`}
              className="group block rounded-lg border border-gray-200 bg-white overflow-hidden transition hover:border-amber-300 hover:shadow-elevation-card-rest"
            >
              <div className="relative aspect-[4/5] bg-zinc-50">
                <Image
                  src={product.image}
                  alt={`${product.title} Dab Pal`}
                  fill
                  sizes="(max-width: 800px) 100vw, 33vw"
                  className="object-contain p-7 transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">
                  {product.badge}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-gray-950">
                      {product.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.subtitle}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-gray-700">
                    {product.price}
                  </span>
                </div>
                <p className="mt-4 min-h-[64px] text-sm leading-relaxed text-gray-600">
                  {product.description}
                </p>
                <span className="mt-5 inline-flex text-sm font-semibold text-amber-700 group-hover:text-amber-800">
                  {product.cta}
                </span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-100 bg-zinc-50">
        <div className="content-container grid grid-cols-1 small:grid-cols-3 divide-y small:divide-y-0 small:divide-x divide-gray-200">
          {[
            ["Made in NY", "Small-batch production from Astoria."],
            ["Ships fast", "Most orders leave in 1 to 2 business days."],
            ["Wallet ready", "Apple Pay, Google Pay, Link, PayPal, and cards."],
          ].map(([title, body]) => (
            <div key={title} className="py-6 small:px-8 first:small:pl-0">
              <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default StoreTemplate
