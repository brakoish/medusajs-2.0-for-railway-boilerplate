import { sdk } from "@lib/config"
import { cache } from "react"

// Shipping actions
export const listCartShippingMethods = cache(async function (cartId: string) {
  return sdk.store.fulfillment
    .listCartOptions({ cart_id: cartId }, { next: { tags: ["shipping"] } })
    .then(({ shipping_options }) => shipping_options)
    .catch((err) => {
      // Surface the failure in the browser console so we can diagnose
      // shipping-method issues at checkout instead of silently coercing
      // to null and showing a generic "No shipping methods available".
      if (typeof window !== "undefined") {
        console.error("[listCartShippingMethods] failed:", err)
      }
      return null
    })
})
