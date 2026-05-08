"use client"

/**
 * ExpressCheckout — Apple Pay / Google Pay / Link / PayPal one-tap buttons
 * for the /checkout page. Mounted at the top of the form. Wraps the buttons
 * in a self-contained Stripe Elements provider so it can render before any
 * payment session exists.
 *
 * Confirmation flow lives in `wallet-confirm.ts` so the PDP Buy Now button
 * can reuse the same logic.
 */

import {
  Elements,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import {
  buildWalletClickPayload,
  handleShippingAddressChange,
  handleShippingRateChange,
  walletConfirm,
} from "./wallet-confirm"

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

type Props = {
  cart: HttpTypes.StoreCart
  /**
   * Show a subtle "Or continue with" divider underneath the buttons.
   * Defaults to true (checkout page); pass false on the PDP.
   */
  showDivider?: boolean
}

const ExpressCheckout: React.FC<Props> = ({ cart, showDivider = true }) => {
  if (!stripeKey || !stripePromise) return null
  if (!cart?.region) return null

  // Stripe minimum charge is 50 cents. If the cart total (after promos /
  // discounts) puts us below that, hide the wallet buttons entirely —
  // Stripe can't create a PaymentIntent for $0 and the buttons would just
  // fail on confirm. Free orders need to flow through a different path
  // (TODO: free-checkout button when total === 0).
  // Medusa 2.x returns totals as decimal dollars (e.g. 65 for $65).
  // Stripe wants cents — convert before any threshold check or amount.
  const itemTotalCents = Math.round((cart.item_total ?? cart.subtotal ?? 0) * 100)
  if (itemTotalCents < 50) return null

  // Wallet sheet wants a realistic estimate so the buyer doesn't see
  // "$0.50" before tapping; estimate items + a placeholder $7 standard
  // shipping. Real total locks in during walletConfirm when we set the
  // shipping method and create the payment session.
  const totalCents = useMemo(() => {
    const estimate = itemTotalCents + 700 // +$7 placeholder Standard
    return Math.max(50, Math.round(estimate))
  }, [itemTotalCents])

  return (
    <div className="mb-6">
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: totalCents,
          currency: (cart.currency_code || "usd").toLowerCase(),
          paymentMethodCreation: "manual",
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#f59e0b",
              borderRadius: "8px",
            },
          },
        }}
      >
        <ExpressInner cart={cart} />
      </Elements>
      {showDivider && (
        <div className="flex items-center gap-x-3 my-6 text-ui-fg-subtle text-sm">
          <div className="flex-1 h-px bg-ui-border-base" />
          <span>Or continue with</span>
          <div className="flex-1 h-px bg-ui-border-base" />
        </div>
      )}
    </div>
  )
}

const ExpressInner: React.FC<{ cart: HttpTypes.StoreCart }> = ({ cart }) => {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)

  const handleClick = async (event: any) => {
    const payload = await buildWalletClickPayload(cart.id)
    event.resolve(payload)
  }

  const handleAddressChange = async (event: any) => {
    await handleShippingAddressChange({ event, cartId: cart.id })
  }

  const handleRateChange = async (event: any) => {
    await handleShippingRateChange({ event, cartId: cart.id })
  }

  const handleConfirm = async (event: any) => {
    setError(null)
    try {
      await walletConfirm({
        cart,
        stripe,
        elements,
        event,
      })
    } catch (e: any) {
      setError(e?.message || "Express checkout failed")
      try {
        await retrieveCart()
        router.refresh()
      } catch {}
    }
  }

  return (
    <>
      <ExpressCheckoutElement
        onClick={handleClick as any}
        onConfirm={handleConfirm as any}
        onShippingAddressChange={handleAddressChange as any}
        onShippingRateChange={handleRateChange as any}
        options={{
          buttonHeight: 48,
          buttonTheme: { applePay: "black", googlePay: "black" },
        }}
      />
      {error && (
        <p className="text-ui-fg-error text-sm mt-2" role="alert">
          {error}
        </p>
      )}
    </>
  )
}

export default ExpressCheckout
