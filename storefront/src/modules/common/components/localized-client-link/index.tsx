"use client"

import Link from "next/link"
import React from "react"

/**
 * Single-region storefront: this used to prefix every internal link with the
 * country code (`/us/...`). After the URL strip, it's just a thin wrapper
 * over `next/link` for source-compat. Kept rather than removed so we don't
 * have to touch every call site.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: any
}) => {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
