"use client"

import { useAnalytics } from "@lib/util/analytics"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export function GuideProductLink({ slug, href = "/store", placement = "article_intro", children = "Choose your Dab Pal finish", className }: { slug: string; href?: string; placement?: string; children?: React.ReactNode; className?: string }) {
  const posthog = useAnalytics()

  return (
    <LocalizedClientLink
      href={href}
      onClick={() =>
        posthog.capture("guide_product_click", {
          article_slug: slug,
          destination: href,
          placement,
        })
      }
      className={className || "mt-4 inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"}
    >
      {children}
    </LocalizedClientLink>
  )
}
