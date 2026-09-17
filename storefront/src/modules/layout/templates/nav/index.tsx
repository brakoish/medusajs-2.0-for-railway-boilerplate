import { Suspense } from "react"
import { ShoppingCart } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DabPalLogoLong } from "@modules/common/components/dab-pal-logo"
import CartButton from "@modules/layout/components/cart-button"

export default function Nav() {
  return (
    <header className="studio-nav">
      <nav
        className="studio-container studio-nav-inner"
        aria-label="Main navigation"
      >
        <LocalizedClientLink
          href="/"
          aria-label="Dab Pal home"
          className="studio-logo"
          data-testid="nav-store-link"
        >
          <DabPalLogoLong />
        </LocalizedClientLink>
        <div className="studio-nav-links">
          <LocalizedClientLink href="/store">Shop</LocalizedClientLink>
          <LocalizedClientLink href="/#how-it-works">
            How it works
          </LocalizedClientLink>
          <LocalizedClientLink href="/blog">Field notes</LocalizedClientLink>
        </div>
        <Suspense
          fallback={
            <LocalizedClientLink
              href="/cart"
              className="studio-cart-link"
              aria-label="Cart"
            >
              <ShoppingCart />
            </LocalizedClientLink>
          }
        >
          <CartButton />
        </Suspense>
      </nav>
    </header>
  )
}
