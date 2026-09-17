import { ReactNode } from "react"

export const inputClass = "w-full min-h-11 rounded-lg border border-ui-border-base bg-ui-bg-field px-3 py-2 text-ui-fg-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-ui-border-interactive"
export const buttonClass = "inline-flex min-h-11 items-center justify-center rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-medium text-ui-bg-base disabled:opacity-50"
export const panelClass = "rounded-xl border border-ui-border-base bg-ui-bg-base p-5 shadow-elevation-card-rest"
export async function adminRequest(path: string, body?: unknown) {
  const response = await fetch(path, { credentials: "include", ...(body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || "Could not complete this request. Please try again.")
  return data
}
export function DabPalLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="mx-auto max-w-7xl space-y-6 p-4 text-ui-fg-base sm:p-8">
    <DabPalNav />
    <header><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-ui-fg-subtle">{description}</p></header>
    {children}
  </div>
}
export function DabPalNav() {
  return <nav aria-label="Dab Pal workspace" className="mb-6 flex flex-wrap gap-x-6 gap-y-3 border-b border-ui-border-base pb-4 text-sm">
      <a href="/app/dab-pal" className="underline underline-offset-4">Orders & production</a>
      <a href="/app/dab-pal-products" className="underline underline-offset-4">Product Studio</a>
      <a href="/app/analytics" className="underline underline-offset-4">Reports</a>
      <a href="/app/bulk-fulfill" className="underline underline-offset-4">Labels & tracking</a>
      <a href="/app/email-studio" className="underline underline-offset-4">Email history</a>
    </nav>
}
