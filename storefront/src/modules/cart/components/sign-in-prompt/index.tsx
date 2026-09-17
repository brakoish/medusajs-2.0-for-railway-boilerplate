import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-sm">
      Have an account?
      <LocalizedClientLink href="/account" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4" data-testid="sign-in-button">
        Sign in
      </LocalizedClientLink>
      <span className="text-ui-fg-subtle">or continue as a guest.</span>
    </p>
  )
}

export default SignInPrompt
