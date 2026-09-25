"use client"

import { useEffect } from "react"
import { analyticsAllowed, track } from "@lib/util/analytics"

export default function CommerceEvent({ event, value, currency, sessionKey }: {
  sessionKey: string
} & (
  | { event: "begin_checkout"; value: number; currency: string }
  | { event: "order_confirmation_viewed"; value?: never; currency?: never }
)) {
  useEffect(() => {
    if (!analyticsAllowed()) return
    try {
      // Suppress repeat attempts in this tab; this marker does not prove delivery.
      // The order/cart ID stays local and is never sent to analytics.
      const key = `dabpal-event:${event}:${sessionKey}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, "attempted")
      void track(event, event === "begin_checkout" ? { value, currency } : {})
    } catch { /* Checkout does not depend on browser storage. */ }
  }, [event, value, currency, sessionKey])
  return null
}
