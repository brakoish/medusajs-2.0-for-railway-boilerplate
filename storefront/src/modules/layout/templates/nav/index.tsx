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
 *   - Desktop: classic DTC three-column nav. Reviews/FAQ on the left,
 *     centered wordmark, cart icon on the right. Centered wordmark
 *     gives the brand a hero moment and balances the bar visually.
 *   - Mobile: the links column collapses; wordmark anchors left,
 *     cart anchors right — same component, two visual modes via
 *     small:absolute on the wordmark.
 */
export default function Nav() {
  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <AnnouncementBar />
      <NavShell>
        <nav className="content-container relative flex items-center w-full h-full">
          {/* Three-column layout on desktop:
              [ links | wordmark (centered) | cart ]
              On mobile the links column collapses, wordmark anchors left,
              cart anchors right — same component, two visual modes. */}

          {/* LEFT — desktop links, hidden on mobile */}
          <div className="hidden small:flex items-center gap-x-8 flex-1 basis-0">
            <NavLink href="/#shop">Shop</NavLink>
            <NavLink href="/#reviews">Reviews</NavLink>
            <NavLink href="/#faq">FAQ</NavLink>
          </div>

          {/* CENTER — wordmark.
              On desktop: absolutely centered to the viewport so the
              wordmark sits exactly mid-bar regardless of link/cart widths.
              On mobile: anchored left in normal flow so it reads as the
              primary mark with the cart on the right. */}
          <LocalizedClientLink
            href="/"
            data-testid="nav-store-link"
            className="ml-1 small:ml-0 text-lg small:text-2xl font-semibold tracking-tight text-ui-fg-base hover:text-ui-fg-base small:absolute small:left-1/2 small:-translate-x-1/2"
          >
            Dab Pal
          </LocalizedClientLink>

          {/* Spacer pushes cart to the right edge on mobile (where the
              wordmark is in normal flow) and balances the layout on
              desktop (where the wordmark is absolutely positioned).
              `items-center` is critical — without it, flex justify-end
              alone lets the cart button stretch vertically and the icon
              floats out of line. */}
          <div className="flex-1 basis-0 flex items-center justify-end">
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
