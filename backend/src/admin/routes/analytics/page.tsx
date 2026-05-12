import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"

export const config = defineRouteConfig({
  label: "Analytics",
  icon: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="10" width="3" height="8" rx="1" fill="currentColor" opacity="0.4"/>
      <rect x="7" y="6" width="3" height="12" rx="1" fill="currentColor" opacity="0.7"/>
      <rect x="12" y="2" width="3" height="16" rx="1" fill="currentColor"/>
      <path d="M3.5 10 L8.5 6 L13.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
})

type OrderSummary = {
  total_orders: number
  total_revenue: number
  pending: number
  fulfilled: number
  canceled: number
  recent: { id: string; display_id: number; status: string; total: number; created_at: string; customer_name: string }[]
}

const S = {
  page: { padding: 32, maxWidth: 1100, margin: "0 auto", fontFamily: "Inter, sans-serif" } as React.CSSProperties,
  heading: { fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 4 } as React.CSSProperties,
  sub: { fontSize: 14, color: "#6b7280", marginBottom: 32 } as React.CSSProperties,
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 } as React.CSSProperties,
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" } as React.CSSProperties,
  label: { fontSize: 12, fontWeight: 500, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 8 },
  value: { fontSize: 32, fontWeight: 700, color: "#111827" } as React.CSSProperties,
  valueSmall: { fontSize: 24, fontWeight: 700, color: "#111827" } as React.CSSProperties,
  table: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" } as React.CSSProperties,
  th: { fontSize: 12, fontWeight: 500, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.05em", padding: "12px 20px", borderBottom: "1px solid #e5e7eb", textAlign: "left" as const },
  td: { fontSize: 14, color: "#111827", padding: "14px 20px", borderBottom: "1px solid #f3f4f6" } as React.CSSProperties,
  badge: (status: string) => ({
    display: "inline-block",
    fontSize: 11, fontWeight: 500,
    padding: "2px 8px",
    borderRadius: 5,
    background: status === "fulfilled" ? "#d1fae5" : status === "canceled" ? "#fee2e2" : "#fef3c7",
    color: status === "fulfilled" ? "#065f46" : status === "canceled" ? "#991b1b" : "#92400e",
  } as React.CSSProperties),
}

export default function AnalyticsPage() {
  const [data, setData] = useState<OrderSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/admin/orders?limit=200&fields=id,display_id,status,total,created_at,*shipping_address", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        const orders = d.orders || []
        const revenue = orders
          .filter((o: any) => o.status !== "canceled")
          .reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0)

        const summary: OrderSummary = {
          total_orders: orders.filter((o: any) => o.status !== "canceled").length,
          total_revenue: revenue,
          pending: orders.filter((o: any) => o.status === "pending").length,
          fulfilled: orders.filter((o: any) => o.status === "fulfilled" || o.status === "shipped" || o.status === "delivered").length,
          canceled: orders.filter((o: any) => o.status === "canceled").length,
          recent: orders
            .filter((o: any) => o.status !== "canceled")
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10)
            .map((o: any) => ({
              id: o.id,
              display_id: o.display_id,
              status: o.status,
              total: Number(o.total) || 0,
              created_at: o.created_at,
              customer_name: o.shipping_address
                ? [o.shipping_address.first_name, o.shipping_address.last_name].filter(Boolean).join(" ")
                : "—",
            })),
        }
        setData(summary)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.heading}>Analytics</div>
        <div style={{ color: "#6b7280", fontSize: 14 }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.heading}>Analytics</div>
      <div style={S.sub}>Dab Pal · thedabpal.com</div>

      {/* Stat cards */}
      <div style={S.grid}>
        <div style={S.card}>
          <div style={S.label}>Total Revenue</div>
          <div style={S.value}>{fmt(data?.total_revenue ?? 0)}</div>
        </div>
        <div style={S.card}>
          <div style={S.label}>Orders</div>
          <div style={S.value}>{data?.total_orders ?? 0}</div>
        </div>
        <div style={S.card}>
          <div style={S.label}>Status Breakdown</div>
          <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Pending</div>
              <div style={S.valueSmall}>{data?.pending ?? 0}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Fulfilled</div>
              <div style={S.valueSmall}>{data?.fulfilled ?? 0}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Canceled</div>
              <div style={S.valueSmall}>{data?.canceled ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 12 }}>Recent Orders</div>
      <div style={S.table}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={S.th}>Order</th>
              <th style={S.th}>Customer</th>
              <th style={S.th}>Date</th>
              <th style={S.th}>Status</th>
              <th style={{ ...S.th, textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recent ?? []).map((o, i) => (
              <tr key={o.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={S.td}>#{o.display_id}</td>
                <td style={S.td}>{o.customer_name}</td>
                <td style={{ ...S.td, color: "#6b7280" }}>{fmtDate(o.created_at)}</td>
                <td style={S.td}><span style={S.badge(o.status)}>{o.status}</span></td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>${o.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PostHog placeholder */}
      <div style={{ marginTop: 32, background: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: 12, padding: "32px", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Web Traffic (PostHog)</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          Share a PostHog dashboard and paste the public link — I'll embed it here.
        </div>
      </div>
    </div>
  )
}
