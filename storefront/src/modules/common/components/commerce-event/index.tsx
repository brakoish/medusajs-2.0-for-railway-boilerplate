"use client"

import { useEffect } from "react"
import { analyticsAllowed, track } from "@lib/util/analytics"

export default function CommerceEvent({ event, value, currency, sessionKey }: {
  event: "begin_checkout" | "purchase"
  value: number
  currency: string
  sessionKey: string
}) {
  useEffect(() => {
    if (!analyticsAllowed()) return
    try {
      // The order/cart ID is used locally for deduplication; never sent to analytics.
      const key = `dabpal-event:${event}:${sessionKey}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, "sent")
      void track(event, { value, currency })
    } catch { /* Checkout does not depend on browser storage. */ }
  }, [event, value, currency, sessionKey])
  return null
}
