import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

// Auth/cookie-gated, must render per-request.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Dab Pal account.",
}

export default function Login() {
  return <LoginTemplate />
}
