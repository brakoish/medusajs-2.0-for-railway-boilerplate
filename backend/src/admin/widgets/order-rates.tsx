import { useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"

type Rate = {
  object_id: string
  carrier: string
  service: string
  service_token: string
  amount: number
  currency: string
  estimated_days: number | null
}

type RatesResp = {
  to: string
  weight_oz: number
  rates: Rate[]
  error?: string
}

type FulfillResp = {
  fulfillment_id?: string
  label_url?: string
  tracking_number?: string
  tracking_url?: string
  carrier?: string
  service?: string
  error?: string
}

const CARRIER_DOT: Record<string, string> = {
  USPS: "#004B87",
  UPS:  "#FFB500",
  FedEx:"#4D148C",
}

const S = {
  wrap: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    fontFamily: "Inter, sans-serif",
  } as React.CSSProperties,
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #27272a",
  } as React.CSSProperties,
  title: { fontSize: 15, fontWeight: 600, color: "#fafafa" } as React.CSSProperties,
  pill: {
    fontSize: 11, color: "#71717a", background: "#27272a",
    borderRadius: 6, padding: "2px 8px", marginLeft: 8,
  } as React.CSSProperties,
  btn: (active: boolean, disabled: boolean) => ({
    fontSize: 12, fontWeight: 500,
    color: disabled ? "#52525b" : active ? "#000" : "#d4a22a",
    background: active ? "#d4a22a" : "transparent",
    border: "1px solid " + (disabled ? "#3f3f46" : "#d4a22a44"),
    borderRadius: 6, padding: "5px 14px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s",
  } as React.CSSProperties),
  row: (selected: boolean, last: boolean) => ({
    display: "flex", alignItems: "center",
    padding: "11px 20px",
    borderBottom: last ? "none" : "1px solid #27272a",
    background: selected ? "#1f1f1f" : "transparent",
    cursor: "pointer",
    transition: "background 0.1s",
  } as React.CSSProperties),
  dot: (color: string) => ({
    width: 8, height: 8, borderRadius: "50%",
    background: color, marginRight: 12, flexShrink: 0,
  } as React.CSSProperties),
  radio: (selected: boolean) => ({
    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
    border: "2px solid " + (selected ? "#d4a22a" : "#52525b"),
    background: selected ? "#d4a22a" : "transparent",
    marginLeft: 12, transition: "all 0.15s",
  } as React.CSSProperties),
  badge: {
    fontSize: 11, fontWeight: 500,
    color: "#d4a22a", background: "#d4a22a18",
    border: "1px solid #d4a22a33",
    borderRadius: 5, padding: "2px 7px", whiteSpace: "nowrap",
  } as React.CSSProperties,
  success: {
    display: "flex", flexDirection: "column", gap: 6,
    padding: "14px 20px", borderTop: "1px solid #27272a",
  } as React.CSSProperties,
}

export const config = defineWidgetConfig({ zone: "order.details.before" })

export default function OrderRatesWidget() {
  const orderId = window.location.pathname.match(/\/orders\/(order_[^/]+)/)?.[1] ?? null

  const [rates,     setRates]     = useState<Rate[] | null>(null)
  const [meta,      setMeta]      = useState<{ to: string; weight_oz: number } | null>(null)
  const [selected,  setSelected]  = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [fulfilling,setFulfilling] = useState(false)
  const [done,      setDone]      = useState<FulfillResp | null>(null)
  const [err,       setErr]       = useState<string | null>(null)

  const fetchRates = async () => {
    if (!orderId || loading) return
    setLoading(true); setErr(null); setDone(null); setSelected(null)
    const r = await fetch(`/admin/orders/${orderId}/rates`, { credentials: "include" })
    const d: RatesResp = await r.json()
    if (d.error) { setErr(d.error) }
    else { setRates(d.rates); setMeta({ to: d.to, weight_oz: d.weight_oz }) }
    setLoading(false)
  }

  const fulfill = async () => {
    if (!orderId || !selected || fulfilling) return
    setFulfilling(true); setErr(null)
    const r = await fetch(`/admin/orders/${orderId}/fulfill`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rate_object_id: selected }),
    })
    const d: FulfillResp = await r.json()
    if (d.error) setErr(d.error)
    else setDone(d)
    setFulfilling(false)
  }

  const showRates = rates && rates.length > 0

  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.title}>Shipping Rates</span>
          {meta && <span style={S.pill}>{meta.to} · {meta.weight_oz} oz</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {selected && !done && (
            <button onClick={fulfill} disabled={fulfilling} style={S.btn(true, fulfilling)}>
              {fulfilling ? "Buying label…" : "Fulfill →"}
            </button>
          )}
          <button onClick={fetchRates} disabled={loading} style={S.btn(false, loading)}>
            {loading ? "Fetching…" : rates ? "Refresh" : "Get Rates"}
          </button>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div style={{ padding: "12px 20px", color: "#f87171", fontSize: 13 }}>
          {err}
        </div>
      )}

      {/* Done */}
      {done && (
        <div style={S.success}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>✓ Fulfilled</span>
            <span style={{ fontSize: 12, color: "#71717a" }}>{done.carrier} · {done.service}</span>
          </div>
          {done.tracking_number && (
            <div style={{ fontSize: 12, color: "#a1a1aa" }}>
              Tracking:{" "}
              {done.tracking_url
                ? <a href={done.tracking_url} target="_blank" rel="noreferrer" style={{ color: "#d4a22a" }}>{done.tracking_number}</a>
                : <span style={{ color: "#fafafa" }}>{done.tracking_number}</span>
              }
            </div>
          )}
          {done.label_url && (
            <div>
              <a href={done.label_url} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: "#d4a22a", textDecoration: "underline" }}>
                Print Label ↗
              </a>
            </div>
          )}
        </div>
      )}

      {/* Rates */}
      {showRates && !done && rates.map((r, i) => {
        const dot   = CARRIER_DOT[r.carrier] ?? "#52525b"
        const isSel = selected === r.object_id
        const last  = i === rates.length - 1

        return (
          <div key={r.object_id} style={S.row(isSel, last)} onClick={() => setSelected(r.object_id)}>
            <div style={S.dot(dot)} />

            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, color: "#fafafa", fontWeight: 500 }}>{r.carrier}</span>
              <span style={{ fontSize: 13, color: "#71717a", marginLeft: 6 }}>{r.service}</span>
            </div>

            {r.estimated_days != null && (
              <div style={{ fontSize: 12, color: "#52525b", marginRight: 16, minWidth: 28, textAlign: "right" }}>
                {r.estimated_days}d
              </div>
            )}

            <div style={{ fontSize: 14, fontWeight: 600, color: "#fafafa", minWidth: 52, textAlign: "right" }}>
              ${r.amount.toFixed(2)}
            </div>

            <div style={{ marginLeft: 12, minWidth: 100, display: "flex", justifyContent: "flex-end" }}>
              {/* spacer so prices align when no badge */}
            </div>

            <div style={S.radio(isSel)} />
          </div>
        )
      })}
    </div>
  )
}
