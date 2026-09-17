import type { Metadata } from "next"
import PaymentReturn from "@modules/checkout/components/payment-return"

export const metadata: Metadata = {
  title: "Confirming your order · Dab Pal",
  robots: { index: false, follow: false },
}

export default function PaymentReturnPage() {
  return <PaymentReturn />
}
