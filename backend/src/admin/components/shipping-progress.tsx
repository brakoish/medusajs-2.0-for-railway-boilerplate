import { useState } from "react"
import { shippingStageLabel, ShippingStage } from "../../lib/shipping-progress"

export type ProgressRow = {
  order_id: string
  display_id?: number
  customer?: string
  fulfillment_id: string
  stage: ShippingStage
  message: string
  label_url?: string | null
  tracking_number?: string | null
  tracking_url?: string | null
  batch_id?: string | null
  transaction_id?: string | null
  batch_label_urls?: string[]
  email_status: string
}

export default function ShippingProgress({
  rows,
  onRefresh,
}: {
  rows: ProgressRow[]
  onRefresh: () => Promise<void>
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const act = async (row: ProgressRow, action: "refresh" | "email") => {
    setBusy(row.order_id)
    setError(null)
    try {
      const response = await fetch(
        action === "refresh"
          ? `/admin/orders/${row.order_id}/shipping/refresh`
          : `/admin/orders/${row.order_id}/send-tracking`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            action === "email" ? { fulfillment_id: row.fulfillment_id } : {},
          ),
        },
      )
      const data = await response.json()
      if (!response.ok)
        throw new Error(data.error || "Could not update shipping progress")
      await onRefresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }
  const cell = {
    padding: "12px 14px",
    textAlign: "left" as const,
    verticalAlign: "top" as const,
    borderBottom: "1px solid #8883",
  }
  const button = {
    padding: "6px 10px",
    border: "1px solid #8886",
    borderRadius: 6,
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontSize: 12,
  }
  const batchLabels = [
    ...new Set(rows.flatMap((row) => row.batch_label_urls || [])),
  ]
  return (
    <div>
      {error && (
        <p role="alert" style={{ padding: "0 14px", color: "#d14343" }}>
          {error}
        </p>
      )}
      {batchLabels.map((url, index) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{ color: "inherit", display: "inline-block", margin: 14 }}
        >
          Print batch labels{batchLabels.length > 1 ? ` ${index + 1}` : ""} ↗
        </a>
      ))}
      {!rows.length ? (
        <p style={{ padding: 16 }}>No shipments in this view.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr>
                {[
                  "Order",
                  "Progress and next action",
                  "Label and tracking",
                  "Customer email",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} scope="col" style={cell}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.order_id}:${row.fulfillment_id}`}>
                  <td style={cell}>
                    <a
                      href={`/app/orders/${row.order_id}`}
                      style={{ color: "inherit", fontWeight: 600 }}
                    >
                      #{row.display_id || row.order_id}
                    </a>
                    <div>{row.customer}</div>
                  </td>
                  <td style={{ ...cell, minWidth: 200, maxWidth: 340 }}>
                    <strong
                      style={{
                        color:
                          row.stage === "needs_attention"
                            ? "#d14343"
                            : row.stage === "processing"
                              ? "#9a6700"
                              : "inherit",
                      }}
                    >
                      {shippingStageLabel[row.stage]}
                    </strong>
                    <div style={{ marginTop: 6 }}>{row.message}</div>
                    {row.batch_id && <small>Batch: {row.batch_id}</small>}
                    {!row.batch_id && row.transaction_id && (
                      <small>Transaction: {row.transaction_id}</small>
                    )}
                  </td>
                  <td style={cell}>
                    {row.label_url && (
                      <a
                        href={row.label_url}
                        style={{ color: "inherit" }}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Print label ↗
                      </a>
                    )}
                    <div style={{ marginTop: 6 }}>
                      {row.tracking_url ? (
                        <a
                          href={row.tracking_url}
                          style={{ color: "inherit" }}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {row.tracking_number || "Track parcel"}
                        </a>
                      ) : (
                        row.tracking_number || "Not available yet"
                      )}
                    </div>
                  </td>
                  <td style={cell}>
                    {row.email_status === "sent"
                      ? "Sent"
                      : row.email_status === "needs_attention"
                        ? "Needs review in Email Studio"
                        : row.email_status === "processing"
                          ? "Checking notification"
                          : row.stage === "in_transit" ||
                              row.stage === "delivered"
                            ? "Ready to notify"
                            : "Waiting for carrier scan"}
                  </td>
                  <td style={cell}>
                    <button
                      style={button}
                      disabled={busy !== null}
                      onClick={() => act(row, "refresh")}
                    >
                      {busy === row.order_id
                        ? "Updating…"
                        : "Refresh from Shippo"}
                    </button>
                    {row.fulfillment_id &&
                      row.email_status !== "sent" &&
                      ["in_transit", "delivered"].includes(row.stage) && (
                        <button
                          style={{ ...button, marginTop: 6 }}
                          disabled={busy !== null}
                          onClick={() => act(row, "email")}
                        >
                          Check / send email
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
