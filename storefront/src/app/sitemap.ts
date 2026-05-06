import type { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

/**
 * Sitemap. Single-product store, so the surface area is tiny:
 *   - / (home, holds the PDP)
 *   - /products/dab-pal (canonical PDP path; redirects to / on this site
 *     but listed for robots that hit the SKU path directly)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseURL()
  const now = new Date()
  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/products/dab-pal`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ]
}
