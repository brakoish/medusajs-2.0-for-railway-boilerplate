"use client"

import { useEffect, useRef, useState } from "react"
import { completePaymentReturn } from "@lib/data/cart"

export default function PaymentReturn() {
  const started = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)

  const confirm = async () => {
    setBusy(true)
    setError(null)
    try {
      await completePaymentReturn()
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not confirm your order. Please try again.")
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!started.current) {
      started.current = true
      void confirm()
    }
  }, [])

  return (
    <section className="studio-container py-16 max-w-2xl">
      <h1 className="studio-display text-4xl mb-6">Confirming your order</h1>
      {busy && <p role="status">Please keep this page open while we check your payment.</p>}
      {error && <>
        <p role="alert" className="mb-6">{error}</p>
        <button className="studio-button" onClick={confirm}>Retry confirmation</button>
        <p className="mt-6">Need a hand? <a className="underline" href="mailto:hello@thedabpal.com">Email Dab Pal</a>.</p>
      </>}
    </section>
  )
}
