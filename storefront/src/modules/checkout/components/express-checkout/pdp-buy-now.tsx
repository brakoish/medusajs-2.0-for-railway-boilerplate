"use client"

/**
 * PdpBuyNow — Express Checkout buttons (Apple Pay / Google Pay / Link)
 * directly under "Add to cart" on the product page. Equivalent of
 * Shopify's Shop Pay buttons.
 *
 * On click:
 *   1. Add the selected variant to a cart (creates one if needed).
 *   2. Retrieve the cart so the wallet sheet has the correct line items.
 *   3. Hand off to the shared walletConfirm() flow (same code path as
 *      the on-checkout-page Express Checkout).
 *
 * The buttons render against the variant price (we don't yet have a
 * cart at mount time), so the wallet sheet shows an accurate amount
 * before tap. The PaymentSession is created with the live cart total
 * after add-to-cart succeeds, which is what actually charges the buyer.
 */

import {
  Elements,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import { addToCart, retrieveCart } from "@lib/data/cart"
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
  variant?: HttpTypes.StoreProductVariant
  countryCode: string
  inStock: boolean
  /** Quantity to add (default 1). */
  quantity?: number
  /** Hide the buttons (when no variant is selected, etc.) */
  disabled?: boolean
}

const PdpBuyNow: React.FC<Props> = ({
  variant,
  countryCode,
  inStock,
  quantity = 1,
  disabled,
}) => {
  if (!stripeKey || !stripePromise) return null
  if (disabled || !variant?.id || !inStock) return null

  // Pull amount + currency from the variant's calculated price.
  // Medusa stores in the smallest unit (USD cents, $25 -> 2500).
  const amount = (variant as any)?.calculated_price?.calculated_amount as
    | number
    | undefined
  const currency = (
    (variant as any)?.calculated_price?.currency_code || "usd"
  ).toLowerCase()
  if (!amount) return null

  // Estimate item total + $7 placeholder shipping so the wallet sheet
  // shows a realistic number before tap. Real total locks in during
  // walletConfirm when shipping method is set on the cart.
  //
  // IMPORTANT: Medusa 2.x returns prices as decimal dollars (e.g. 25 for
  // $25), but Stripe wants cents (2500). Multiply by 100.
  const totalCents = useMemo(() => {
    return Math.max(50, Math.round(amount * 100 * quantity + 700))
  }, [amount, quantity])

  return (
    <div className="mt-2">
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: totalCents,
          currency,
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
        <PdpBuyNowInner
          variantId={variant.id!}
          countryCode={countryCode}
          quantity={quantity}
        />
      </Elements>
    </div>
  )
}

const PdpBuyNowInner: React.FC<{
  variantId: string
  countryCode: string
  quantity: number
}> = ({ variantId, countryCode, quantity }) => {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)

  // Track the active cart id so onShippingAddressChange/onShippingRateChange
  // (which fire BEFORE confirm) can preview tax against a real cart.
  const cartIdRef = useRef<string | null>(null)

  const handleClick = async (event: any) => {
    // Eagerly create/use the cart and add the variant so the wallet
    // sheet's onShippingAddressChange has a real cart to query for tax
    // and shipping. Ensures the buyer sees real totals before confirming.
    try {
      await addToCart({ variantId, quantity, countryCode })
      const cart = await retrieveCart()
      cartIdRef.current = cart?.id || null
    } catch (err) {
      // If add-to-cart fails we still let the wallet open with the
      // placeholder; confirm will surface the real error.
      console.error("[pdp-buy-now] eager addToCart failed:", err)
    }
    const payload = await buildWalletClickPayload(
      cartIdRef.current || undefined
    )
    event.resolve(payload)
  }

  const handleAddressChange = async (event: any) => {
    if (!cartIdRef.current) {
      event.resolve({})
      return
    }
    await handleShippingAddressChange({
      event,
      cartId: cartIdRef.current,
    })
  }

  const handleRateChange = async (event: any) => {
    if (!cartIdRef.current) {
      event.resolve({})
      return
    }
    await handleShippingRateChange({
      event,
      cartId: cartIdRef.current,
    })
  }

  const handleConfirm = async (event: any) => {
    setError(null)
    try {
      // Cart was already created in handleClick; just retrieve it fresh
      // and run the same wallet -> place-order flow as the checkout page.
      const cart = await retrieveCart()
      if (!cart) throw new Error("Could not retrieve cart")

      await walletConfirm({
        cart,
        stripe,
        elements,
        event,
        defaultCountry: countryCode,
      })
    } catch (e: any) {
      setError(e?.message || "Buy now failed")
      try {
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
          buttonHeight: 44,
          buttonTheme: { applePay: "black", googlePay: "black" },
          // Restrict to wallet methods only on the PDP (no Link / PayPal
          // overlays cluttering the product page; those still appear
          // on /checkout for buyers who didn't use a wallet here).
          paymentMethods: {
            applePay: "auto",
            googlePay: "auto",
            link: "never",
            paypal: "never",
            amazonPay: "never",
          },
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

export default PdpBuyNow
