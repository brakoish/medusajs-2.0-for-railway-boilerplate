"use client"

import { track } from "@lib/util/analytics"

export function AffiliateLink({ href, productId, slug, children }: {
  href: string
  productId: string
  slug: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      rel="sponsored noopener"
      target="_blank"
      className="inline-block py-2 text-sm leading-6 font-medium text-amber-800 underline underline-offset-4 hover:text-amber-950"
      onClick={() => void track("affiliate_click", {
        article_slug: slug,
        product_id: productId,
        placement: "article_supplies",
      })}
    >
      {children}
    </a>
  )
}
