import { defineConfig } from "vite"
import path from "path"

const readyOrder = {
  id: "order_sample",
  display_id: 104,
  created_at: "2026-09-15T12:00:00Z",
  email: "sample@example.com",
  shipping_address: {
    first_name: "Sample",
    last_name: "Customer",
    address_1: "10 Example Lane",
    city: "Brooklyn",
    province: "NY",
    postal_code: "11206",
  },
  items: [
    {
      id: "item_sample",
      title: "Black Speck Dab Pal",
      quantity: 1,
      variant_sku: "DP-BLACK",
    },
  ],
}
const rate = {
  object_id: "rate_sample",
  carrier: "USPS",
  service: "Ground Advantage",
  amount: 4.25,
  currency: "USD",
  estimated_days: 3,
  carrier_account: "account_sample",
  service_token: "usps_ground_advantage",
}
const initialProgress = [
  {
    order_id: "order_waiting",
    display_id: 101,
    customer: "Example Customer",
    fulfillment_id: "ful_waiting",
    stage: "processing",
    message:
      "Shippo is processing this label. This page updates automatically.",
    batch_id: "sample-batch-101",
    email_status: "waiting_for_carrier",
  },
  {
    order_id: "order_review",
    display_id: 102,
    customer: "Example Customer",
    fulfillment_id: "ful_review",
    stage: "needs_attention",
    message:
      "The purchase result could not be confirmed. Refresh from Shippo before taking another action.",
    batch_id: "sample-batch-102",
    email_status: "waiting_for_carrier",
  },
  {
    order_id: "order_sent",
    display_id: 103,
    customer: "Example Customer",
    fulfillment_id: "ful_sent",
    stage: "in_transit",
    message: "The carrier has the parcel.",
    tracking_number: "SAMPLE-TRACKING-103",
    email_status: "sent",
  },
]
let orders = [readyOrder]
let progress: any[] = structuredClone(initialProgress)
let failPurchase = false
let generation = 0
const asLabel = (row: any) => ({
  ...row,
  stage: "label_ready",
  message:
    "Print the label and hand the parcel to the carrier. Awaiting a carrier scan.",
  label_url: "/sample-label",
  tracking_number: "SAMPLE-TRACKING",
  email_status: "waiting_for_carrier",
})

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: { "@medusajs/admin-sdk": path.join(__dirname, "admin-sdk.ts") },
  },
  esbuild: { jsx: "automatic" },
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
  plugins: [
    {
      name: "isolated-shipping-fixtures",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url || "/", "http://localhost")
          const json = (data: unknown, status = 200) => {
            res.statusCode = status
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify(data))
          }
          if (url.pathname === "/preview/scenario") {
            generation++
            orders = [readyOrder]
            progress = structuredClone(initialProgress)
            failPurchase = url.searchParams.get("mode") === "failure"
            json({ ok: true })
            return
          }
          if (url.pathname === "/sample-label") {
            res.setHeader("Content-Type", "text/html")
            res.end("<h1>Sample label — not valid for postage</h1>")
            return
          }
          if (!url.pathname.startsWith("/admin/")) {
            next()
            return
          }
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const body = chunks.length
            ? JSON.parse(Buffer.concat(chunks).toString())
            : {}
          const orderId = url.pathname.match(/\/orders\/([^/]+)/)?.[1]
          if (url.pathname.endsWith("/shipping/refresh")) {
            progress = progress.map((row) =>
              row.order_id === orderId ? asLabel(row) : row,
            )
            json({
              orders,
              progress: progress.filter((row) => row.order_id === orderId),
            })
            return
          }
          if (url.pathname.endsWith("/shipping")) {
            json({
              orders: orders.filter((row) => row.id === orderId),
              progress: progress.filter((row) => row.order_id === orderId),
            })
            return
          }
          if (url.pathname.endsWith("/orders") && !orderId) {
            json({ orders, progress })
            return
          }
          if (url.pathname.endsWith("/rates")) {
            json(
              orderId
                ? { rates: [rate], weight_oz: 2, to: "Brooklyn, NY" }
                : {
                    results: [
                      {
                        order_id: "order_sample",
                        display_id: 104,
                        name: "Sample Customer",
                        address: "10 Example Lane, Brooklyn, NY",
                        rates: [rate],
                      },
                    ],
                  },
            )
            return
          }
          if (
            url.pathname.endsWith("/execute") ||
            url.pathname.endsWith("/fulfill")
          ) {
            if (!orders.length) {
              json(
                {
                  error: "Purchase already exists; refresh shipping progress.",
                },
                409,
              )
              return
            }
            orders = []
            const row = {
              order_id: "order_sample",
              display_id: 104,
              customer: "Sample Customer",
              fulfillment_id: "ful_sample",
              stage: failPurchase ? "needs_attention" : "processing",
              message: failPurchase
                ? "Response lost. Refresh the existing purchase before taking another action."
                : "Waiting for Shippo to finish the label.",
              batch_id: "sample-batch-104",
              email_status: "waiting_for_carrier",
            }
            progress.push(row)
            if (!failPurchase) {
              const current = generation
              setTimeout(() => {
                if (generation === current)
                  progress = progress.map((p) =>
                    p.order_id === row.order_id ? asLabel(p) : p,
                  )
              }, 1200)
            }
            json(
              {
                error: failPurchase
                  ? "Purchase result could not be confirmed. Refresh from Shippo."
                  : undefined,
                results: [
                  {
                    order_id: row.order_id,
                    display_id: 104,
                    success: !failPurchase,
                    error: failPurchase ? row.message : undefined,
                  },
                ],
              },
              failPurchase ? 502 : 202,
            )
            return
          }
          if (url.pathname.endsWith("/send-tracking")) {
            json({ ok: true })
            return
          }
          json({ error: "This action is not part of the sample preview" }, 404)
        })
      },
    },
  ],
})
