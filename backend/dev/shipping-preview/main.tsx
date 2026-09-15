import React from "react"
import { createRoot } from "react-dom/client"
import BulkFulfillPage from "../../src/admin/routes/bulk-fulfill/page"
import OrderRates from "../../src/admin/widgets/order-rates"
import OrderLabels from "../../src/admin/widgets/order-labels"

async function scenario(mode: string) {
  await fetch(`/preview/scenario?mode=${mode}`, { method: "POST" })
  window.location.href = "/"
}

createRoot(document.getElementById("root")!).render(
  <>
    <header
      style={{ padding: "16px 32px", background: "#171717", color: "white" }}
    >
      <strong>Dab Pal · Local shipping preview</strong>
      <p style={{ fontSize: 13 }}>
        Sample orders only. No purchases, customer emails, or production
        connections.
      </p>
      <nav
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <a href="/" style={{ color: "#f5ce71" }}>
          Bulk fulfillment
        </a>
        <a href="/app/orders/order_sample" style={{ color: "#f5ce71" }}>
          Example order
        </a>
        <button onClick={() => scenario("success")}>Reset sample orders</button>
        <button onClick={() => scenario("failure")}>
          Simulate lost purchase response
        </button>
      </nav>
    </header>
    {window.location.pathname.includes("/orders/") ? (
      <main style={{ padding: 32 }}>
        <h1>Sample order #104</h1>
        <OrderRates />
        <OrderLabels />
      </main>
    ) : (
      <BulkFulfillPage />
    )}
  </>,
)
