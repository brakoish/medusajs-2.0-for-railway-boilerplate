import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useMemo, useState } from "react"

export const config = defineRouteConfig({
  label: "Email Studio",
  icon: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="12" rx="2" fill="currentColor" opacity="0.25" />
      <path d="M3 6.5l7 4.5 7-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
})

type Flow = {
  template: string
  name: string
  audience: string
  type: string
  trigger: string
  timing: string
  status: string
  editable: string
  strategy: string
}

type EmailLog = {
  id: string
  created_at: string
  template: string
  subject: string | null
  recipient: string
  sender: string | null
  status: "sent" | "failed"
  provider_message_id: string | null
  error: string | null
}

type Stat = {
  template: string
  status: "sent" | "failed"
  count: number
  last_sent_at: string | null
}

type Recommendation = {
  title: string
  priority: string
  note: string
}

type EmailStudioData = {
  flows: Flow[]
  logs: EmailLog[]
  stats: Stat[]
  recommendations: Recommendation[]
}

const S: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    maxWidth: 1180,
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 4px",
  },
  sub: { fontSize: 14, color: "#6b7280", margin: "0 0 24px" },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
    marginBottom: 24,
  },
  panel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 18,
  },
  panelHead: {
    padding: "14px 18px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  panelSub: {
    fontSize: 12,
    color: "#6b7280",
    margin: "3px 0 0",
  },
  flow: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
  },
  flowHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  flowName: { fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 },
  meta: { fontSize: 12, color: "#6b7280", margin: "3px 0 0", lineHeight: 1.4 },
  label: {
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
    margin: "12px 0 4px",
  },
  text: { fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.45 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    height: 22,
    padding: "0 8px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 700,
  },
  liveBadge: { background: "#dcfce7", color: "#166534" },
  disabledBadge: { background: "#fee2e2", color: "#991b1b" },
  neutralBadge: { background: "#f3f4f6", color: "#374151" },
  btn: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    borderRadius: 7,
    padding: "7px 11px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  btnAmber: {
    border: "1px solid #d4a22a",
    background: "#d4a22a",
    color: "#111827",
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "12px 14px",
    fontSize: 12,
    color: "#374151",
    borderBottom: "1px solid #f9fafb",
    verticalAlign: "top",
  },
  code: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 12,
    color: "#111827",
  },
  callout: {
    padding: 14,
    borderBottom: "1px solid #f3f4f6",
  },
}

const previewable = new Set(["order-placed", "order-shipped", "abandoned-cart"])

const fmtDate = (value?: string | null) => {
  if (!value) return "Never"
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const badgeStyle = (status: string) => ({
  ...S.badge,
  ...(status === "Live"
    ? S.liveBadge
    : status === "Disabled"
      ? S.disabledBadge
      : S.neutralBadge),
})

const logBadgeStyle = (status: "sent" | "failed") => ({
  ...S.badge,
  ...(status === "sent" ? S.liveBadge : S.disabledBadge),
})

export default function EmailStudioPage() {
  const [data, setData] = useState<EmailStudioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetch("/admin/email-studio", { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load Email Studio (${response.status})`)
        }
        return response.json()
      })
      .then((payload) => setData(payload))
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Could not load Email Studio")
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const statsByTemplate = useMemo(() => {
    const byTemplate = new Map<string, { sent: number; failed: number; last: string | null }>()
    for (const stat of data?.stats || []) {
      const current = byTemplate.get(stat.template) || { sent: 0, failed: 0, last: null }
      if (stat.status === "sent") current.sent += stat.count
      if (stat.status === "failed") current.failed += stat.count
      if (!current.last || (stat.last_sent_at && stat.last_sent_at > current.last)) {
        current.last = stat.last_sent_at
      }
      byTemplate.set(stat.template, current)
    }
    return byTemplate
  }, [data?.stats])

  const sendPreview = (template: string) => {
    setSending(template)
    setNotice(null)
    fetch("/admin/email-studio", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((payload) => {
            throw new Error(payload.error || `Preview failed (${response.status})`)
          })
        }
        return response.json()
      })
      .then(() => {
        setNotice(`Preview sent for ${template}`)
        load()
      })
      .catch((sendError) => {
        setNotice(sendError instanceof Error ? sendError.message : "Preview failed")
      })
      .finally(() => setSending(null))
  }

  if (loading && !data) {
    return (
      <div style={S.page}>
        <h1 style={S.heading}>Email Studio</h1>
        <p style={S.sub}>Loading email flows...</p>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.toolbar}>
        <div>
          <h1 style={S.heading}>Email Studio</h1>
          <p style={S.sub}>Customer emails, recovery flows, previews, and recent sends.</p>
        </div>
        <button style={S.btn} onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ ...S.panel, padding: 16, color: "#991b1b" }}>
          {error}
        </div>
      )}

      {notice && (
        <div style={{ ...S.panel, padding: 16, color: notice.includes("failed") ? "#991b1b" : "#166534" }}>
          {notice}
        </div>
      )}

      <section style={S.grid}>
        {(data?.flows || []).map((flow) => {
          const stat = statsByTemplate.get(flow.template) || { sent: 0, failed: 0, last: null }
          const canPreview = previewable.has(flow.template)
          return (
            <div key={flow.template} style={S.flow}>
              <div style={S.flowHead}>
                <div>
                  <h2 style={S.flowName}>{flow.name}</h2>
                  <p style={S.meta}>{flow.type} · {flow.audience}</p>
                </div>
                <span style={badgeStyle(flow.status)}>{flow.status}</span>
              </div>

              <div style={S.label}>Trigger</div>
              <p style={S.text}>{flow.trigger}</p>
              <div style={S.label}>Timing</div>
              <p style={S.text}>{flow.timing}</p>
              <div style={S.label}>Strategy</div>
              <p style={S.text}>{flow.strategy}</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
                <div>
                  <div style={S.label}>30d sent</div>
                  <p style={S.text}>{stat.sent}</p>
                </div>
                <div>
                  <div style={S.label}>Failed</div>
                  <p style={S.text}>{stat.failed}</p>
                </div>
                <div>
                  <div style={S.label}>Last</div>
                  <p style={S.text}>{fmtDate(stat.last)}</p>
                </div>
              </div>

              <button
                style={{
                  ...S.btn,
                  ...(canPreview ? S.btnAmber : S.btnDisabled),
                  marginTop: 14,
                }}
                disabled={!canPreview || sending === flow.template}
                onClick={() => sendPreview(flow.template)}
              >
                {sending === flow.template ? "Sending..." : canPreview ? "Send preview to Will" : "Preview locked"}
              </button>
            </div>
          )
        })}
      </section>

      <section style={S.panel}>
        <div style={S.panelHead}>
          <div>
            <h2 style={S.panelTitle}>Audit Notes</h2>
            <p style={S.panelSub}>What to improve next without making the emails noisy.</p>
          </div>
        </div>
        {(data?.recommendations || []).map((item) => (
          <div key={item.title} style={S.callout}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <strong style={{ fontSize: 13, color: "#111827" }}>{item.title}</strong>
              <span style={{ ...S.badge, ...S.neutralBadge }}>{item.priority}</span>
            </div>
            <p style={S.text}>{item.note}</p>
          </div>
        ))}
      </section>

      <section style={S.panel}>
        <div style={S.panelHead}>
          <div>
            <h2 style={S.panelTitle}>Recent Sends</h2>
            <p style={S.panelSub}>Logged from the Resend provider. New emails appear here after this deploy.</p>
          </div>
        </div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>When</th>
              <th style={S.th}>Template</th>
              <th style={S.th}>Recipient</th>
              <th style={S.th}>Subject</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Provider ID</th>
            </tr>
          </thead>
          <tbody>
            {(data?.logs || []).length ? (
              data?.logs.map((log) => (
                <tr key={log.id}>
                  <td style={S.td}>{fmtDate(log.created_at)}</td>
                  <td style={{ ...S.td, ...S.code }}>{log.template}</td>
                  <td style={S.td}>{log.recipient}</td>
                  <td style={S.td}>{log.subject || "No subject"}</td>
                  <td style={S.td}>
                    <span style={logBadgeStyle(log.status)}>{log.status}</span>
                    {log.error ? <div style={{ color: "#991b1b", marginTop: 4 }}>{log.error}</div> : null}
                  </td>
                  <td style={{ ...S.td, ...S.code }}>{log.provider_message_id || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={S.td} colSpan={6}>
                  No logged sends yet. Send a preview to seed the log.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
