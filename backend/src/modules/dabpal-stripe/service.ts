/**
 * DabPalStripeService
 *
 * Thin wrapper around the official @medusajs/payment-stripe StripeProviderService
 * that fixes a 100x amount over-multiplication bug.
 *
 * Background
 * ----------
 * Medusa stores cart totals in the smallest currency unit (e.g. USD cents).
 * A $25 cart shows up as `cart.total = 2500`. When `createPaymentSessions`
 * fires it passes `amount: paymentCollection.amount` (also 2500) directly
 * to the payment provider's `initiatePayment({ amount, currency_code })`.
 *
 * The official Stripe provider then runs `getSmallestUnit(amount, "usd")`,
 * which assumes its input is in *dollars* and multiplies by 100 to convert
 * to cents. The result: a $25 cart becomes a $2,500 PaymentIntent. Apple
 * Pay either declines outright or auths an amount the buyer didn't agree
 * to, surfacing as "Payment Failed" with no obvious cause.
 *
 * Fix
 * ---
 * Override `initiatePayment` (and update/refund) to pre-divide the amount
 * by 100 (or the appropriate smallest-unit divisor) before passing it
 * down. The base class then re-multiplies by 100 inside getSmallestUnit
 * and lands on the correct Stripe amount.
 *
 * Why a wrapper instead of a fork
 * --------------------------------
 * Keeps us on upstream @medusajs/payment-stripe for security/feature
 * updates. The override surface is tiny: just the input-amount conversion.
 * If/when Medusa fixes the bug upstream we can delete this module.
 */

import StripeProviderServiceBase from "@medusajs/payment-stripe/dist/services/stripe-provider"

// USD/EUR/etc. = 2 decimals (multiplier 100). The few zero- and three-
// decimal currencies need different handling. Mirror the official lookup
// so we stay in sync if Stripe adds support for new ones.
const ZERO_DECIMAL = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
])
const THREE_DECIMAL = new Set([
  "BHD",
  "IQD",
  "JOD",
  "KWD",
  "OMR",
  "TND",
])

function smallestUnitDivisor(currency: string): number {
  const c = (currency || "").toUpperCase()
  if (ZERO_DECIMAL.has(c)) return 1
  if (THREE_DECIMAL.has(c)) return 1000
  return 100
}

/** Convert a Medusa "smallest unit" amount (e.g. 2500 cents) into the
 *  decimal-unit value the official Stripe provider expects (e.g. 25). */
function toStripeMajor(amount: any, currency: string): number {
  const n =
    typeof amount === "number"
      ? amount
      : Number(amount?.numeric ?? amount?.value ?? amount)
  if (!Number.isFinite(n)) return 0
  return n / smallestUnitDivisor(currency)
}

class DabPalStripeService extends (StripeProviderServiceBase as any) {
  static identifier = "stripe"

  get paymentIntentOptions() {
    return {}
  }

  async initiatePayment(input: any) {
    return super.initiatePayment({
      ...input,
      amount: toStripeMajor(input.amount, input.currency_code),
    })
  }

  async updatePayment(input: any) {
    if (input?.amount === undefined) return super.updatePayment(input)
    return super.updatePayment({
      ...input,
      amount: toStripeMajor(input.amount, input.currency_code),
    })
  }

  async refundPayment(input: any) {
    if (input?.amount === undefined) return super.refundPayment(input)
    const currency = input?.data?.currency || input?.currency_code
    return super.refundPayment({
      ...input,
      amount: toStripeMajor(input.amount, currency),
    })
  }

  async capturePayment(input: any) {
    if (input?.amount === undefined) return super.capturePayment(input)
    const currency = input?.data?.currency || input?.currency_code
    return super.capturePayment({
      ...input,
      amount: toStripeMajor(input.amount, currency),
    })
  }
}

export default DabPalStripeService
