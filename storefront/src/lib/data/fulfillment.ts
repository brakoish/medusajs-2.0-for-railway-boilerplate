import { sdk } from "@lib/config"
import { cache } from "react"

// Shipping actions.
//
// Direct SDK call wrapped in a permissive try/catch. We deliberately do
// NOT use Next's revalidation-tag cache wrapper here because this fn is
// called from both server components AND client components (the wallet
// flow on the cart page). React's `cache()` is a server-only primitive
// and the `{ next: { tags } }` option is a Next.js fetch extension that
// the Medusa SDK passes through as a header on the client — which can
// cause the request to fail silently with a confusing error.
async function fetchCartShippingMethods(cartId: string) {
  try {
    const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
      cart_id: cartId,
    })
    return shipping_options
  } catch (err) {
    if (typeof window !== "undefined") {
      console.error("[listCartShippingMethods] failed:", err)
    }
    return null
  }
}

// Server-component callsites use the React-cached version so multiple
// reads in the same render don't refetch. Client callsites (wallet flow)
// can call `fetchCartShippingMethods` directly.
export const listCartShippingMethods = cache(fetchCartShippingMethods)
export { fetchCartShippingMethods }
