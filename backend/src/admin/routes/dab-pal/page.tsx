import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useRef, useState } from "react"
import type { describeOperation } from "../../../lib/dabpal-operations"
import { isActiveOperation } from "../../../lib/dabpal-order-state"
import { adminRequest, buttonClass, DabPalLayout, inputClass, panelClass } from "../../components/dabpal-layout"

type Order = ReturnType<typeof describeOperation>
const names: Record<string, string> = { to_make: "To make", printing: "Printing", ready_to_pack: "Ready to pack", shipping: "Shipping", awaiting_payment: "Awaiting payment", refunded: "Refunded", canceled: "Canceled" }
const shipmentNames: Record<string, string> = { label_ready: "Label ready", in_transit: "In transit", delivered: "Delivered", needs_attention: "Needs attention", processing: "Label processing", canceled: "Canceled" }
export const config = defineRouteConfig({ label: "Dab Pal Orders" })
export default function DabPalOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("active")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Order | null>(null)
  const [stage, setStage] = useState("to_make")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const sheet = useRef<HTMLElement>(null)
  const drafts = useRef(new Map<string, { stage: string; note: string }>())
  const dirty = !!selected && (note !== selected.production.note || stage !== selected.production.stage) || [...drafts.current].some(([id, draft]) => { const order = orders.find(o => o.id === id); return order && (draft.note !== order.production.note || draft.stage !== order.production.stage) })
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = "" } }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])
  useEffect(() => { if (selected && window.innerWidth < 1280) sheet.current?.scrollIntoView({ behavior: "smooth", block: "start" }) }, [selected?.id])
  const load = async () => {
    if (saving) return
    if (selected && (note !== selected.production.note || stage !== selected.production.stage) && !window.confirm("Reload saved production details and discard this order's unsaved changes?")) return
    setLoading(true); setError("")
    try {
      const data = await adminRequest("/admin/dab-pal/operations"); setOrders(data.orders)
      const requested = new URLSearchParams(window.location.search).get("order")
      const selectedId = selected?.id || requested
      if (selectedId) { const order = data.orders.find((o: Order) => o.id === selectedId); if (order) { drafts.current.delete(order.id); open(order, true) } else setSelected(null) }
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  function open(order: Order, refreshed = false) {
    if (saving) return
    if (!refreshed && selected) drafts.current.set(selected.id, { stage, note })
    const draft = drafts.current.get(order.id)
    setSelected(order); setStage(draft?.stage || order.production.stage); setNote(draft?.note ?? order.production.note); setMessage(""); setError("")
  }
  async function save() {
    if (!selected) return
    setSaving(true); setError("")
    try {
      const data = await adminRequest(`/admin/dab-pal/operations/${selected.id}`, { stage, note, version: selected.production.version })
      const updated = { ...selected, stage, production: data.production }
      drafts.current.delete(selected.id)
      setOrders(current => current.map(o => o.id === selected.id ? updated : o)); setSelected(updated); setMessage("Production updated.")
    } catch (e) { setError((e as Error).message) } finally { setSaving(false) }
  }
  const visible = orders.filter(o => (filter === "all" || filter === "active" && isActiveOperation(o) || filter === o.stage || filter === "attention" && o.shipments.some(s => s.stage === "needs_attention" || s.email_status === "needs_attention")) && `${o.id} ${o.display_id} ${o.customer} ${o.items.map((i: any) => i.sku).join(" ")}`.toLowerCase().includes(search.toLowerCase()))
  return <DabPalLayout title="Orders & production" description="See what needs making, save the build instructions, and follow each order through packing and shipping. Payment and carrier status stay separate from production.">
    <style>{`@media print { body * { visibility: hidden !important; } .dabpal-build-sheet, .dabpal-build-sheet * { visibility: visible !important; } .dabpal-build-sheet { position: absolute; inset: 0; color: #111 !important; background: #fff !important; padding: 24px; } .dabpal-build-sheet button { display: none !important; } }`}</style>
    {error && <p role="alert" className="rounded-lg border border-ui-border-error p-4 text-ui-fg-error">{error}</p>}
    <div className="flex flex-wrap gap-3"><label className="min-w-48 flex-1"><span className="mb-1 block text-sm">Find an order</span><input className={inputClass} value={search} onChange={e => setSearch(e.target.value)} placeholder="Order number, customer, or SKU" /></label><label><span className="mb-1 block text-sm">Show</span><select className={inputClass} value={filter} onChange={e => setFilter(e.target.value)}><option value="active">Active orders</option>{Object.entries(names).map(([id, name]) => <option key={id} value={id}>{name}</option>)}<option value="attention">Needs attention</option><option value="all">All orders</option></select></label><button className={`${buttonClass} self-end`} disabled={loading || saving} onClick={load}>{loading ? "Refreshing…" : "Refresh"}</button></div>
    {loading ? <p role="status">Loading orders…</p> : <div className="grid items-start gap-6 xl:grid-cols-[1.2fr_1fr]">
      <section aria-label="Orders" className="space-y-3">
        <p className="text-sm text-ui-fg-subtle">{visible.length} orders</p>
        {!visible.length && <div className={panelClass}>No orders match this view. Try another stage or clear your search.</div>}
        {visible.map(order => <article key={order.id} className={`${panelClass} ${selected?.id === order.id ? "ring-2 ring-ui-border-interactive" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">#{order.display_id} · {order.customer}</h2><span className="rounded-full bg-ui-bg-subtle px-3 py-1 text-xs">{names[order.stage]}</span></div>
          <p className="mt-1 text-xs text-ui-fg-subtle">{new Date(order.created_at).toLocaleDateString()} · {order.paid ? order.captured === 0 ? "No payment due" : order.refunded >= order.captured ? "Payment refunded" : "Payment captured" : order.captured > 0 ? "Partially paid" : order.authorized > 0 ? "Payment authorized, awaiting capture" : "Awaiting payment"}</p>
          <ul className="my-4 space-y-1 text-sm">{order.items.map((item: any) => <li key={item.id}>{item.quantity} × {item.sku || item.title}<span className="block text-ui-fg-subtle">{item.metadata?.custom_color_summary || item.variant_title}</span></li>)}</ul>
          {order.shipments.map(shipment => <div key={shipment.fulfillment_id} className="my-3 border-t border-ui-border-base pt-3 text-sm"><strong>{shipmentNames[shipment.stage]}</strong><p className="mt-1 text-ui-fg-subtle">{shipment.message}</p><p className="mt-1">Tracking email: {shipment.email_status.replaceAll("_", " ")}</p></div>)}
          <div className="flex flex-wrap items-center gap-4"><button className={buttonClass} disabled={saving} onClick={() => open(order)}>Build sheet & production</button><a className="text-sm underline" href={`/app/orders/${order.id}`}>Order details</a>{order.shipments.length > 0 && <a className="text-sm underline" href="/app/bulk-fulfill">Labels & tracking</a>}</div>
        </article>)}
      </section>
      <aside ref={sheet} className="space-y-4 xl:sticky xl:top-4" aria-label="Selected order">
        {!selected ? <div className={panelClass}><h2 className="font-semibold">Choose an order</h2><p className="mt-2 text-sm text-ui-fg-subtle">Open its build sheet to review colors, kit counts and production notes.</p></div> : <>
          <BuildSheet order={selected} />
          <div className={`${panelClass} space-y-4`}>
            <h2 className="font-semibold">Production</h2>
            {error && <p role="alert" className="text-sm text-ui-fg-error">{error} <button onClick={load} className="underline">Reload saved details</button></p>}
            {!["to_make", "printing", "ready_to_pack"].includes(selected.stage) ? <p className="text-sm text-ui-fg-subtle">Production updates are available for paid orders that still have items to make.</p> : <>
              <label className="block space-y-2"><span className="text-sm">Stage</span><select className={inputClass} value={stage} onChange={e => setStage(e.target.value)} disabled={saving}>{["to_make", "printing", "ready_to_pack"].map(value => <option key={value} value={value}>{names[value]}</option>)}</select></label>
              <label className="block space-y-2"><span className="text-sm">Production notes</span><textarea className={inputClass} rows={4} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} disabled={saving} /></label>
              <button className={buttonClass} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save production"}</button>
              {stage === "ready_to_pack" && <a className="ml-4 text-sm underline" href="/app/bulk-fulfill">Continue to labels</a>}
            </>}
            {message && <p role="status" className="text-sm">{message}</p>}
          </div>
        </>}
      </aside>
    </div>}
  </DabPalLayout>
}

function BuildSheet({ order }: { order: Order }) {
  return <section className={`${panelClass} dabpal-build-sheet space-y-5`} aria-label={`Build sheet for order ${order.display_id}`}>
    <header className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide">Dab Pal · Build sheet</p><h2 className="mt-2 text-xl font-semibold">Order #{order.display_id}</h2><p className="text-sm">{order.customer}</p></div><button className="min-h-11 text-sm underline" onClick={() => window.print()}>Print</button></header>
    {order.items.map((item: any) => { const pack = /(?:-(3|6)$|-(3|6)-(?:BLK|WHT)$)/.exec(item.sku || "")?.slice(1).find(Boolean) || "1"; return <div key={item.id} className="space-y-3 border-t border-ui-border-base pt-4"><h3 className="font-semibold">{item.sku || item.title}</h3><p className="text-sm">{item.quantity} × {pack === "1" ? "single" : `${pack}-pack`} · {item.quantity * Number(pack)} complete kits · {item.remaining * Number(pack)} kits remaining ({item.remaining} {pack === "1" ? "singles" : "packs"})</p>
      {item.metadata?.custom_colors ? <dl className="space-y-2">{["body", "lid", "slider"].map(part => { const color = item.metadata.custom_colors[part]; return <div key={part} className="flex items-center gap-3 text-sm"><dt className="w-14 capitalize">{part}</dt><dd className="flex items-center gap-2"><span className="h-5 w-5 rounded-full border border-ui-border-base" style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(color?.value) ? color.value : "transparent" }} />{color?.name || "Missing color"} {color?.value || ""}</dd></div> })}</dl> : <p className="text-sm">{item.metadata?.custom_color_summary || (/WHT/.test(item.sku || "") ? "Marble" : /BLK/.test(item.sku || "") ? "Slate" : item.variant_title) || "Confirm finish in order details."}</p>}
      <p className="text-sm text-ui-fg-subtle">Per kit: case, slider, empty 1 oz bottle. No swabs or alcohol.</p>
    </div> })}
    {order.production.note && <div className="border-t border-ui-border-base pt-4"><h3 className="font-semibold">Production notes</h3><p className="mt-2 whitespace-pre-wrap text-sm">{order.production.note}</p></div>}
  </section>
}
