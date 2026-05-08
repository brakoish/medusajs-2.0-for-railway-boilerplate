import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Page not found · Dab Pal",
  description: "We couldn't find that page. Head back home or jump to the shop.",
}

export default function NotFound() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center text-center px-6">
      <Link
        href="/"
        className="text-sm font-semibold uppercase tracking-[0.2em] mb-10"
        style={{ color: "var(--fg-interactive)" }}
      >
        Dab Pal
      </Link>
      <span
        className="text-xs uppercase tracking-[0.2em] mb-4"
        style={{ color: "var(--fg-interactive)" }}
      >
        404
      </span>
      <h1 className="text-3xl small:text-5xl font-semibold text-ui-fg-base mb-4">
        We can't find that page.
      </h1>
      <p className="text-base text-ui-fg-subtle max-w-md mb-8">
        The link may be old, or the page moved. Everything Dab Pal lives on
        one page now.
      </p>
      <div className="flex flex-col small:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition"
        >
          Back to home
        </Link>
        <Link
          href="/#shop"
          className="inline-flex items-center justify-center rounded-md border border-black/20 px-6 py-3 text-sm font-medium text-ui-fg-base hover:border-black transition"
        >
          Shop the kit
        </Link>
      </div>
    </div>
  )
}
