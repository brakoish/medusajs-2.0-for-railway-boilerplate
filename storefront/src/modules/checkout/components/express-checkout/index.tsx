"use client"

/**
 * ExpressCheckout — Apple Pay / Google Pay / Link / PayPal one-tap buttons.
 *
 * Renders Stripe's ExpressCheckoutElement at the top of the checkout page
 * (and optionally on the PDP under Add to cart). When the buyer taps a
 * wallet, the wallet sheet fills shipping + billing + payment in one shot;
 * we mirror those values into the Medusa cart, lock in the only US
 * shipping method, create a Stripe PaymentSession, then confirm the
 * payment with the wallet credentials and finalize the order.
 *
 * This component is intentionally self-contained (its own Elements
 * provider) so it can mount before a Stripe PaymentSession exists.
 */

import { Elements, ExpressCheckoutElement } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  initiatePaymentSession,
  placeOrder,
  retrieveCart,
  setShippingMethod,
  updateCart,
} from "@lib/data/cart"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { HttpTypes } from "@medusajs/types"

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

  const totalCents = useMemo(() => {
    // Medusa returns totals in major units for some flows; coerce to cents.
    const total = cart.total ?? 0
    return Math.max(50, Math.round(total)) // Stripe minimum is 50 cents
  }, [cart.total])

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

type ConfirmEvent = Parameters<
  NonNullable<
    React.ComponentProps<typeof ExpressCheckoutElement>["onConfirm"]
  >
>[0]

const ExpressInner: React.FC<{ cart: HttpTypes.StoreCart }> = ({ cart }) => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async (event: ConfirmEvent) => {
    setError(null)
    try {
      const { stripe, elements } = event as unknown as {
        stripe: import("@stripe/stripe-js").Stripe | null
        elements: import("@stripe/stripe-js").StripeElements | null
      }
      const ev = event as any
      if (!stripe || !elements) {
        throw new Error("Stripe not ready")
      }

      // 1. Mirror wallet shipping/billing into Medusa cart.
      const shipping = ev.shippingAddress
      const billing = ev.billingDetails
      const fallbackName = (ev.payerName || billing?.name || "").trim()
      const [firstName, ...rest] = fallbackName.split(" ")
      const lastName = rest.join(" ") || ""

      const shipAddress = shipping?.address
        ? {
            first_name:
              (shipping.name?.split(" ")[0] || firstName || "Customer").trim(),
            last_name:
              (shipping.name?.split(" ").slice(1).join(" ") || lastName || ""),
            address_1: shipping.address.line1 || "",
            address_2: shipping.address.line2 || "",
            city: shipping.address.city || "",
            province: shipping.address.state || "",
            postal_code: shipping.address.postal_code || "",
            country_code: (shipping.address.country || "US").toLowerCase(),
            phone: ev.payerPhone || billing?.phone || "",
          }
        : null

      const billAddress = billing?.address
        ? {
            first_name: firstName || "Customer",
            last_name: lastName,
            address_1: billing.address.line1 || shipAddress?.address_1 || "",
            address_2: billing.address.line2 || "",
            city: billing.address.city || shipAddress?.city || "",
            province: billing.address.state || shipAddress?.province || "",
            postal_code:
              billing.address.postal_code || shipAddress?.postal_code || "",
            country_code: (
              billing.address.country ||
              shipAddress?.country_code ||
              "us"
            ).toLowerCase(),
            phone: billing.phone || ev.payerPhone || "",
          }
        : shipAddress

      if (!shipAddress) throw new Error("Wallet did not return a shipping address")

      await updateCart({
        email: ev.payerEmail || billing?.email || "",
        shipping_address: shipAddress as any,
        billing_address: (billAddress || shipAddress) as any,
      })

      // 2. Pick a shipping method. Single US region today; grab first.
      const methods = await listCartShippingMethods(cart.id)
      const method = methods?.[0]
      if (!method) throw new Error("No shipping methods available")
      await setShippingMethod({
        cartId: cart.id,
        shippingMethodId: method.id,
      })

      // 3. Create / refresh Stripe payment session so we get a client_secret.
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

      // 4. Submit elements (collects wallet payment method) + confirm.
      const { error: submitError } = await elements.submit()
      if (submitError) throw new Error(submitError.message || "Submit failed")

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/${shipAddress.country_code}/order/confirmed`,
          },
          redirect: "if_required",
        }
      )

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
        return
      }
    } catch (e: any) {
      setError(e?.message || "Express checkout failed")
      try {
        // Refresh server cart in case of partial state.
        await retrieveCart()
        router.refresh()
      } catch {}
    }
  }

  // Tell the wallet sheet what we need (shipping/billing/email/phone).
  // These flags belong on the click event, not on element options.
  const handleClick = (event: any) => {
    event.resolve({
      emailRequired: true,
      phoneNumberRequired: true,
      shippingAddressRequired: true,
      billingAddressRequired: true,
      allowedShippingCountries: ["US"],
      shippingRates: [
        // Single placeholder rate so the wallet sheet renders. We pick
        // the real Medusa shipping option after the wallet returns.
        {
          id: "standard",
          displayName: "Standard shipping",
          amount: 0,
        },
      ],
    })
  }

  return (
    <>
      <ExpressCheckoutElement
        onClick={handleClick}
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
