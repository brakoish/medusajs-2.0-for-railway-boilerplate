import { useEffect, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"

type AddressSuggestion = {
  street1?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

type AddressValidation = {
  valid: boolean | null
  status: "valid" | "corrected" | "invalid" | "unavailable"
  suggestion?: AddressSuggestion
  messages?: { code?: string; text: string }[]
  error?: string
}

const statusCopy: Record<AddressValidation["status"], string> = {
  valid: "Real address",
  corrected: "Real address, corrected",
  invalid: "Invalid address",
  unavailable: "Validation unavailable",
}

const statusColor: Record<AddressValidation["status"], string> = {
  valid: "#4ade80",
  corrected: "#d4a22a",
  invalid: "#f87171",
  unavailable: "#a1a1aa",
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
  muted: { fontSize: 13, color: "#71717a", margin: 0 } as React.CSSProperties,
  badge: (status: AddressValidation["status"]) => ({
    fontSize: 11,
    fontWeight: 600,
    color: statusColor[status],
    background: `${statusColor[status]}18`,
    border: `1px solid ${statusColor[status]}33`,
    borderRadius: 5,
    padding: "2px 7px",
  } as React.CSSProperties),
  suggestion: {
    marginTop: 10,
    padding: "10px 12px",
    border: "1px solid #27272a",
    borderRadius: 8,
    color: "#d4d4d8",
    fontSize: 13,
    lineHeight: 1.45,
  } as React.CSSProperties,
  message: { marginTop: 8, color: "#a1a1aa", fontSize: 12 } as React.CSSProperties,
}

const formatSuggestion = (suggestion?: AddressSuggestion) => {
  if (!suggestion) return null
  const line1 = [suggestion.street1, suggestion.street2].filter(Boolean).join(" ")
  const line2 = [
    suggestion.city,
    [suggestion.state, suggestion.zip].filter(Boolean).join(" "),
  ].filter(Boolean).join(", ")

  return [line1, line2, suggestion.country].filter(Boolean).join(" · ")
}

const OrderAddressValidationWidget = () => {
  const orderId = window.location.pathname.match(/\/orders\/(order_[^/]+)/)?.[1] ?? null

  const [validation, setValidation] = useState<AddressValidation | null>(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    if (!orderId || loading) return
    setLoading(true)
    fetch(`/admin/orders/${orderId}/address-validation`, { credentials: "include" })
      .then(async (r) => {
        const data = (await r.json()) as AddressValidation
        if (!r.ok && !data.status) {
          throw new Error(data.error || `HTTP ${r.status}`)
        }
        return data
      })
      .then((data) => {
        setValidation(data)
        setLoading(false)
      })
      .catch((e: Error) => {
        setValidation({
          valid: null,
          status: "unavailable",
          messages: [{ text: e.message }],
        })
        setLoading(false)
      })
  }

  useEffect(load, [orderId])

  const suggestion = formatSuggestion(validation?.suggestion)

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>Address Validation</span>
        {validation && <span style={S.badge(validation.status)}>{statusCopy[validation.status]}</span>}
      </div>
      <div style={S.body}>
        {loading && <p style={S.muted}>Checking Shippo...</p>}
        {!loading && !validation && <p style={S.muted}>No validation result.</p>}
        {!loading && validation && (
          <>
            {suggestion && (
              <div style={S.suggestion}>
                {suggestion}
              </div>
            )}
            {(validation.messages || []).slice(0, 3).map((message, index) => (
              <div key={`${message.code || "message"}-${index}`} style={S.message}>
                {message.text}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({ zone: "order.details.before" })
export default OrderAddressValidationWidget
