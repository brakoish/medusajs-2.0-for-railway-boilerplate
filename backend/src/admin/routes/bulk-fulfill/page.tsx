import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect, useCallback, useRef } from "react"

import ShippingProgress, { ProgressRow } from "../../components/shipping-progress"

export const config = defineRouteConfig({
  label: "Bulk Fulfill",
  icon: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.4" />
      <rect x="2" y="8.5" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
      <rect x="2" y="14" width="10" height="3" rx="1.5" fill="currentColor" />
      <circle cx="16" cy="15.5" r="3" fill="currentColor" />
      <path d="M14.5 15.5l1 1 2-2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
})

// ─── Types ───────────────────────────────────────────────────────────────────

type Order = {
  id: string
  display_id: number
  email: string
  created_at: string
  fulfillment_status: string
  shipping_address: {
    first_name?: string
    last_name?: string
    address_1?: string
    address_2?: string
    city?: string
    province?: string
    postal_code?: string
  }
  items: {
    id: string
    title: string
    variant_sku?: string
    quantity: number
    metadata?: Record<string, unknown> | null
    detail?: { fulfilled_quantity?: number }
  }[]
}

type Rate = {
  object_id: string
  carrier: string
  service: string
  service_token?: string
  carrier_account?: string
  amount: number
  currency: string
  estimated_days: number | null
}

type RateResult = {
  order_id: string
  display_id?: number
  name?: string
  address?: string
  weight_oz?: number
  rates: Rate[]
  error?: string
}

type FulfillResult = {
  order_id: string
  display_id?: number
  success: boolean
  tracking?: string
  label_url?: string
  batch_id?: string
  status?: string
  error?: string
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    maxWidth: 1100,
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 4px",
  },
  sub: { fontSize: 14, color: "#6b7280", margin: "0 0 28px" },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardHead: {
    padding: "14px 20px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardBody: { padding: "0" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: {
    padding: "10px 16px",
    textAlign: "left" as const,
    fontSize: 11,
    fontWeight: 600,
    color: "#9ca3af",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "12px 16px",
    fontSize: 13,
    color: "#374151",
    borderBottom: "1px solid #f9fafb",
    verticalAlign: "top" as const,
  },
  tdMuted: {
    padding: "12px 16px",
    fontSize: 12,
    color: "#9ca3af",
    borderBottom: "1px solid #f9fafb",
    verticalAlign: "top" as const,
  },
  check: { width: 16, height: 16, cursor: "pointer", accentColor: "#d4a22a" },
  btn: {
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  btnAmber: { background: "#d4a22a", color: "#000" },
  btnGray: { background: "#f3f4f6", color: "#374151" },
  btnDark: { background: "#111827", color: "#fff" },
  btnSm: {
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  select: {
    padding: "5px 10px",
    fontSize: 12,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
  },
  badge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  },
  row: { display: "flex", alignItems: "center", gap: 10 },
  green: { background: "#d1fae5", color: "#065f46" },
  red: { background: "#fee2e2", color: "#991b1b" },
  amber: { background: "#fef3c7", color: "#92400e" },
  spinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid #e5e7eb",
    borderTopColor: "#d4a22a",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BulkFulfillPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Step 2: rates
  const [step, setStep] = useState<"select" | "rates" | "done">("select")
  const [rateResults, setRateResults] = useState<RateResult[]>([])
  const [fetchingRates, setFetchingRates] = useState(false)
  const [selectedRates, setSelectedRates] = useState<Record<string, string>>({}) // order_id → rate object_id

  // Step 3: execute
  const [executing, setExecuting] = useState(false)
  const [fulfillResults, setFulfillResults] = useState<FulfillResult[]>([])

  const [progress, setProgress] = useState<ProgressRow[]>([])
  const [showDelivered, setShowDelivered] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const loadingQueue = useRef(false)
  const loadQueue = useCallback(async () => {
    if (loadingQueue.current) return
    loadingQueue.current = true
    try {
      const response = await fetch("/admin/bulk-fulfill/orders", { credentials: "include" })
      if (!response.ok) throw new Error(response.status === 401 ? "Session expired. Log in again." : "Could not refresh orders. Existing progress may be out of date.")
      const data = await response.json()
      setOrders(data.orders || [])
      setProgress(data.progress || [])
      setSelected((previous) => new Set([...previous].filter((id) => (data.orders || []).some((order: Order) => order.id === id))))
      setLoadError(null)
    } catch (error) { setLoadError((error as Error).message) }
    finally { setLoading(false); loadingQueue.current = false }
  }, [])
  useEffect(() => {
    void loadQueue()
    const timer = window.setInterval(() => void loadQueue(), 5000)
    return () => window.clearInterval(timer)
  }, [loadQueue])

  const toggleAll = useCallback(() => {
    if (selected.size === orders.length) setSelected(new Set())
    else setSelected(new Set(orders.map((o) => o.id)))
  }, [orders, selected.size])

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const fetchRates = async () => {
    setFetchingRates(true)
    setActionError(null)
    try {
      const res = await fetch("/admin/bulk-fulfill/rates", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_ids: Array.from(selected) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not fetch rates")
      const results: RateResult[] = data.results || []
      setRateResults(results)

      // Auto-select cheapest rate for each order
      const autoRates: Record<string, string> = {}
      results.forEach((r) => {
        if (r.rates.length > 0) autoRates[r.order_id] = r.rates[0].object_id
      })
      setSelectedRates(autoRates)
      setStep("rates")
    } catch (error) { setActionError((error as Error).message) } finally {
      setFetchingRates(false)
    }
  }

  const execute = async () => {
    if (executing) return
    setExecuting(true)
    setActionError(null)
    try {
      const items = rateResults
        .filter((r) => selectedRates[r.order_id])
        .map((r) => {
          const rate = r.rates.find((candidate) => candidate.object_id === selectedRates[r.order_id])
          return {
            order_id: r.order_id,
            rate_object_id: selectedRates[r.order_id],
            carrier_account: rate?.carrier_account,
            servicelevel_token: rate?.service_token,
            carrier: rate?.carrier,
            service: rate?.service,
          }
        })

      const res = await fetch("/admin/bulk-fulfill/execute", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })

      const data = await res.json()
      setFulfillResults(data.results || [])
      if (!res.ok) setActionError(data.error || "Some labels need review. Check shipping progress below.")
      setStep("done")
      await loadQueue()
    } catch (error) {
      setActionError("The purchase result could not be confirmed. Check shipping progress and refresh from Shippo before taking another action.")
      setStep("done")
      await loadQueue()
    } finally {
      setExecuting(false)
    }
  }

  const reset = () => {
    setStep("select")
    setSelected(new Set())
    setRateResults([])
    setSelectedRates({})
    setFulfillResults([])
    setActionError(null)
    void loadQueue()
  }

  const customColorSummary = (metadata?: Record<string, unknown> | null) => {
    const explicit = metadata?.custom_color_summary
    if (typeof explicit === "string" && explicit.trim()) {
      return explicit
    }

    const colors = metadata?.custom_colors as
      | Record<string, { name?: string; value?: string }>
      | undefined
    if (!colors) return ""

    const part = (name: string) =>
      [colors[name]?.name, colors[name]?.value ? `(${colors[name].value})` : ""]
        .filter(Boolean)
        .join(" ")

    return [
      ["Body", part("body")],
      ["Lid", part("lid")],
      ["Slider", part("slider")],
    ]
      .filter(([, value]) => value)
      .map(([name, value]) => `${name}: ${value}`)
      .join(", ")
  }

  const itemSummary = (order: Order) => {
    return order.items
      .map((i) => {
        const fulfilled = i.detail?.fulfilled_quantity ?? 0
        const qty = i.quantity - fulfilled
        const sku = i.variant_sku || i.title
        const custom = customColorSummary(i.metadata)
        return [`${qty}x ${sku}`, custom].filter(Boolean).join(" · ")
      })
      .join(", ")
  }

  const addrLine = (order: Order) => {
    const a = order.shipping_address
    return [[a.first_name, a.last_name].filter(Boolean).join(" "), a.address_1, a.address_2, `${a.city || ""}, ${a.province || ""} ${a.postal_code || ""}`.trim()].filter(Boolean).join(" · ")
  }

  const fmtAmount = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <h1 style={S.heading}>Bulk Fulfill</h1>
      <p style={S.sub}>Review orders, buy labels, and follow each shipment through delivery.</p>
      {actionError && <p role="alert" style={{ color: "#991b1b" }}>{actionError}</p>}
      {loadError && <p role="alert" style={{ color: "#991b1b" }}>{loadError}</p>}

      {/* ── STEP 1: SELECT ORDERS ── */}
      {step === "select" && (
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Ready for a label {!loading && `(${orders.length})`}</span>
            <div style={S.row}>
              {selected.size > 0 && <span style={{ ...S.badge, ...S.amber }}>{selected.size} selected</span>}
              <button
                style={{
                  ...S.btn,
                  ...S.btnAmber,
                  opacity: selected.size === 0 || fetchingRates ? 0.5 : 1,
                }}
                disabled={selected.size === 0 || fetchingRates}
                onClick={fetchRates}
              >
                {fetchingRates ? "Getting rates…" : `Get rates for ${selected.size || "selected"}`}
              </button>
            </div>
          </div>
          <div style={S.cardBody}>
            {loading ? (
              <div style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</div>
            ) : loadError ? (
              <div style={{ padding: 32, textAlign: "center", color: "#991b1b" }}>{loadError}</div>
            ) : orders.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No orders ready for a new label. Check shipping progress below for existing purchases.</div>
            ) : (
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 40 }}>
                      <input aria-label="Select all eligible orders" type="checkbox" style={S.check} checked={selected.size === orders.length && orders.length > 0} onChange={toggleAll} />
                    </th>
                    <th style={S.th}>Order</th>
                    <th style={S.th}>Customer + Address</th>
                    <th style={S.th}>Items</th>
                    <th style={S.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      style={{
                        background: selected.has(order.id) ? "#fffbeb" : "transparent",
                        cursor: "pointer",
                      }}
                      onClick={() => toggle(order.id)}
                    >
                      <td style={S.td} onClick={(e) => e.stopPropagation()}>
                        <input aria-label={`Select order ${order.display_id}`} type="checkbox" style={S.check} checked={selected.has(order.id)} onChange={() => toggle(order.id)} />
                      </td>
                      <td style={S.td}>
                        <span style={{ fontWeight: 600 }}>#{order.display_id}</span>
                      </td>
                      <td style={S.td}>
                        <div style={{ fontWeight: 500 }}>{[order.shipping_address?.first_name, order.shipping_address?.last_name].filter(Boolean).join(" ")}</div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginTop: 2,
                          }}
                        >
                          {order.shipping_address?.address_1}
                          {order.shipping_address?.address_2 ? ` ${order.shipping_address.address_2}` : ""}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {order.shipping_address?.city}, {order.shipping_address?.province} {order.shipping_address?.postal_code}
                        </div>
                      </td>
                      <td style={S.tdMuted}>{itemSummary(order)}</td>
                      <td style={S.tdMuted}>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: RATE SELECTION ── */}
      {step === "rates" && (
        <>
          <div style={{ ...S.row, marginBottom: 20 }}>
            <button style={{ ...S.btn, ...S.btnGray }} onClick={() => setStep("select")}>
              ← Back
            </button>
            <span style={{ fontSize: 14, color: "#6b7280" }}>Review rates and pick shipping for each order.</span>
            <div style={{ flex: 1 }} />
            <button
              style={{
                ...S.btn,
                ...S.btnDark,
                opacity: Object.keys(selectedRates).length === 0 || executing ? 0.5 : 1,
              }}
              disabled={Object.keys(selectedRates).length === 0 || executing}
              onClick={execute}
            >
              {executing ? (
                <span style={S.row}>
                  <span style={S.spinner} /> Buying labels…
                </span>
              ) : (
                `Buy ${Object.keys(selectedRates).length} label${Object.keys(selectedRates).length !== 1 ? "s" : ""}`
              )}
            </button>
          </div>

          {rateResults.map((result) => {
            const order = orders.find((o) => o.id === result.order_id)
            return (
              <div key={result.order_id} style={S.card}>
                <div style={S.cardHead}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>#{result.display_id}</span>
                    <span style={{ fontSize: 13, color: "#6b7280", marginLeft: 12 }}>{result.name}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>{result.address}</span>
                  </div>
                  {result.weight_oz && <span style={{ fontSize: 12, color: "#9ca3af" }}>{result.weight_oz} oz</span>}
                </div>
                {result.error ? (
                  <div
                    style={{
                      padding: "12px 20px",
                      fontSize: 13,
                      color: "#dc2626",
                    }}
                  >
                    Rate error: {result.error}
                  </div>
                ) : (
                  <div style={{ padding: "12px 20px" }}>
                    <div style={{ ...S.row, flexWrap: "wrap" as const, gap: 8 }}>
                      {order && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginRight: 8,
                          }}
                        >
                          {itemSummary(order)}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap" as const,
                        gap: 8,
                        marginTop: 10,
                      }}
                    >
                      {result.rates.map((rate) => {
                        const picked = selectedRates[result.order_id] === rate.object_id
                        return (
                          <button
                            key={rate.object_id}
                            style={{
                              padding: "8px 14px",
                              fontSize: 12,
                              fontWeight: picked ? 600 : 400,
                              borderRadius: 8,
                              border: picked ? "2px solid #d4a22a" : "1px solid #e5e7eb",
                              background: picked ? "#fffbeb" : "#fff",
                              color: "#111827",
                              cursor: "pointer",
                              textAlign: "left" as const,
                            }}
                            onClick={() =>
                              setSelectedRates((prev) => ({
                                ...prev,
                                [result.order_id]: rate.object_id,
                              }))
                            }
                          >
                            <div>
                              {rate.carrier} {rate.service}
                            </div>
                            <div style={{ fontWeight: 700, marginTop: 2 }}>{fmtAmount(rate.amount)}</div>
                            {rate.estimated_days != null && (
                              <div
                                style={{
                                  color: "#9ca3af",
                                  fontSize: 11,
                                  marginTop: 1,
                                }}
                              >
                                {rate.estimated_days}d
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}

      {step === "done" && <div style={S.card}>
        <div style={S.cardHead}><strong>Purchase results — follow progress below</strong><button style={{ ...S.btn, ...S.btnAmber }} onClick={reset}>Back to orders</button></div>
        {fulfillResults.filter((result) => !result.success).map((result) => <p role="alert" key={result.order_id} style={{ padding: "0 20px", color: "#991b1b" }}>Order #{result.display_id || result.order_id}: {result.error}</p>)}
      </div>}
      <section style={S.card} aria-label="Shipping progress">
        <div style={S.cardHead}><strong>Shipping progress</strong><label style={{ fontSize: 13 }}><input type="checkbox" checked={showDelivered} onChange={(event) => setShowDelivered(event.target.checked)} /> Include delivered and canceled</label></div>
        <ShippingProgress rows={progress.filter((row) => showDelivered || !["delivered", "canceled"].includes(row.stage))} onRefresh={loadQueue} />
      </section>
    </div>
  )
}
