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
  duration_terms: string | null
}

type RatesResponse = {
  order_id: string
  to: string
  weight_oz: number
  rates: Rate[]
  error?: string
}

// Shippo service group → Medusa shipping option name mapping
const SERVICE_GROUP_MAP: Record<string, string> = {
  usps_ground_advantage: "Standard Shipping",
  usps_priority: "Priority Shipping",
}

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white border rounded-lg overflow-hidden shadow-sm">{children}</div>
)
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b flex items-center justify-between">{children}</div>
)
const CardBody = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4">{children}</div>
)

const OrderRatesWidget = () => {
  const orderId = (() => {
    const m = window.location.pathname.match(/\/orders\/(order_[^/]+)/)
    return m ? m[1] : null
  })()

  const [data, setData] = useState<RatesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchRates = () => {
    if (!orderId || loading) return
    setLoading(true)
    fetch(`/admin/orders/${orderId}/rates`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: RatesResponse) => {
        setData(d)
        setLoading(false)
        setOpen(true)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-gray-900">Shippo Rate Preview</h2>
        <button
          onClick={fetchRates}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Fetching..." : "Get Rates"}
        </button>
      </CardHeader>

      {open && data && (
        <CardBody>
          {data.error ? (
            <p className="text-sm text-red-600">{data.error}</p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-3">
                To: {data.to} · Parcel: {data.weight_oz} oz
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-2 font-medium">Carrier</th>
                    <th className="pb-2 font-medium">Service</th>
                    <th className="pb-2 font-medium">Days</th>
                    <th className="pb-2 font-medium text-right">Price</th>
                    <th className="pb-2 font-medium text-right">Medusa Option</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rates.map((r) => {
                    const medusaOption = SERVICE_GROUP_MAP[r.service_token] || null
                    return (
                      <tr key={r.object_id} className={`border-b last:border-0 ${medusaOption ? "bg-amber-50" : ""}`}>
                        <td className="py-2 font-medium">{r.carrier}</td>
                        <td className="py-2 text-gray-700">{r.service}</td>
                        <td className="py-2 text-gray-500">{r.estimated_days ?? "—"}</td>
                        <td className="py-2 text-right font-semibold">${r.amount.toFixed(2)}</td>
                        <td className="py-2 text-right text-xs text-amber-700">
                          {medusaOption || ""}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-3">
                Highlighted rows = your configured Medusa shipping options.
              </p>
            </>
          )}
        </CardBody>
      )}
    </Card>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderRatesWidget
