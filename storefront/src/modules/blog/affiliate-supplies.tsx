import { AffiliateLink } from "./affiliate-link"

// Listing identity checked September 24, 2026. See docs/affiliate-pilot.md.
const products = {
  qtips: {
    name: "Q-tips Original cotton swabs",
    pack: "750 count × 3 packs",
    asin: "B0BPLQ9XZH",
    note: "Cotton tips on a paper stick. This is a bulk refill; a smaller pack from a local shop is enough to get started. If you already have suitable cotton swabs, use those.",
  },
  globMops: {
    name: "Glob Mops XL 2.0",
    pack: "300 count · single tub",
    asin: "B08RCSCWGB",
    note: "A bamboo stick with pointed and rounded cotton tips. Consider these if you want a different tip shape. We have not tested their cleaning performance or fit in Dab Pal.",
  },
  iso99: {
    name: "Amazon Basics 99% isopropyl alcohol",
    pack: "16 fl oz · one bottle",
    asin: "B07NFSFBXQ",
    note: "An option when your device maker specifies 99% isopropyl alcohol for the part you are cleaning. This is a separate refill, not included with Dab Pal. Check the label and delivery restrictions; keep it away from heat and flames.",
  },
  microfiber: {
    name: "Amazon Basics microfiber cleaning cloths",
    pack: "24 cloths · 16 × 12 inches · blue, white and yellow",
    asin: "B009FUF6DM",
    note: "For wiping the outside of cooled glass and keeping a clean work surface. A clean cloth you already own may be enough; this multipack is optional. Wash before first use and keep cloths used with cleaning chemicals separate from kitchen cloths.",
  },
  bottleBrushes: {
    name: "OXO Good Grips Water Bottle Cleaning Set",
    pack: "Bottle brush, straw brush and detail cleaner",
    asin: "B008HMF9LS",
    note: "Three nylon-bristle shapes for accessible bottle openings and crevices. Measure the opening first; these are not chamber tools, and we have not tested their fit in a particular rig. Never force a brush past an internal glass feature.",
  },
}

export type AffiliateProductId = keyof typeof products

export function AffiliateDisclosure() {
  return <p className="text-sm leading-6 text-gray-600">
    We may earn a commission when you buy through the Amazon links in this article.{" "}
    As an Amazon Associate I earn from qualifying purchases.
  </p>
}

export function AffiliateSupplies({ slug, productIds }: {
  slug: string
  productIds: AffiliateProductId[]
}) {
  return (
    <section id="supplies" aria-labelledby="supplies-heading" className="mt-10 scroll-mt-36 border-y border-gray-200 py-7">
      <h2 id="supplies-heading" className="text-2xl font-semibold text-gray-950">Supplies, if you need them</h2>
      <div className="mt-3"><AffiliateDisclosure /></div>
      <ul className="mt-5 divide-y divide-gray-200">
        {productIds.map((id) => {
          const product = products[id]
          return <li key={id} className="py-5 first:pt-0 last:pb-0">
            <h3 className="text-lg font-semibold text-gray-950">{product.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{product.pack}</p>
            <p className="mt-3 text-base leading-7 text-gray-700">{product.note}</p>
            <AffiliateLink slug={slug} productId={product.asin} href={`https://www.amazon.com/dp/${product.asin}/ref=nosim?tag=dabpal-20`}>
              See {product.name} on Amazon (paid link)
            </AffiliateLink>
          </li>
        })}
      </ul>
      <p className="mt-4 text-sm leading-6 text-gray-600">Check the selected pack, seller and delivery cost on Amazon before ordering. These links open in a new tab.</p>
    </section>
  )
}
