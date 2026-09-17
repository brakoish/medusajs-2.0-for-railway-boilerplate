import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import type { operationsSummary } from "../../../lib/dabpal-operations"
import { adminRequest, buttonClass, DabPalLayout, panelClass } from "../../components/dabpal-layout"
type Summary = ReturnType<typeof operationsSummary>
export const config = defineRouteConfig({ label: "Reports" })
export default function Reports() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  async function load() {
    setLoading(true); setError("")
    try { setSummary((await adminRequest("/admin/dab-pal/operations")).summary) }
    catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  const money = (amount: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
  return <DabPalLayout title="Reports" description="All-time payments and order progress. Payment figures include shipping and tax; net payments are captured payments minus recorded refunds, not profit.">
    <button className={buttonClass} disabled={loading} onClick={load}>{loading ? "Refreshing…" : "Refresh reports"}</button>
    {error && <p role="alert" className="text-ui-fg-error">{error}</p>}
    {!summary ? <p role="status">{loading ? "Loading reports…" : "Reports unavailable."}</p> : <>
      {Object.entries(summary.currencies).map(([currency, totals]) => <section key={currency} aria-label={`${currency.toUpperCase()} payments`}><h2 className="mb-3 text-lg font-semibold">{currency.toUpperCase()} payments</h2><div className="grid gap-4 md:grid-cols-3">{[["Captured payments", totals.captured], ["Refunds", totals.refunded], ["Net payments", totals.net]].map(([label, amount]) => <div key={label} className={panelClass}><h3 className="text-sm text-ui-fg-subtle">{label}</h3><p className="mt-2 text-3xl font-semibold">{money(Number(amount), currency)}</p></div>)}</div></section>)}
      {!Object.keys(summary.currencies).length && <p>No orders yet.</p>}
      <section><h2 className="mb-3 text-lg font-semibold">Order progress</h2><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[["Orders", summary.orders], ["Awaiting payment", summary.awaiting_payment], ["To make", summary.to_make], ["Printing", summary.printing], ["Ready to pack", summary.ready_to_pack], ["With carrier / delivered", summary.shipped_orders], ["Needs attention", summary.needs_attention], ["Canceled", summary.canceled]].map(([label, value]) => <div key={label} className={panelClass}><h3 className="text-sm text-ui-fg-subtle">{label}</h3><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div></section>
      <p className="text-sm leading-6 text-ui-fg-subtle">All non-draft orders are included across every page. Carrier progress uses shipment tracking. Labels awaiting a carrier scan are not counted as shipped. These groups can overlap and should not be added together.</p>
    </>}
  </DabPalLayout>
}
