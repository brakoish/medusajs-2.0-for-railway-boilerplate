"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense } from "react"

if (typeof window !== "undefined") {
  posthog.init("phc_pFJzDhQoduFoeRe7GaSbXcXQGjWpSEad75VAgTdd5eou", {
    api_host: "https://us.i.posthog.com",
    capture_pageview: false, // we fire manually for accurate SPA routing
    capture_pageleave: true,
    session_recording: { maskAllInputs: true },
  })
}

function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()

  useEffect(() => {
    if (pathname) {
      ph.capture("$pageview", {
        $current_url: window.location.href,
      })
    }
  }, [pathname, searchParams, ph])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </PHProvider>
  )
}
