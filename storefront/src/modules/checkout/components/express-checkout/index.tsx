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
import { buildWalletClickPayload, walletConfirm } from "./wallet-confirm"

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

  // Stripe minimum charge is 50 cents. The wallet sheet still wants a
  // realistic estimate so the buyer doesn't see "$0.50" before tapping;
  // we estimate cart subtotal + a placeholder $7 standard shipping. The
  // real total locks in during walletConfirm when we set the shipping
  // method on the cart and create the payment session.
  const totalCents = useMemo(() => {
    const itemTotal = cart.item_total ?? cart.subtotal ?? 0
    const estimate = itemTotal + 700 // +$7 placeholder Standard
    return Math.max(50, Math.round(estimate))
  }, [cart.item_total, cart.subtotal])

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
