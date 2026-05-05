/**
 * Shared logic for "wallet confirm" (Apple Pay / Google Pay / Link / PayPal
 * via Stripe ExpressCheckoutElement). Used by both the on-checkout-page
 * Express buttons and the PDP Buy Now button.
 *
 * The Stripe wallet sheet returns the buyer's name + email + phone +
 * shipping + billing + a confirmable payment method. We mirror those into
 * the Medusa cart, lock in the buyer-picked shipping method (or the first
 * available one if Stripe didn't surface a picker), create a Stripe
 * PaymentSession, then call `stripe.confirmPayment` and finalize the order
 * with `placeOrder()`.
 */

import {
  initiatePaymentSession,
  placeOrder,
  setShippingMethod,
  updateCart,
} from "@lib/data/cart"
import { fetchCartShippingMethods } from "@lib/data/fulfillment"
import { HttpTypes } from "@medusajs/types"
import type { Stripe, StripeElements } from "@stripe/stripe-js"

type WalletConfirmInput = {
  cart: HttpTypes.StoreCart
  stripe: Stripe | null
  elements: StripeElements | null
  /**
   * Stripe ExpressCheckoutElement onConfirm event payload (loosely typed
   * since the SDK lib types don't expose all of the runtime fields).
   */
  event: any
  /** Used to build the success return URL. Default: cart shipping country, then "us". */
  defaultCountry?: string
}

/**
 * Build the wallet sheet's `shippingRates` array from the Medusa cart's
 * available shipping options. Stripe wants ids that are stable strings;
 * we use the Medusa shipping_option id directly so we can look it up
 * after the buyer picks one.
 *
 * Returns an array of `{ id, displayName, amount }` (Stripe expects amount
 * in the cart's smallest currency unit, same as Medusa stores).
 */
export async function fetchWalletShippingRates(
  cartId: string
): Promise<{ id: string; displayName: string; amount: number }[]> {
  const options = await fetchCartShippingMethods(cartId)
  if (!options || !options.length) return []
  return options
    .map((o: any) => ({
      id: o.id as string,
      displayName: (o.name as string) || "Shipping",
      amount:
        typeof o.amount === "number"
          ? o.amount
          : typeof o.calculated_price?.calculated_amount === "number"
          ? o.calculated_price.calculated_amount
          : 0,
    }))
    .sort((a, b) => a.amount - b.amount)
}

export async function walletConfirm({
  cart,
  stripe,
  elements,
  event,
  defaultCountry = "us",
}: WalletConfirmInput): Promise<void> {
  if (!stripe || !elements) throw new Error("Stripe not ready")

  // ---------- 1. Build addresses from wallet payload ----------
  const shipping = event.shippingAddress
  const billing = event.billingDetails
  const fallbackName = (event.payerName || billing?.name || "").trim()
  const [fbFirst, ...fbRest] = fallbackName.split(" ")
  const fbLast = fbRest.join(" ")

  if (!shipping?.address) {
    throw new Error("Wallet did not return a shipping address")
  }

  const shipFirst = (shipping.name?.split(" ")[0] || fbFirst || "Customer").trim()
  const shipLast = shipping.name?.split(" ").slice(1).join(" ") || fbLast || ""

  const shipAddress = {
    first_name: shipFirst,
    last_name: shipLast,
    address_1: shipping.address.line1 || "",
    address_2: shipping.address.line2 || "",
    city: shipping.address.city || "",
    province: shipping.address.state || "",
    postal_code: shipping.address.postal_code || "",
    country_code: (shipping.address.country || "US").toLowerCase(),
    phone: event.payerPhone || billing?.phone || "",
  }

  const billAddress = billing?.address
    ? {
        first_name: fbFirst || shipFirst,
        last_name: fbLast || shipLast,
        address_1: billing.address.line1 || shipAddress.address_1,
        address_2: billing.address.line2 || "",
        city: billing.address.city || shipAddress.city,
        province: billing.address.state || shipAddress.province,
        postal_code: billing.address.postal_code || shipAddress.postal_code,
        country_code: (
          billing.address.country || shipAddress.country_code
        ).toLowerCase(),
        phone: billing.phone || event.payerPhone || shipAddress.phone,
      }
    : shipAddress

  // ---------- 2. Write to cart ----------
  try {
    await updateCart({
      email: event.payerEmail || billing?.email || "",
      shipping_address: shipAddress as any,
      billing_address: billAddress as any,
    })
  } catch (err: any) {
    console.error("[walletConfirm] updateCart failed:", err)
    throw new Error(
      `Could not save address to cart: ${err?.message || "unknown error"}`
    )
  }

  // ---------- 3. Lock in a shipping method ----------
  // Prefer the rate the buyer picked in the wallet sheet (event.shippingRate.id
  // is the Medusa option id we passed into onClick.resolve). Fall back to the
  // first/cheapest available option if the wallet didn't surface a picker
  // (e.g. Apple Pay on a single-rate flow).
  const pickedRateId: string | undefined = event.shippingRate?.id
  const methods = await fetchCartShippingMethods(cart.id)
  console.log("[walletConfirm] shipping methods:", methods?.length ?? "null", methods)
  if (!methods?.length) {
    throw new Error(
      "No shipping methods available (cart may need a shipping address; check the browser network tab for the actual API error)"
    )
  }
  const method =
    methods.find((m: any) => m.id === pickedRateId) || methods[0]
  await setShippingMethod({ cartId: cart.id, shippingMethodId: method.id })

  // ---------- 4. Create / refresh Stripe payment session ----------
  let refreshed: any
  try {
    refreshed = await initiatePaymentSession(cart, {
      provider_id: "pp_stripe_stripe",
    })
    console.log("[walletConfirm] payment session created:", refreshed)
  } catch (err: any) {
    console.error("[walletConfirm] initiatePaymentSession failed:", err)
    throw new Error(
      `Could not start payment session: ${err?.message || "unknown error"}`
    )
  }
  const sessionCart =
    refreshed?.cart || refreshed?.payment_collection || refreshed
  const sessions =
    sessionCart?.payment_collection?.payment_sessions ||
    sessionCart?.payment_sessions ||
    []
  const session = sessions.find((s: any) => s.status === "pending")
  const clientSecret = session?.data?.client_secret as string | undefined
  if (!clientSecret) throw new Error("Could not create payment session")

  // ---------- 5. Submit + confirm ----------
  const { error: submitError } = await elements.submit()
  if (submitError) throw new Error(submitError.message || "Submit failed")

  const country = shipAddress.country_code || defaultCountry
  const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/${country}/order/confirmed`,
    },
    redirect: "if_required",
  })

  if (confirmError) {
    if (
      confirmError.payment_intent?.status === "succeeded" ||
      confirmError.payment_intent?.status === "requires_capture"
    ) {
      await placeOrder()
      return
    }
    throw new Error(confirmError.message || "Payment failed")
  }

  if (
    paymentIntent &&
    (paymentIntent.status === "succeeded" ||
      paymentIntent.status === "requires_capture")
  ) {
    await placeOrder()
  }
}

/**
 * Build the `event.resolve()` payload for ExpressCheckoutElement's onClick.
 * Pulls real shipping rates from the cart so the wallet sheet shows
 * actual prices instead of a "Free" placeholder.
 *
 * If `cartId` is not provided yet (PDP — cart hasn't been created), we
 * skip the rates and let the wallet sheet open without a shipping picker.
 * The PDP flow creates the cart on click and the rates get loaded during
 * walletConfirm before the PaymentIntent is created, so the buyer sees
 * the real total on the confirmation screen.
 */
export async function buildWalletClickPayload(cartId?: string) {
  const base = {
    emailRequired: true,
    phoneNumberRequired: true,
    shippingAddressRequired: true,
    billingAddressRequired: true,
    allowedShippingCountries: ["US"],
  }

  if (!cartId) {
    return {
      ...base,
      shippingRates: [
        // Sane default while the cart doesn't exist yet (PDP buy-now).
        // Real rates lock in during walletConfirm.
        { id: "standard", displayName: "Standard Shipping", amount: 700 },
      ],
    }
  }

  const rates = await fetchWalletShippingRates(cartId)
  return {
    ...base,
    shippingRates: rates.length
      ? rates
      : [{ id: "standard", displayName: "Standard Shipping", amount: 700 }],
  }
}
