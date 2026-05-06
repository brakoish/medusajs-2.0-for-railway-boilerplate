import { getBaseURL } from "@lib/util/env"

/**
 * JSON-LD structured data for the homepage.
 *
 * Two schemas:
 *   - Organization: brand-level info (name, URL, logo, sameAs).
 *   - Product: the Dab Pal kit, with offer details + aggregateRating
 *     pulled from our verified-buyer reviews. Surfaces in Google as a
 *     rich product card with stars + price range.
 *
 * Why static instead of API-derived: the catalog is one product. Hard-
 * coding here is faster, deterministic, and avoids a server round-trip
 * on every homepage render. If/when the catalog expands, switch to
 * fetching from `/store/products` and mapping at request time.
 */
const StructuredData = () => {
  const url = getBaseURL()

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dab Pal",
    url,
    logo: `${url}/icon-512.png`,
    description:
      "Dab Pal makes portable cleaning kits for Puffco dab rigs and quartz bangers. Made to order in Brooklyn, NY.",
  }

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Dab Pal Q-tip and Iso Case",
    description:
      "Slim, portable cleaning kit for Puffco Peak / Pro / Proxy and quartz bangers. Holds 30 regular Q-tips and a 1oz iso bottle, with a built-in slider for used vs. fresh swabs.",
    image: [
      `${url}/dab-pal/product-front.png`,
      `${url}/dab-pal/lineup.png`,
      `${url}/dab-pal/detail.png`,
    ],
    brand: {
      "@type": "Brand",
      name: "Dab Pal",
    },
    sku: "DABPAL",
    offers: {
      "@type": "AggregateOffer",
      url,
      priceCurrency: "USD",
      lowPrice: "25.00",
      highPrice: "120.00",
      offerCount: 6,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "7.00",
          currency: "USD",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "4",
      bestRating: "5",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
      />
    </>
  )
}

export default StructuredData
