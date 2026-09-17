"use client"

import { Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { HttpTypes } from "@medusajs/types"

type StripeWrapperProps = {
  paymentSession: HttpTypes.StorePaymentSession
  stripeKey?: string
  stripePromise: Promise<Stripe | null> | null
  children: React.ReactNode
}

const StripeWrapper: React.FC<StripeWrapperProps> = ({
  paymentSession,
  stripeKey,
  stripePromise,
  children,
}) => {
  const options: StripeElementsOptions = {
    clientSecret: paymentSession!.data?.client_secret as string | undefined,
    // Brand-matched appearance so the PaymentElement (and Apple Pay /
    // Google Pay buttons) inherit the Dab Pal warm accent.
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#b4492c",
        colorBackground: "#faf7f0",
        colorText: "#0a0a0a",
        colorDanger: "#dc2626",
        fontFamily: "Arial, sans-serif",
        borderRadius: "8px",
        spacingUnit: "4px",
      },
      rules: {
        ".Input": {
          border: "1px solid #e5e7eb",
          boxShadow: "none",
        },
        ".Input:focus": {
          border: "1px solid #b4492c",
          boxShadow: "0 0 0 3px rgba(180, 73, 44, 0.2)",
        },
        ".Tab": {
          border: "1px solid #e5e7eb",
        },
        ".Tab--selected": {
          borderColor: "#b4492c",
          boxShadow: "0 0 0 1px #b4492c",
        },
      },
    },
  }

  if (!stripeKey) {
    throw new Error(
      "Stripe key is missing. Set NEXT_PUBLIC_STRIPE_KEY environment variable."
    )
  }

  if (!stripePromise) {
    throw new Error(
      "Stripe promise is missing. Make sure you have provided a valid Stripe key."
    )
  }

  if (!paymentSession?.data?.client_secret) {
    throw new Error(
      "Stripe client secret is missing. Cannot initialize Stripe."
    )
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      {children}
    </Elements>
  )
}

export default StripeWrapper
