"use server"

import { sdk } from "@lib/config"

export async function requestPasswordReset(_: unknown, form: FormData) {
  const email = String(form.get("email") || "").trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." }
  try {
    await sdk.auth.resetPassword("customer", "emailpass", { identifier: email })
  } catch (error: any) {
    // Unknown accounts get the same response; service outages should be actionable.
    if (error?.status !== 404) return { error: "We could not request the reset link. Please try again shortly." }
  }
  return { success: "If an account matches that email, a reset link is on its way. Check your spam folder too." }
}

export async function resetCustomerPassword(_: unknown, form: FormData) {
  const token = String(form.get("token") || "")
  const password = String(form.get("password") || "")
  if (!token) return { error: "Open the reset link from your email first." }
  if (password.length < 8) return { error: "Use at least 8 characters for your new password." }
  if (password !== form.get("confirm_password")) return { error: "The passwords do not match." }
  try {
    await sdk.auth.updateProvider("customer", "emailpass", { password }, token)
    return { success: "Your password has been updated. You can sign in now." }
  } catch {
    return { error: "This link is invalid or expired. Request a new reset link." }
  }
}
