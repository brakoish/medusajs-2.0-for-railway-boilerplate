import { MedusaContainer } from "@medusajs/framework/types"
import { operationsDb } from "./dabpal-settings"
import { shippingProgress } from "./shipping-progress"

export const productionStages = ["to_make", "printing", "ready_to_pack"] as const
let ready: Promise<unknown> | undefined
async function initialize() {
  if (!ready) ready = operationsDb().query(`CREATE TABLE IF NOT EXISTS dabpal_production (order_id text PRIMARY KEY, stage text NOT NULL CHECK(stage IN ('to_make','printing','ready_to_pack')), note text NOT NULL DEFAULT '', version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now(), updated_by text)`).catch(error => { ready = undefined; throw error })
  await ready
}
export async function saveProduction(orderId: string, stage: string, note: string, version: number, actor: string) {
  await initialize()
  const { rows } = version === 0
    ? await operationsDb().query("INSERT INTO dabpal_production (order_id,stage,note,updated_by) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING *", [orderId, stage, note, actor])
    : await operationsDb().query("UPDATE dabpal_production SET stage=$2,note=$3,version=version+1,updated_at=now(),updated_by=$5 WHERE order_id=$1 AND version=$4 RETURNING *", [orderId, stage, note, version, actor])
  return rows[0]
}

export function describeOperation(order: any, production?: any) {
  const captured = (order.payment_collections || []).reduce((sum: number, p: any) => sum + Number(p.captured_amount || 0), 0)
  const refunded = (order.payment_collections || []).reduce((sum: number, p: any) => sum + Number(p.refunded_amount || 0), 0)
  const authorized = (order.payment_collections || []).reduce((sum: number, p: any) => sum + Number(p.authorized_amount || 0), 0)
  const due = (order.payment_collections || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
  const shipments = (order.fulfillments || []).map(shippingProgress)
  const canceled = !!order.canceled_at || order.status === "canceled"
  const paid = due > 0 ? captured >= due : (order.payment_collections || []).some((p: any) => p.status === "completed")
  const unpaid = !paid
  const fullyRefunded = captured > 0 && refunded >= captured
  const remaining = (order.items || []).some((i: any) => i.requires_shipping !== false && Number(i.quantity) > Number(i.detail?.fulfilled_quantity || 0))
  const stage = canceled ? "canceled" : fullyRefunded ? "refunded" : unpaid ? "awaiting_payment" : remaining ? production?.stage || "to_make" : "shipping"
  return {
    id: order.id, display_id: order.display_id, created_at: order.created_at, currency_code: order.currency_code,
    customer: [order.shipping_address?.first_name, order.shipping_address?.last_name].filter(Boolean).join(" ") || "Customer",
    stage, captured, refunded, authorized, paid, shipments,
    production: { stage: production?.stage || "to_make", note: production?.note || "", version: production?.version || 0, updated_at: production?.updated_at || null },
    items: (order.items || []).map((i: any) => ({ id: i.id, title: i.product_title || i.title, sku: i.variant_sku, variant_title: i.variant_title, quantity: Number(i.quantity), remaining: Math.max(0, Number(i.quantity) - Number(i.detail?.fulfilled_quantity || 0)), metadata: i.variant_sku === "DABPAL-CUSTOM-SINGLE" ? i.metadata : undefined })),
  }
}

export async function listOperations(scope: MedusaContainer) {
  await initialize()
  const production = (await operationsDb().query("SELECT * FROM dabpal_production")).rows
  const productionByOrder = new Map(production.map(row => [row.order_id, row]))
  const query = scope.resolve("query")
  const orders: ReturnType<typeof describeOperation>[] = []
  for (let skip = 0; ; skip += 100) {
    const { data } = await query.graph({ entity: "order", filters: { is_draft_order: false }, fields: [
      "id", "display_id", "created_at", "status", "canceled_at", "currency_code", "shipping_address.first_name", "shipping_address.last_name",
      "items.id", "items.title", "items.product_title", "items.variant_title", "items.variant_sku", "items.quantity", "items.requires_shipping", "items.detail.fulfilled_quantity", "items.metadata",
      "payment_collections.captured_amount", "payment_collections.refunded_amount", "payment_collections.authorized_amount", "payment_collections.amount", "payment_collections.status",
      "fulfillments.id", "fulfillments.data", "fulfillments.created_at", "fulfillments.shipped_at", "fulfillments.delivered_at", "fulfillments.canceled_at", "fulfillments.labels.*",
    ], pagination: { take: 100, skip, order: { created_at: "DESC", id: "ASC" } } })
    orders.push(...data.map(order => describeOperation(order, productionByOrder.get(order.id))))
    if (data.length < 100) break
  }
  return orders
}

export function operationsSummary(orders: ReturnType<typeof describeOperation>[]) {
  const currencies: Record<string, { captured: number; refunded: number; net: number }> = {}
  for (const order of orders) {
    const money = currencies[order.currency_code] ||= { captured: 0, refunded: 0, net: 0 }
    money.captured += order.captured; money.refunded += order.refunded; money.net += order.captured - order.refunded
  }
  return { currencies, orders: orders.length, canceled: orders.filter(o => o.stage === "canceled").length,
    awaiting_payment: orders.filter(o => o.stage === "awaiting_payment").length,
    to_make: orders.filter(o => o.stage === "to_make").length, printing: orders.filter(o => o.stage === "printing").length,
    ready_to_pack: orders.filter(o => o.stage === "ready_to_pack").length,
    shipped_orders: orders.filter(o => o.shipments.some(s => ["in_transit", "delivered"].includes(s.stage))).length,
    needs_attention: orders.filter(o => o.shipments.some(s => s.stage === "needs_attention" || s.email_status === "needs_attention")).length,
  }
}
