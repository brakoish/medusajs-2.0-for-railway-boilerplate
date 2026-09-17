"use client"

import { useFormState } from "react-dom"
import { requestPasswordReset, resetCustomerPassword } from "@lib/data/password-reset"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function PasswordReset({ token }: { token?: string }) {
  const [state, action] = useFormState(token ? resetCustomerPassword : requestPasswordReset, null)
  return (
    <main className="studio-container py-16">
      <div className="max-w-md mx-auto">
        <h1 className="studio-display text-4xl mb-6">{token ? "A fresh start" : "Forgot your password?"}</h1>
        <p className="mb-6">{token ? "Choose a new password for your Dab Pal account." : "Enter your email and we’ll send you a reset link."}</p>
        {state?.success ? <p role="status">{state.success}</p> : <form action={action} className="space-y-4">
          {token ? <>
            <input type="hidden" name="token" value={token} />
            <Input label="New password" name="password" type="password" required minLength={8} autoComplete="new-password" />
            <Input label="Confirm password" name="confirm_password" type="password" required minLength={8} autoComplete="new-password" />
          </> : <Input label="Email" name="email" type="email" required autoComplete="email" />}
          {state?.error && <p role="alert" className="text-red-700">{state.error}</p>}
          <SubmitButton className="w-full">{token ? "Update password" : "Send reset link"}</SubmitButton>
        </form>}
        {token && state?.error && <a href="/reset-password" className="studio-text-link mt-4">Request a new reset link</a>}
        <LocalizedClientLink className="studio-text-link mt-8" href="/account">Back to sign in</LocalizedClientLink>
      </div>
    </main>
  )
}
