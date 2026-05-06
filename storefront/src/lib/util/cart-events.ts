/**
 * Tiny pub-sub for cart mutations across client components.
 *
 * Why this exists:
 *   The nav's cart count badge is rendered inside a server component
 *   (CartButton) wrapped in Suspense. After `addToCart`, we revalidate
 *   the "cart" cache tag, which busts /cart and /checkout pages, but
 *   the layout that hosts the nav is cached separately and does NOT
 *   refresh until the user navigates. Result: badge reads stale, often
 *   "Cart (0)" right after adding an item.
 *
 * Fix: client components that care about cart state subscribe to this
 * event bus. Server actions that mutate the cart fire `dispatchCartChange()`
 * via a small client-side wrapper after they resolve, and subscribers
 * re-fetch their slice of cart state.
 */

const EVENT = "dabpal:cart-changed"

export function dispatchCartChange() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(EVENT))
}

export function subscribeToCartChange(handler: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
