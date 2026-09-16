"use client"

import { usePostHog } from "posthog-js/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export function GuideProductLink({ slug }: { slug: string }) {
  const posthog = usePostHog()

  return (
    <LocalizedClientLink
      href="/store"
      onClick={() =>
        posthog.capture("guide_product_click", {
          article_slug: slug,
          destination: "/store",
          placement: "article_intro",
        })
      }
      className="mt-4 inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
    >
      Choose your Dab Pal finish
    </LocalizedClientLink>
  )
}
