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
  preparePaymentReturn,
  previewWalletTotals,
  setShippingMethod,
  updateCart,
  retrieveCart,
  retrieveCartById,
} from "@lib/data/cart"
import { fetchCartShippingMethods } from "@lib/data/fulfillment"
import { enrichStripePaymentIntent } from "@lib/data/enrich-pi"
import { buildStripeSessionData } from "@lib/util/build-pi-data"
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
  /**
   * When set, all cart mutations target this id instead of the session
   * cookie cart. Used by the PDP Buy Now flow so the user's real cart
   * is never touched.
   */
  buyNowCartId?: string
}

/**
 * Build the wallet sheet's `shippingRates` array from the Medusa cart's
 * available shipping options. Stripe wants ids that are stable strings;
 * we use the Medusa shipping_option id directly so we can look it up
 * after the buyer picks one.
 *
 * Returns an array of `{ id, displayName, amount }`. Stripe expects amount
 * in cents; Medusa 2.x returns decimal dollars (e.g. 7 for $7), so we
 * multiply by 100.
 */
export async function fetchWalletShippingRates(
  cartId: string
): Promise<{ id: string; displayName: string; amount: number }[]> {
  const options = await fetchCartShippingMethods(cartId)
  if (!options || !options.length) return []
  return options
    .map((o: any) => {
      const dollars =
        typeof o.amount === "number"
          ? o.amount
          : typeof o.calculated_price?.calculated_amount === "number"
          ? o.calculated_price.calculated_amount
          : NaN
      return {
        id: o.id as string,
        displayName: (o.name as string) || "Shipping",
        amount: Math.round(dollars * 100),
      }
    })
    .filter((rate) => Number.isFinite(rate.amount) && rate.amount >= 0)
    .sort((a, b) => a.amount - b.amount)
}

export async function walletConfirm({
  cart,
  stripe,
  elements,
  event,
  defaultCountry = "us",
  buyNowCartId,
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

  const shipFirst = (
    shipping.name?.split(" ")[0] ||
    fbFirst ||
    "Customer"
  ).trim()
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
    await updateCart(
      {
        email: event.payerEmail || billing?.email || "",
        shipping_address: shipAddress as any,
        billing_address: billAddress as any,
      },
      buyNowCartId
    )
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
  if (!methods?.length) {
    throw new Error(
      "We could not find shipping for this address. Check your address or use regular checkout."
    )
  }
  const method = methods.find((m: any) => m.id === pickedRateId) || methods[0]
  await setShippingMethod({ cartId: cart.id, shippingMethodId: method.id })

  // ---------- 4. Create / refresh Stripe payment session ----------
  // Re-fetch the cart so address/email/totals updates above are reflected
  // in the metadata + description we attach to the Stripe PI.
  let cartForPi = cart
  try {
    const fresh = buyNowCartId
      ? await retrieveCartById(buyNowCartId)
      : await retrieveCart()
    if (fresh) cartForPi = fresh as HttpTypes.StoreCart
  } catch {
    // best-effort
  }
  let refreshed: any
  try {
    refreshed = await initiatePaymentSession(cartForPi, {
      provider_id: "pp_stripe_stripe",
      data: buildStripeSessionData(cartForPi),
    })
    // Fire-and-forget PI enrichment (receipt_email, descriptor, shipping).
    enrichStripePaymentIntent(cart.id).catch((e) =>
      console.warn("[walletConfirm] enrich-pi failed", e)
    )
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

  await preparePaymentReturn(buyNowCartId)
  const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/checkout/return`,
    },
    redirect: "if_required",
  })

  if (confirmError) {
    if (
      confirmError.payment_intent?.status === "succeeded" ||
      confirmError.payment_intent?.status === "requires_capture"
    ) {
      window.location.assign("/checkout/return")
      return
    }
    throw new Error(confirmError.message || "Payment failed")
  }

  if (
    paymentIntent &&
    (paymentIntent.status === "succeeded" ||
      paymentIntent.status === "requires_capture" ||
      paymentIntent.status === "processing")
  ) {
    window.location.assign("/checkout/return")
    return
  }
  throw new Error(
    "Payment status is unclear. Use Retry confirmation before paying again."
  )
}

/**
 * Build a `lineItems` array for the wallet sheet from a cart-totals
 * preview. The wallet displays:
 *   Subtotal
 *   Shipping
 *   Tax
 *
 * Stripe wallets expect lineItems to sum to the implicit total (the
 * Elements `amount`), so we use Medusa's pre-tax subtotals and pass tax
 * as its own line. Medusa's shipping_total bakes shipping tax in, which
 * would double-count if we passed it directly.
 *
 * All amounts in cents.
 */
function buildLineItems(totals: {
  item_subtotal: number
  shipping_subtotal: number
  tax_total: number
}): { name: string; amount: number }[] {
  const itemCents = Math.round((totals.item_subtotal || 0) * 100)
  const shipCents = Math.round((totals.shipping_subtotal || 0) * 100)
  const taxCents = Math.round((totals.tax_total || 0) * 100)

  const out: { name: string; amount: number }[] = []
  if (itemCents > 0) out.push({ name: "Subtotal", amount: itemCents })
  if (shipCents > 0) out.push({ name: "Shipping", amount: shipCents })
  if (taxCents > 0) out.push({ name: "Tax", amount: taxCents })
  return out
}

/**
 * Stripe ExpressCheckoutElement onShippingAddressChange handler.
 *
 * Fires when the buyer picks an address inside the Apple Pay / Google Pay
 * sheet. We push the address into the Medusa cart so the tax engine kicks
 * in, then resolve the event with refreshed shippingRates + lineItems.
 */
export async function handleShippingAddressChange({
  event,
  cartId,
  elements,
}: {
  event: any
  cartId: string
  elements: StripeElements | null
}) {
  const a = event?.address || {}
  // Stripe gives us only postal_code + state + country before the
  // buyer reveals full street — enough for tax.
  const partial = {
    city: a.city || "",
    province: a.region || a.state || "",
    postal_code: a.postal_code || "",
    country_code: (a.country || "US").toLowerCase(),
  }

  try {
    if (!elements) throw new Error("Payment is not ready")
    await previewWalletTotals({ cartId, shippingAddress: partial })
    const rates = await fetchWalletShippingRates(cartId)
    if (!rates.length) throw new Error("No shipping rate is available")
    const totals = await previewWalletTotals({
      cartId,
      shippingAddress: {},
      shippingMethodId: rates[0].id,
    })
    elements.update({ amount: Math.round(totals.total * 100) })
    event.resolve({ shippingRates: rates, lineItems: buildLineItems(totals) })
  } catch {
    event.reject?.()
  }
}

/**
 * Stripe ExpressCheckoutElement onShippingRateChange handler.
 *
 * Fires when the buyer picks a shipping option in the wallet sheet. We
 * lock that method in on the cart so tax + total reflect it, then resolve
 * with refreshed lineItems.
 */
export async function handleShippingRateChange({
  event,
  cartId,
  elements,
}: {
  event: any
  cartId: string
  elements: StripeElements | null
}) {
  const rateId = event?.shippingRate?.id
  if (!rateId) {
    event.reject?.()
    return
  }

  let totals
  try {
    if (!elements) throw new Error("Payment is not ready")
    // Pass the rate id; previewWalletTotals will set the shipping method
    // on the cart and re-read totals.
    totals = await previewWalletTotals({
      cartId,
      shippingAddress: {}, // already set
      shippingMethodId: rateId,
    })
  } catch (err) {
    event.reject?.()
    console.error("[wallet] previewWalletTotals (rate) failed:", err)
    return
  }

  elements!.update({ amount: Math.round(totals.total * 100) })
  event.resolve({
    lineItems: buildLineItems(totals),
  })
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
        { id: "standard", displayName: "Estimated shipping", amount: 700 },
      ],
    }
  }

  const rates = await fetchWalletShippingRates(cartId)
  return {
    ...base,
    shippingRates: rates.length
      ? rates
      : [{ id: "standard", displayName: "Estimated shipping", amount: 700 }],
  }
}
