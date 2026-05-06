import { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import CartButton from "@modules/layout/components/cart-button"
import NavShell from "@modules/layout/components/nav-shell"

/**
 * Top-of-app navigation.
 *
 * Layout:
 *   1. Announcement bar (free shipping / Brooklyn / lead time) — black
 *   2. Sticky main nav — translucent over hero, solid on scroll
 *
 * Decisions worth remembering:
 *   - No hamburger menu: this is a 1-product store, hidden nav adds a
 *     tap that doesn't convert and signals "more inside" when there
 *     isn't.
 *   - No "Account" link: ~all checkouts are wallet-based; account
 *     surface is at /account directly, not promoted in nav.
 *   - No "Search": one product, search is noise.
 *   - Cart is icon-only with an amber count badge (see CartDropdown).
 *   - Wordmark is left-aligned, not centered, so the cart button sits
 *     comfortably on the right without competing for centerline focus.
 *   - 2 inline links (Reviews, FAQ) on desktop, hidden on mobile to
 *     keep the bar tight on small screens.
 */
export default function Nav() {
  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <AnnouncementBar />
      <NavShell>
        <nav className="content-container flex items-center justify-between w-full h-full">
          {/* Wordmark — bumped slightly inward (ml-1) so it optically
              aligns with the cart icon's centerline on the right, since
              the icon sits inside a 40px hit area that pushes the glyph
              visually inward. */}
          <LocalizedClientLink
            href="/"
            data-testid="nav-store-link"
            className="ml-1 text-base small:text-lg font-semibold tracking-tight text-ui-fg-base hover:text-ui-fg-base"
          >
            Dab Pal
          </LocalizedClientLink>

          {/* Inline links — desktop only */}
          <div className="hidden small:flex items-center gap-x-7 absolute left-1/2 -translate-x-1/2">
            <NavLink href="/#reviews">Reviews</NavLink>
            <NavLink href="/#faq">FAQ</NavLink>
          </div>

          {/* Cart — pulled outward (-mr-2) so the icon centers in the
              same right gutter as the wordmark's left edge. */}
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
