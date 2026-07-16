import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { shopProducts } from "./shop-products"

const availableFinishes = shopProducts.filter(
  (product) => product.available && product.handle !== "custom"
)
const customProduct = shopProducts.find((product) => product.handle === "custom")

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
        <div className="content-container grid grid-cols-1 small:grid-cols-[1.05fr_0.95fr] gap-8 small:gap-16 items-center py-10 small:py-16">
          <div className="grid grid-cols-2 gap-3 small:gap-4">
            <div className="relative col-span-2 aspect-[16/10] rounded-lg bg-zinc-50 overflow-hidden">
              <Image
                src="/dab-pal/lineup.png"
                alt="Dab Pal finish lineup"
                fill
                priority
                sizes="(max-width: 800px) 100vw, 55vw"
                className="object-contain p-6 small:p-10"
              />
            </div>
            {availableFinishes.map((finish) => (
              <LocalizedClientLink
                key={finish.handle}
                href={`/store/${finish.handle}`}
                className="group relative aspect-square rounded-lg bg-zinc-50 overflow-hidden border border-gray-100 hover:border-amber-300 transition"
              >
                <Image
                  src={finish.image}
                  alt={`${finish.title} Dab Pal`}
                  fill
                  sizes="(max-width: 800px) 50vw, 28vw"
                  className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </LocalizedClientLink>
            ))}
          </div>

          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-700">
              Shop Dab Pal
            </span>
            <h1 className="mt-3 text-4xl small:text-6xl font-semibold tracking-tight leading-[1.05] text-gray-950">
              One kit. Pick your finish.
            </h1>
            <p className="mt-5 text-base small:text-lg leading-relaxed text-gray-600">
              Pocket Q-tip, iso, and dab swab storage with a clean/dirty slider.
              Choose Black Speck or White Speck, or preview the custom color
              builder before customs open.
            </p>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-gray-950">Finish</h2>
                <span className="text-sm text-gray-500">From $25</span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                {availableFinishes.map((finish) => (
                  <LocalizedClientLink
                    key={finish.handle}
                    href={`/store/${finish.handle}`}
                    className="group flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-3 hover:border-amber-300 hover:shadow-elevation-card-rest transition"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={`h-8 w-8 rounded-full border ${
                          finish.handle === "black-speck"
                            ? "border-zinc-950 bg-zinc-950"
                            : "border-gray-300 bg-white"
                        }`}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-gray-950">
                          {finish.title}
                        </span>
                        <span className="block text-sm text-gray-500">
                          {finish.subtitle}
                        </span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-amber-700 group-hover:text-amber-800">
                      Choose {finish.title.replace(" Speck", "")}
                    </span>
                  </LocalizedClientLink>
                ))}

                {customProduct && (
                  <LocalizedClientLink
                    href={`/store/${customProduct.handle}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-gray-300 bg-zinc-50 p-3 transition hover:border-amber-300"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="h-8 w-8 rounded-full border border-gray-400 bg-[linear-gradient(135deg,#111_0_33%,#fff_33%_66%,#777_66%)]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-gray-950">
                          Custom
                        </span>
                        <span className="block text-sm text-gray-500">
                          Coming soon
                        </span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-gray-500">
                      Preview
                    </span>
                  </LocalizedClientLink>
                )}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-gray-200 pt-6">
              {[
                ["30", "Q-tips"],
                ["1oz", "iso bottle"],
                ["NY", "made"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="text-2xl font-semibold tracking-tight text-gray-950">
                    {value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
