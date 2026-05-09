"use server"

/**
 * Best-effort enrichment of a Stripe PaymentIntent associated with a Medusa
 * cart. Adds receipt_email, statement_descriptor_suffix, shipping, and a
 * cleaner description after the payment session has been created (which is
 * the only point at which we know the PI id).
 *
 * Calls our custom backend route `POST /store/custom/enrich-pi` which does
 * the actual Stripe API call server-side using the live secret key.
 */
import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export async function enrichStripePaymentIntent(cart_id: string): Promise<{
  ok: boolean
  patched?: string[]
  error?: string
}> {
  if (!cart_id) return { ok: false, error: "missing cart_id" }
  try {
    return (await sdk.client.fetch("/store/custom/enrich-pi", {
      method: "POST",
      headers: {
        ...(await getAuthHeaders()),
      },
      body: { cart_id },
    })) as { ok: boolean; patched?: string[]; error?: string }
  } catch (e: any) {
    return { ok: false, error: e?.message || "request failed" }
  }
}
