import { useCallback, useEffect, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import ShippingProgress, { ProgressRow } from "../components/shipping-progress"

export default function OrderLabelsWidget() {
  const orderId = window.location.pathname.match(/\/orders\/(order_[^/]+)/)?.[1]
  const [rows, setRows] = useState<ProgressRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    if (!orderId) return
    try {
      const response = await fetch(`/admin/orders/${orderId}/shipping`, { credentials: "include" })
      if (!response.ok) throw new Error("Could not refresh shipping progress")
      const data = await response.json()
      setRows(data.progress || []); setError(null)
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [orderId])
  useEffect(() => {
    void load()
    const refresh = () => void load()
    const timer = window.setInterval(refresh, 5000)
    window.addEventListener("dabpal:shipping-updated", refresh)
    return () => { window.clearInterval(timer); window.removeEventListener("dabpal:shipping-updated", refresh) }
  }, [load])
  return <section id="shipping-progress" style={{ background: "#18181b", color: "#fafafa", border: "1px solid #27272a", borderRadius: 12, marginBottom: 16 }}>
    <h2 style={{ padding: "14px 20px", fontSize: 15, fontWeight: 600 }}>Shipping progress</h2>
    {error && <p role="alert" style={{ padding: "0 20px", color: "#f87171" }}>{error}</p>}
    {loading ? <p style={{ padding: 20 }}>Loading shipping progress…</p> : <ShippingProgress rows={rows} onRefresh={load} />}
  </section>
}
export const config = defineWidgetConfig({ zone: "order.details.after" })
