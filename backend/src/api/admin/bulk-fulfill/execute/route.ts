import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createOrderFulfillmentWorkflow } from "@medusajs/medusa/core-flows"
import { PDFDocument } from "pdf-lib"
import { preSelectedRates } from "../../../../modules/shippo/pre-selected-rates"

interface FulfillItem {
  order_id: string
  rate_object_id: string
}

/**
 * POST /admin/bulk-fulfill/execute
 * Body: { items: [{ order_id, rate_object_id }] }
 *
 * Fulfills all orders, fetches label PDFs, merges into a single PDF.
 * Returns application/pdf so the browser downloads it directly.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { items } = req.body as { items: FulfillItem[] }
  if (!items?.length) return res.status(400).json({ error: "items required" })

  const query = req.scope.resolve("query")
  const results: { order_id: string; display_id?: number; success: boolean; tracking?: string; label_url?: string; error?: string }[] = []

  // Fulfill sequentially to avoid Shippo rate limiting
  for (const { order_id, rate_object_id } of items) {
    try {
      const { data: orders } = await query.graph({
        entity: "order",
        filters: { id: order_id },
        fields: ["id", "display_id", "items.id", "items.quantity", "items.detail.fulfilled_quantity"],
      })

      const order = orders?.[0] as any
      if (!order) { results.push({ order_id, success: false, error: "Order not found" }); continue }

      const rawItems = (order.items || []) as any[]
      const fulfillItems = rawItems
        .map((i: any) => {
          const fulfilled = Number(i.detail?.fulfilled_quantity ?? 0)
          const remaining = Math.max(0, Number(i.quantity) - fulfilled)
          return { id: i.id, quantity: remaining > 0 ? remaining : Number(i.quantity) }
        })
        .filter((i) => i.quantity > 0)

      if (!fulfillItems.length) { results.push({ order_id, display_id: order.display_id, success: false, error: "No items to fulfill" }); continue }

      preSelectedRates.set(order_id, rate_object_id)

      try {
        await createOrderFulfillmentWorkflow(req.scope).run({
          input: { order_id, items: fulfillItems, no_notification: false },
        })
      } catch (e) {
        preSelectedRates.delete(order_id)
        results.push({ order_id, display_id: order.display_id, success: false, error: (e as Error).message })
        continue
      }

      // Pull label data from the newly created fulfillment
      const { data: fulfillments } = await query.graph({
        entity: "fulfillment",
        filters: { order_id },
        fields: ["id", "data", "tracking_numbers", "created_at"],
      })

      const latest = (fulfillments || [])
        .slice()
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] as any

      const fdata = (latest?.data || {}) as Record<string, unknown>
      const trackingNums = (latest?.tracking_numbers || []) as any[]
      const tracking = trackingNums[0]?.tracking_number || (fdata.tracking_number as string) || ""
      const label_url = trackingNums[0]?.label_url || (fdata.label_url as string) || ""

      results.push({ order_id, display_id: order.display_id, success: true, tracking, label_url })
    } catch (e) {
      results.push({ order_id, success: false, error: (e as Error).message })
    }
  }

  // Collect label PDFs and merge
  const labelUrls = results.filter((r) => r.success && r.label_url).map((r) => r.label_url!)

  if (!labelUrls.length) {
    // All failed — return JSON error list
    return res.status(422).json({ error: "No labels generated", results })
  }

  try {
    const merged = await PDFDocument.create()

    for (const url of labelUrls) {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const buffer = await response.arrayBuffer()
        const srcDoc = await PDFDocument.load(buffer)
        const pages = await merged.copyPages(srcDoc, srcDoc.getPageIndices())
        pages.forEach((page) => merged.addPage(page))
      } catch (e) {
        console.warn(`[bulk-fulfill] Failed to fetch label PDF ${url}:`, e)
        // Skip this label — operator can reprint individually
      }
    }

    const pdfBytes = await merged.save()

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="dab-pal-labels-${Date.now()}.pdf"`)
    res.setHeader("X-Fulfill-Results", JSON.stringify(results))
    res.send(Buffer.from(pdfBytes))
  } catch (e) {
    // PDF merge failed — return results with label URLs so operator can download individually
    res.status(200).json({ pdf_error: (e as Error).message, results })
  }
}
