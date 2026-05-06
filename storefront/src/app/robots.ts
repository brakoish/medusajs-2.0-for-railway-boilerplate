import type { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

/**
 * Robots policy. Public storefront → allow indexing. Block ops surfaces
 * (cart, checkout, account, order confirmations) since they're either
 * personalized, transactional, or behind auth.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getBaseURL()
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/cart",
          "/checkout",
          "/account",
          "/order/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
