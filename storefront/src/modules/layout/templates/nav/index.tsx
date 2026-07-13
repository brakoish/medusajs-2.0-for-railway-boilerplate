import { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DabPalLogoLong } from "@modules/common/components/dab-pal-logo"
import CartButton from "@modules/layout/components/cart-button"
import NavShell from "@modules/layout/components/nav-shell"

/**
 * Top-of-app navigation.
 *
 * Decisions worth remembering:
 *   - No hamburger menu: this is a 1-product store, hidden nav adds a
 *     tap that doesn't convert and signals "more inside" when there
 *     isn't.
 *   - No "Account" link: ~all checkouts are wallet-based; account
 *     surface is at /account directly, not promoted in nav.
 *   - No "Search": one product, search is noise.
 *   - Cart is icon-only with an amber count badge (see CartDropdown).
 *   - Desktop: classic DTC three-column nav.
 *       [ logo (left) | menu Shop/Reviews/FAQ (centered) | cart (right) ]
 *     Wordmark on the left reads as the brand mark; centered menu balances
 *     the bar without competing with the logo for attention.
 *   - Mobile: logo anchors left, Reviews/FAQ inline next to it, cart on
 *     the right. Same component, breakpoint-driven layout swap.
 */
export default function Nav() {
  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <NavShell>
        <nav className="content-container relative flex items-center w-full h-full">
          {/* LEFT — wordmark.
              Sits in normal flow on both mobile and desktop. */}
          <LocalizedClientLink
            href="/"
            data-testid="nav-store-link"
            aria-label="Dab Pal"
            className="ml-1 small:ml-0 text-ui-fg-base hover:text-ui-fg-base inline-flex items-center flex-shrink-0"
          >
            {/* Long wordmark inlined so `currentColor` inherits text color
                across the translucent-hero and solid-scrolled nav passes. */}
            <DabPalLogoLong className="h-4 small:h-5 w-auto" />
          </LocalizedClientLink>

          {/* CENTER — desktop menu.
              Absolutely centered to the viewport so the menu sits exactly
              mid-bar regardless of logo/cart widths. */}
          <div className="hidden small:flex items-center gap-x-8 absolute left-1/2 -translate-x-1/2">
            <NavLink href="/store">Shop</NavLink>
            <NavLink href="/blog">Guides</NavLink>
            <NavLink href="/#reviews">Reviews</NavLink>
            <NavLink href="/#faq">FAQ</NavLink>
          </div>

          {/* MOBILE-ONLY: Shop + Reviews + FAQ. */}
          <div className="flex small:hidden flex-1 items-center justify-center gap-x-4">
            <LocalizedClientLink
              href="/store"
              className="text-xs text-ui-fg-subtle hover:text-ui-fg-base"
            >
              Shop
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/blog"
              className="text-xs text-ui-fg-subtle hover:text-ui-fg-base"
            >
              Guides
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/#reviews"
              className="text-xs text-ui-fg-subtle hover:text-ui-fg-base"
            >
              Reviews
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/#faq"
              className="text-xs text-ui-fg-subtle hover:text-ui-fg-base"
            >
              FAQ
            </LocalizedClientLink>
          </div>

          {/* RIGHT — cart.
              On desktop flex-1 + justify-end pushes the cart to the right.
              On mobile the link group above already takes the slack, so
              the cart sits naturally on the right edge with no extra flex. */}
          <div className="small:flex-1 flex items-center justify-end">
            <Suspense
              fallback={
                <LocalizedClientLink
                  href="/cart"
                  data-testid="nav-cart-link"
                  aria-label="Cart"
                  className="relative -mr-2 inline-flex items-center justify-center w-10 h-10 rounded-full text-ui-fg-base"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-[22px] h-[22px]"
                    aria-hidden
                  >
                    <path d="M5 7h14l-1.4 11.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5 7Z" />
                    <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                  </svg>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </NavShell>
    </div>
  )
}

/**
 * Inline desktop nav link with an amber underline that draws in on hover.
 * Subtle motion = "this is interactive" without being loud.
 */
const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <LocalizedClientLink
    href={href}
    className="relative text-sm text-ui-fg-subtle hover:text-ui-fg-base transition-colors group"
  >
    {children}
    <span
      aria-hidden
      className="absolute left-0 -bottom-0.5 h-px w-full origin-left scale-x-0 bg-amber-500 transition-transform duration-200 group-hover:scale-x-100"
    />
  </LocalizedClientLink>
)
