import type { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"
import { blogArticles } from "@modules/blog/articles"

/**
 * Sitemap. Keep transactional/account routes out, but include the public
 * canonical product page so search engines index the shared product.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseURL()
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/store`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/care`,
      changeFrequency: "monthly",
      priority: 0.65,
    },
  ]

  return [
    ...coreRoutes,
    ...["about", "contact", "shipping-returns", "privacy", "terms"].map(path => ({ url: `${base}/${path}` })),
    {
      url: `${base}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogArticles.map((article) => ({
      url: `${base}/blog/${article.slug}`,
      lastModified: new Date(`${article.updatedAt}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
