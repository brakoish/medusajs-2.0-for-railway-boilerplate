"use client"

import { useRouter } from "next/navigation"

export default function RecoveryPanel({ message }: { message: string }) {
  const router = useRouter()
  return <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-900">
    <p>{message}</p>
    <div className="mt-3 flex flex-wrap gap-4">
      <button type="button" className="underline" onClick={() => router.refresh()}>Try again</button>
      <a className="underline" href="/cart">Back to cart</a>
      <a className="underline" href="mailto:hello@thedabpal.com">Email for help</a>
    </div>
  </div>
}
