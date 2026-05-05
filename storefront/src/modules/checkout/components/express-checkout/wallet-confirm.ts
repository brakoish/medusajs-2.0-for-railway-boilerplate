/**
 * Shared logic for "wallet confirm" (Apple Pay / Google Pay / Link / PayPal
 * via Stripe ExpressCheckoutElement). Used by both the on-checkout-page
 * Express buttons and the PDP Buy Now button.
 *
 * The Stripe wallet sheet returns the buyer's name + email + phone +
 * shipping + billing + a confirmable payment method. We mirror those into
 * the Medusa cart, lock in the only available shipping method, create a
 * Stripe PaymentSession, then call `stripe.confirmPayment` and finalize
 * the order with `placeOrder()`.
 */

import {
  initiatePaymentSession,
  placeOrder,
  setShippingMethod,
  updateCart,
} from "@lib/data/cart"
import { listCartShippingMethods } from "@lib/data/fulfillment"
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
  await updateCart({
    email: event.payerEmail || billing?.email || "",
    shipping_address: shipAddress as any,
    billing_address: billAddress as any,
  })

  // ---------- 3. Pick a shipping method (single US rate today) ----------
  const methods = await listCartShippingMethods(cart.id)
  const method = methods?.[0]
  if (!method) throw new Error("No shipping methods available")
  await setShippingMethod({ cartId: cart.id, shippingMethodId: method.id })

  // ---------- 4. Create / refresh Stripe payment session ----------
  const refreshed = (await initiatePaymentSession(cart, {
    provider_id: "pp_stripe_stripe",
  })) as any
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

export const walletClickResolve = (event: any) => {
  event.resolve({
    emailRequired: true,
    phoneNumberRequired: true,
    shippingAddressRequired: true,
    billingAddressRequired: true,
    allowedShippingCountries: ["US"],
    shippingRates: [
      // Placeholder rate so the wallet sheet renders. We pick the real
      // Medusa shipping option after the wallet returns.
      { id: "standard", displayName: "Standard shipping", amount: 0 },
    ],
  })
}
