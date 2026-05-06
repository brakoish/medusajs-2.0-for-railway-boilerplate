import type { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

/**
 * Sitemap. Single-product store, so the surface area is just the home
 * page (which is the canonical PDP). Every other route either redirects
 * to / or is gated (cart, checkout, account, order confirmations).
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
  ]
}
