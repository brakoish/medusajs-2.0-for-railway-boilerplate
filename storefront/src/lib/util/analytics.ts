"use client"

import { safeAnalyticsProperties } from "./analytics-properties"
import type { PostHog } from "posthog-js"

export const ANALYTICS_CHOICE = "dabpal-analytics-choice"
let client: Promise<PostHog> | undefined

export function analyticsAllowed() {
  try {
    return (
      window.location.hostname === "thedabpal.com" &&
      localStorage.getItem(ANALYTICS_CHOICE) === "analytics"
    )
  } catch {
    return false
  }
}

export async function track(
  event: string,
  properties: Record<string, unknown> = {}
) {
  if (!analyticsAllowed()) return
  client ||= import("posthog-js").then(({ default: posthog }) => {
    posthog.init("phc_pFJzDhQoduFoeRe7GaSbXcXQGjWpSEad75VAgTdd5eou", {
      api_host: "https://us.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: false,
      autocapture: false,
      disable_session_recording: true,
      disable_surveys: true,
      advanced_disable_feature_flags: true,
      person_profiles: "never",
      persistence: "memory",
      respect_dnt: true,
      before_send: (event) =>
        event
          ? {
              ...event,
              properties: safeAnalyticsProperties(
                event.properties,
                window.location.pathname,
                window.location.origin
              ),
            }
          : null,
    })
    return posthog
  })
  try {
    const ph = await client
    if (analyticsAllowed()) ph.capture(event, properties)
  } catch {
    /* Analytics must never interrupt shopping. */
  }
}

const analytics = { capture: track }
export const useAnalytics = () => analytics
