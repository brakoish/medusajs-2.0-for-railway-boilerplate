import type { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

/**
 * Sitemap. Keep transactional/account routes out, but include the public
 * shop and product-style routes so search engines can index finish pages.
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
      url: `${base}/store`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/store/black-speck`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/store/white-speck`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ]
}
