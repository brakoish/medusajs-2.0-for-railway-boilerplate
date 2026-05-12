import { useEffect, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"

/**
 * Order Labels Widget
 * Injected into the order detail page after the main content.
 * Fetches label data from our custom /admin/orders/:id/labels API
 * and shows "Print Label" buttons for each fulfillment.
 */

// Minimal type-safe UI primitives (Medusa UI may not be resolvable in backend
// build context, so we use plain JSX with Tailwind classes the admin already
// ships.)
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white border rounded-lg overflow-hidden">{children}</div>
)
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b flex items-center justify-between">
    {children}
  </div>
)
const CardBody = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4">{children}</div>
)
const Title = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
)
const Badge = ({
  children,
  color = "green",
}: {
  children: React.ReactNode
  color?: "green" | "gray"
}) => {
  const colorClass =
    color === "green"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800"
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {children}
    </span>
  )
}
const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    {children}
  </button>
)

type LabelInfo = {
  fulfillment_id: string
  tracking_number: string | null
  tracking_url: string | null
  label_url: string | null
  carrier: string | null
  service: string | null
  created_at: string
}

// Widget injected into the order detail page
const OrderLabelsWidget = () => {
  // Medusa admin injects the order into a data attribute on a wrapper div
  // We can grab it from the DOM context if available, or fetch by URL
  const orderId = (() => {
    // Try to extract order ID from the URL path: /orders/order_xxx
    const m = window.location.pathname.match(/\/orders\/(order_[^/]+)/)
    if (m) return m[1]
    // Fallback: look for a data attribute set by the admin
    const el = document.querySelector('[data-order-id]')
    return el?.getAttribute('data-order-id') || null
  })()

  const [labels, setLabels] = useState<LabelInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    setLoading(true)
    fetch(`/admin/orders/${orderId}/labels`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: { labels?: LabelInfo[] }) => {
        setLabels(data.labels || [])
        setLoading(false)
      })
      .catch((e: Error) => {
        setError(e.message)
        setLoading(false)
      })
  }, [orderId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Title>Shipping Labels</Title>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-500">Loading labels...</p>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <Title>Shipping Labels</Title>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-red-600">Error: {error}</p>
        </CardBody>
      </Card>
    )
  }

  if (labels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Title>Shipping Labels</Title>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-500">
            No labels found. Fulfill the order to generate a shipping label.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <Title>Shipping Labels</Title>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {labels.map((label) => (
            <div
              key={label.fulfillment_id}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge color="green">{label.carrier || "Carrier"}</Badge>
                  {label.service && (
                    <span className="text-xs text-gray-500">{label.service}</span>
                  )}
                </div>
                {label.tracking_number && (
                  <p className="text-sm">
                    Tracking:{" "}
                    {label.tracking_url ? (
                      <a
                        href={label.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {label.tracking_number}
                      </a>
                    ) : (
                      <span className="text-gray-700">{label.tracking_number}</span>
                    )}
                  </p>
                )}
              </div>
              <div>
                {label.label_url && (
                  <Button onClick={() => window.open(label.label_url!, "_blank")}>
                    Print Label
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderLabelsWidget
