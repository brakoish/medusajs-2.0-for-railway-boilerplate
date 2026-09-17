import type { Metadata } from "next"
import PasswordReset from "@modules/account/components/password-reset"

export const metadata: Metadata = { title: "Reset your password · Dab Pal", robots: { index: false, follow: false }, referrer: "no-referrer" }

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return <PasswordReset token={token} />
}
