import React from "react"
import { createRoot } from "react-dom/client"
import Products from "../../src/admin/routes/dab-pal-products/page"
import Orders from "../../src/admin/routes/dab-pal/page"
import Reports from "../../src/admin/routes/analytics/page"
import "./styles.css"
const path = window.location.pathname
createRoot(document.getElementById("root")!).render(<><div className="bg-ui-bg-subtle px-8 py-3 text-xs text-ui-fg-subtle">Local review · sample records only · no live orders, payments or emails</div>{path.includes("dab-pal-products") ? <Products /> : path.includes("analytics") ? <Reports /> : <Orders />}</>)
