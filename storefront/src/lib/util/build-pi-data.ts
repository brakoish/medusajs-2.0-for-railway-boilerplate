import type { HttpTypes } from "@medusajs/types"

/**
 * Build the `data` payload passed into Medusa's
 * `initiatePaymentSession` call so it flows through to Stripe's
 * `paymentIntents.create` request.
 *
 * Stripe's Medusa provider whitelists a limited set of keys via
 * `normalizePaymentIntentParameters` (capture_method, payment_method_types,
 * etc.) PLUS spreads `data.metadata` directly. We use `payment_description`
 * to set the PI's top-level `description`, and pack `metadata` with retail
 * tagging + cart linkage so we can filter retail vs wholesale on the
 * shared Stripe account.
 *
 * `receipt_email`, `statement_descriptor_suffix`, and `shipping` are NOT
 * passed through here (they're not in the provider's allowlist). Those are
 * patched onto the PI by a backend custom route after the session is
 * created. See storefront/src/lib/data/enrich-pi.ts.
 */
export function buildStripeSessionData(cart: HttpTypes.StoreCart): {
  metadata: Record<string, string>
  payment_description?: string
} {
  const items = cart.items || []
  const firstItem = items[0]
  const itemSummary = firstItem
    ? `${firstItem.title || "Dab Pal"}${
        firstItem.variant_title ? ` - ${firstItem.variant_title}` : ""
      }${items.length > 1 ? ` + ${items.length - 1} more` : ""}`
    : "Dab Pal"

  const description = `Dab Pal · ${itemSummary}`.slice(0, 350)

  const metadata: Record<string, string> = {
    channel: "retail-dabpal",
    cart_id: cart.id,
  }
  if (cart.email) metadata.email = cart.email
  if (firstItem?.variant_sku) metadata.sku = firstItem.variant_sku
  if (items.length) metadata.item_count = String(items.length)
  if (firstItem?.quantity) metadata.first_qty = String(firstItem.quantity)

  return {
    metadata,
    payment_description: description,
  }
}
