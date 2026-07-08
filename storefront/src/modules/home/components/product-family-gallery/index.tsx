import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const finishes = [
  {
    name: "Black Speck",
    href: "/store/black-speck",
    image: "/dab-pal/product-front.png",
    swatch: "bg-zinc-950",
  },
  {
    name: "White Speck",
    href: "/store/white-speck",
    image: "/dab-pal/product-front-white.jpg",
    swatch: "bg-white",
  },
]

export default function ProductFamilyGallery() {
  return (
    <section
      id="shop"
      className="bg-white py-10 small:py-24 border-b border-gray-100"
    >
      <div className="content-container grid grid-cols-1 small:grid-cols-[0.95fr_1.05fr] gap-10 small:gap-16 items-center">
        <div className="order-2 small:order-1">
          <span className="uppercase tracking-[0.25em] text-xs text-amber-700">
            The kit
          </span>
          <h2 className="mt-4 text-3xl small:text-5xl font-semibold tracking-tight leading-tight text-gray-950">
            One Dab Pal. Two finishes.
          </h2>
          <p className="mt-5 max-w-xl text-base small:text-lg leading-relaxed text-gray-600">
            Same pocket case, same clean/dirty slider, same 30 Q-tip and 1oz iso
            setup. Pick the finish that fits your kit.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 max-w-xl">
            {finishes.map((finish) => (
              <LocalizedClientLink
                key={finish.name}
                href={finish.href}
                className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-amber-300 hover:shadow-elevation-card-rest transition"
              >
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={`h-8 w-8 rounded-full border border-gray-300 ${finish.swatch}`}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-gray-950">
                      {finish.name}
                    </span>
                    <span className="block text-sm text-gray-500">
                      From $25
                    </span>
                  </span>
                </span>
                <span className="text-sm font-semibold text-amber-700 group-hover:text-amber-800">
                  Choose {finish.name.replace(" Speck", "")}
                </span>
              </LocalizedClientLink>
            ))}
          </div>

          <LocalizedClientLink
            href="/store"
            className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition"
          >
            Shop all finishes
          </LocalizedClientLink>
        </div>

        <div className="order-1 small:order-2 grid grid-cols-2 gap-3 small:gap-4">
          <div className="relative col-span-2 aspect-[16/10] rounded-lg bg-zinc-50 overflow-hidden">
            <Image
              src="/dab-pal/lineup.png"
              alt="Dab Pal finish lineup"
              fill
              sizes="(max-width: 800px) 100vw, 55vw"
              className="object-contain p-6 small:p-10"
            />
          </div>
          {finishes.map((finish) => (
            <LocalizedClientLink
              key={finish.name}
              href={finish.href}
              className="group relative aspect-square rounded-lg bg-zinc-50 overflow-hidden border border-gray-100 hover:border-amber-300 transition"
            >
              <Image
                src={finish.image}
                alt={`${finish.name} Dab Pal`}
                fill
                sizes="(max-width: 800px) 50vw, 28vw"
                className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
