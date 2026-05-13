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
  const itemCents = useMemo(() => Math.round(amount * 100 * quantity), [amount, quantity])
  const totalCents = useMemo(() => Math.max(50, itemCents + 700), [itemCents])

  // Human-readable label for the wallet sheet line item.
  // variant.title is Medusa's combined option string e.g. "1-Pack / Black Speck".
  const variantLabel = useMemo(() => {
    const base = "Dab Pal"
    const title = (variant as any)?.title as string | undefined
    if (title) return `${base} – ${title.replace(" / ", " · ")}`
    return base
  }, [(variant as any)?.title])

  return (
    <div className="mt-3 animate-fade-slide-up">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[11px] text-gray-400 uppercase tracking-widest select-none">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
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
          variantLabel={variantLabel}
          itemCents={itemCents}
        />
      </Elements>
    </div>
  )
}

const PdpBuyNowInner: React.FC<{
  variantId: string
  countryCode: string
  quantity: number
  variantLabel: string
  itemCents: number
}> = ({ variantId, countryCode, quantity, variantLabel, itemCents }) => {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)

  // Track the active cart id so onShippingAddressChange/onShippingRateChange
  // (which fire BEFORE confirm) can preview tax against a real cart.
  const cartIdRef = useRef<string | null>(null)
  // A pending promise the change handlers can await while the eager
  // addToCart from handleClick is still in flight. Resolves to the cart
  // id (or null on failure).
  const cartReadyRef = useRef<Promise<string | null> | null>(null)

  const handleClick = (event: any) => {
    // CRITICAL: this handler must resolve the wallet click *synchronously*.
    // iOS Safari kills the wallet sheet if the user-gesture chain is
    // broken by an awaited Promise. So we resolve with a placeholder rate
    // immediately, and kick off the addToCart in the background. The
    // address-change handler awaits cartReadyRef before it talks to
    // Medusa, so by the time the buyer picks an address the cart is
    // ready and tax can be previewed correctly.
    event.resolve({
      emailRequired: true,
      phoneNumberRequired: true,
      shippingAddressRequired: true,
      billingAddressRequired: true,
      allowedShippingCountries: ["US"],
      // Show what the buyer is purchasing before they enter their address.
      // After address-change fires, buildLineItems replaces this with the
      // real subtotal/shipping/tax breakdown.
      lineItems: [
        { name: variantLabel, amount: itemCents },
        { name: "Shipping", amount: 700 },
      ],
      shippingRates: [
        { id: "standard", displayName: "Standard Shipping", amount: 700 },
      ],
    })

    // Fire-and-track the cart preparation so change handlers can wait.
    cartReadyRef.current = (async () => {
      try {
        await addToCart({ variantId, quantity, countryCode })
        const cart = await retrieveCart()
        cartIdRef.current = cart?.id || null
        return cartIdRef.current
      } catch (err) {
        console.error("[pdp-buy-now] eager addToCart failed:", err)
        return null
      }
    })()
  }

  // Wait for the eager addToCart to finish, but give up after timeoutMs and
  // return null so the wallet callback can resolve with a fallback instead
  // of hanging until Google/Apple Pay kills the sheet with REQUEST_TIMEOUT.
  const ensureCartId = async (timeoutMs = 6000): Promise<string | null> => {
    if (cartIdRef.current) return cartIdRef.current
    if (!cartReadyRef.current) return null
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
    return await Promise.race([cartReadyRef.current, timeout])
  }

  const FALLBACK_RATES = [
    { id: "standard", displayName: "Standard Shipping", amount: 700 },
  ]

  const handleAddressChange = async (event: any) => {
    const cartId = await ensureCartId()
    if (!cartId) {
      // Cart not ready — resolve with flat-rate fallback so the sheet
      // doesn't hit its deadline. Real total locks in on confirm.
      event.resolve({ shippingRates: FALLBACK_RATES })
      return
    }
    await handleShippingAddressChange({ event, cartId })
  }

  const handleRateChange = async (event: any) => {
    const cartId = await ensureCartId()
    if (!cartId) {
      event.resolve({})
      return
    }
    await handleShippingRateChange({ event, cartId })
  }

  const handleConfirm = async (event: any) => {
    setError(null)
    try {
      // Wait for the eager addToCart from handleClick to complete, with a
      // generous timeout — confirm has more headroom than address-change.
      await ensureCartId(12000)
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
