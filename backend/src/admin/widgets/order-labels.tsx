import { useEffect, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"

type LabelInfo = {
  fulfillment_id: string
  tracking_number: string | null
  tracking_url: string | null
  label_url: string | null
  carrier: string | null
  service: string | null
  tracking_status: TrackingStatus | null
  delivered_at?: string | null
  created_at: string
}

type TrackingStatus = {
  carrier?: string
  tracking_number?: string
  status?: string
  status_details?: string
  status_date?: string
  location?: {
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  updated_at?: string
}

const trackingCopy = (label: LabelInfo) => {
  if (label.delivered_at) return "Delivered"

  const status = label.tracking_status?.status || ""
  const details = label.tracking_status?.status_details || ""
  const combined = `${status} ${details}`.toLowerCase()

  if (combined.includes("out for delivery")) return "Out for delivery"
  if (status === "DELIVERED") return "Delivered"
  if (status === "TRANSIT") return "In transit"
  if (status === "PRE_TRANSIT") return "Pre-transit"
  if (status === "FAILURE") return "Delivery issue"
  if (status === "RETURNED") return "Returned"
  if (status === "UNKNOWN") return "Unknown"
  return status ? status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "Label created"
}

const trackingColor = (label: LabelInfo) => {
  const copy = trackingCopy(label)
  if (copy === "Delivered") return "#4ade80"
  if (copy === "Delivery issue" || copy === "Returned") return "#f87171"
  if (copy === "Out for delivery") return "#d4a22a"
  return "#60a5fa"
}

const trackingLocation = (status: TrackingStatus | null) => {
  const loc = status?.location
  if (!loc) return null
  return [loc.city, loc.state, loc.zip].filter(Boolean).join(", ")
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
  body: { padding: "14px 20px" } as React.CSSProperties,
  muted: { fontSize: 13, color: "#71717a" } as React.CSSProperties,
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    border: "1px solid #27272a",
    borderRadius: 8,
    marginBottom: 8,
  } as React.CSSProperties,
  badge: {
    fontSize: 11, fontWeight: 500,
    color: "#4ade80", background: "#4ade8018",
    border: "1px solid #4ade8033",
    borderRadius: 5, padding: "2px 7px",
  } as React.CSSProperties,
  service: { fontSize: 12, color: "#71717a", marginLeft: 8 } as React.CSSProperties,
  tracking: { fontSize: 12, color: "#a1a1aa", marginTop: 4 } as React.CSSProperties,
  trackLink: { color: "#d4a22a" } as React.CSSProperties,
  status: (color: string) => ({
    fontSize: 11,
    fontWeight: 600,
    color,
    background: `${color}18`,
    border: `1px solid ${color}33`,
    borderRadius: 5,
    padding: "2px 7px",
    marginLeft: 8,
  } as React.CSSProperties),
  scan: { fontSize: 12, color: "#a1a1aa", marginTop: 4, maxWidth: 440 } as React.CSSProperties,
  btn: {
    fontSize: 12, fontWeight: 500,
    color: "#000",
    background: "#d4a22a",
    border: "none",
    borderRadius: 6, padding: "5px 14px",
    cursor: "pointer",
  } as React.CSSProperties,
}

const OrderLabelsWidget = () => {
  const orderId = window.location.pathname.match(/\/orders\/(order_[^/]+)/)?.[1] ?? null

  const [labels, setLabels] = useState<LabelInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    setLoading(true)
    fetch(`/admin/orders/${orderId}/labels`, { credentials: "include" })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((data: { labels?: LabelInfo[] }) => { setLabels(data.labels || []); setLoading(false) })
      .catch((e: Error) => { setError(e.message); setLoading(false) })
  }, [orderId])

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>Shipping Labels</span>
      </div>
      <div style={S.body}>
        {loading && <p style={S.muted}>Loading...</p>}
        {error && <p style={{ ...S.muted, color: "#f87171" }}>Error: {error}</p>}
        {!loading && !error && labels.length === 0 && (
          <p style={S.muted}>No labels found. Fulfill the order to generate a shipping label.</p>
        )}
        {labels.map((label) => (
          <div key={label.fulfillment_id} style={S.row}>
            <div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={S.badge}>{label.carrier || "Carrier"}</span>
                <span style={S.status(trackingColor(label))}>{trackingCopy(label)}</span>
                {label.service && <span style={S.service}>{label.service}</span>}
              </div>
              {label.tracking_number && (
                <div style={S.tracking}>
                  Tracking:{" "}
                  {label.tracking_url
                    ? <a href={label.tracking_url} target="_blank" rel="noreferrer" style={S.trackLink}>{label.tracking_number}</a>
                    : <span style={{ color: "#fafafa" }}>{label.tracking_number}</span>
                  }
                </div>
              )}
              {label.tracking_status?.status_details && (
                <div style={S.scan}>
                  {label.tracking_status.status_details}
                  {trackingLocation(label.tracking_status) && ` · ${trackingLocation(label.tracking_status)}`}
                </div>
              )}
            </div>
            {label.label_url && (
              <button style={S.btn} onClick={() => window.open(label.label_url!, "_blank")}>
                Print Label ↗
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({ zone: "order.details.after" })
export default OrderLabelsWidget
