"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function CheckoutStepFocus() {
  const step = useSearchParams().get("step") || "address"
  const previousStep = useRef<string | null>(null)

  useEffect(() => {
    const initialAddress = previousStep.current === null && step === "address"
    previousStep.current = step
    if (initialAddress) return
    const section = document.getElementById(`checkout-${step}`)
    if (!section) return
    section.focus({ preventScroll: true })
    section.scrollIntoView({ block: "start" })
  }, [step])

  return null
}
