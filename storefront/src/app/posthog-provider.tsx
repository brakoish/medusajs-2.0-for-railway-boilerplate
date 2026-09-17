"use client"

import { Suspense, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { ANALYTICS_CHOICE, track } from "@lib/util/analytics"

function AnalyticsPreferences() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    try { setOpen(!localStorage.getItem(ANALYTICS_CHOICE)) } catch { /* Essential-only mode. */ }
    const show = () => setOpen(true)
    window.addEventListener("dabpal-analytics-preferences", show)
    return () => window.removeEventListener("dabpal-analytics-preferences", show)
  }, [])
  useEffect(() => {
    if (!/^\/(checkout|account|order|reset-password)(\/|$)/.test(path)) void track("$pageview", { path })
  }, [path])
  function choose(choice: string) {
    try { localStorage.setItem(ANALYTICS_CHOICE, choice) } catch { /* Essential-only mode. */ }
    setOpen(false)
    if (choice === "analytics" && !/^\/(checkout|account|order|reset-password)(\/|$)/.test(path)) void track("$pageview", { path })
  }
  if (!open) return null
  return <aside className="analytics-choice" aria-label="Analytics preferences">
    <p>Help us improve the shop? Optional analytics tell us which guides and products are useful. <a href="/privacy">Privacy details</a></p>
    <div>
      <button onClick={() => choose("essential")}>Essential only</button>
      <button onClick={() => choose("analytics")}>Allow analytics</button>
    </div>
  </aside>
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}<Suspense fallback={null}><AnalyticsPreferences /></Suspense></>
}
