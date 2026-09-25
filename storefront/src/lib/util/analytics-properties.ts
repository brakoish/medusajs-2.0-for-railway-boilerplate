// Final allowlist: SDK-added session URLs and nested properties never leave the browser.
export function publicAnalyticsPath(path: string) {
  const clean = path.split(/[?#]/)[0]
  if (/^\/order(?:\/|$)/.test(clean)) return "/order"
  if (/^\/account(?:\/|$)/.test(clean)) return "/account"
  if (/^\/checkout(?:\/|$)/.test(clean)) return "/checkout"
  if (clean === "/reset-password") return clean
  return clean
}

export function safeAnalyticsProperties(
  properties: Record<string, unknown>,
  pathname: string,
  origin: string
) {
  const allowed = [
    // SDK protocol fields: route events and preserve person_profiles: "never".
    "token",
    "$process_person_profile",
    "distinct_id",
    "$device_id",
    "$browser",
    "$os",
    "$device_type",
    "$lib",
    "$lib_version",
    "currency",
    "value",
    "quantity",
    "product_id",
    "variant_id",
    "article_slug",
    "placement",
  ]
  const safe: Record<string, unknown> = {}
  for (const key of allowed) {
    const value = properties[key]
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    )
      safe[key] = value
  }
  for (const key of ["path", "destination"]) {
    const value = properties[key]
    if (typeof value === "string" && value.startsWith("/"))
      safe[key] = publicAnalyticsPath(value)
  }
  if (typeof properties.$referrer === "string") {
    try {
      safe.referrer_host = new URL(properties.$referrer).hostname
    } catch {
      /* No usable referrer. */
    }
  }
  safe.$pathname = publicAnalyticsPath(pathname)
  safe.$current_url = origin + safe.$pathname
  return safe
}
