import { useEffect, useState } from "react"
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

type RatesResponse = {
  to: string
  weight_oz: number
  rates: Rate[]
  error?: string
}

// Which service tokens map to our Medusa shipping options
const MEDUSA_OPTIONS: Record<string, string> = {
  usps_ground_advantage: "Standard Shipping",
  usps_priority: "Priority Shipping",
}

// Carrier logo colors (just a dot accent)
const CARRIER_COLOR: Record<string, string> = {
  USPS: "#004B87",
  UPS: "#FFB500",
  FedEx: "#4D148C",
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

const OrderRatesWidget = () => {
  const orderId = (() => {
    const m = window.location.pathname.match(/\/orders\/(order_[^/]+)/)
    return m ? m[1] : null
  })()

  const [data, setData] = useState<RatesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRates = () => {
    if (!orderId || loading) return
    setLoading(true)
    setError(null)
    fetch(`/admin/orders/${orderId}/rates`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: RatesResponse) => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch((e: Error) => {
        setError(e.message)
        setLoading(false)
      })
  }

  return (
    <div
      style={{
        background: "#18181b",
        border: "1px solid #27272a",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: data || error ? "1px solid #27272a" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#fafafa" }}>
            Shipping Rates
          </span>
          {data && (
            <span
              style={{
                fontSize: 11,
                color: "#71717a",
                background: "#27272a",
                borderRadius: 6,
                padding: "2px 8px",
              }}
            >
              {data.to} · {data.weight_oz} oz
            </span>
          )}
        </div>
        <button
          onClick={fetchRates}
          disabled={loading}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: loading ? "#52525b" : "#d4a22a",
            background: "transparent",
            border: "1px solid " + (loading ? "#3f3f46" : "#d4a22a44"),
            borderRadius: 6,
            padding: "5px 12px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {loading ? "Fetching…" : data ? "Refresh" : "Get Rates"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "12px 20px", color: "#f87171", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Rates table */}
      {data && !error && (
        <div>
          {data.rates.map((r, i) => {
            const medusaLabel = MEDUSA_OPTIONS[r.service_token]
            const dot = CARRIER_COLOR[r.carrier] ?? "#52525b"
            const isLast = i === data.rates.length - 1
            return (
              <div
                key={r.object_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "11px 20px",
                  borderBottom: isLast ? "none" : "1px solid #27272a",
                  background: medusaLabel ? "#1c1a0e" : "transparent",
                }}
              >
                {/* Carrier dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: dot,
                    marginRight: 12,
                    flexShrink: 0,
                  }}
                />

                {/* Carrier + service */}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: "#fafafa", fontWeight: 500 }}>
                    {r.carrier}
                  </span>
                  <span style={{ fontSize: 13, color: "#71717a", marginLeft: 6 }}>
                    {r.service}
                  </span>
                </div>

                {/* Est. days */}
                <div
                  style={{
                    fontSize: 12,
                    color: "#52525b",
                    marginRight: 20,
                    minWidth: 40,
                    textAlign: "right",
                  }}
                >
                  {r.estimated_days != null ? `${r.estimated_days}d` : ""}
                </div>

                {/* Price */}
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fafafa",
                    minWidth: 52,
                    textAlign: "right",
                    marginRight: medusaLabel ? 12 : 0,
                  }}
                >
                  ${r.amount.toFixed(2)}
                </div>

                {/* Medusa option badge */}
                {medusaLabel && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#d4a22a",
                      background: "#d4a22a18",
                      border: "1px solid #d4a22a33",
                      borderRadius: 5,
                      padding: "2px 8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {medusaLabel}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrderRatesWidget
