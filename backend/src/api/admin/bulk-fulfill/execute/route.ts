import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IFulfillmentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createOrderFulfillmentWorkflow } from "@medusajs/medusa/core-flows"
import {
  fulfilledOrderIds,
  isCanceledOrder,
  isUnshippedReminderSuppressed,
  remainingShippableItems,
  ShippableOrder,
} from "../../../../lib/shippable-orders"
import { recordShippingAttempt, withShippingLock } from "../../../../lib/shipping-attempts"
import { ShippoClient } from "../../../../modules/shippo/client"
import { preSelectedRates } from "../../../../modules/shippo/pre-selected-rates"
import { ShippoAddress, ShippoBatch, ShippoParcel } from "../../../../modules/shippo/types"

interface FulfillItem {
  order_id: string
  rate_object_id: string
  carrier_account?: string
  servicelevel_token?: string
  carrier?: string
  service?: string
}

type OrderItem = {
  id: string
  quantity: number
  requires_shipping?: boolean | null
  variant_sku?: string
  detail?: { fulfilled_quantity?: number }
  variant?: { weight?: number }
}

type BulkOrder = ShippableOrder & {
  id: string
  display_id?: number
  email?: string
  shipping_address?: {
    first_name?: string
    last_name?: string
    address_1?: string
    address_2?: string
    city?: string
    province?: string
    postal_code?: string
    country_code?: string
    phone?: string
  }
  items?: OrderItem[]
}

type FulfillResult = {
  order_id: string
  display_id?: number
  success: boolean
  fulfillment_id?: string
  batch_id?: string
  status?: string
  error?: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fromAddress = (): ShippoAddress => ({
  name: "Dab Pal",
  company: "Dab Pal",
  street1: "361 Stagg St #201",
  city: "Brooklyn",
  state: "NY",
  zip: "11206",
  country: "US",
  email: "hello@thedabpal.com",
  phone: process.env.SHIPPO_FROM_PHONE || "9709034749",
})

const parcelForOrder = (items: OrderItem[]): ShippoParcel => {
  const totalGrams = items.reduce((sum, item) => {
    const weight = item.variant?.weight ?? 0
    return sum + weight * Number(item.quantity || 1)
  }, 0)
  const totalOz = Math.max(1, Math.round((totalGrams / 28.3495) * 100) / 100)
  const skus = items.map((item) => item.variant_sku ?? "")
  const has6 = skus.some((sku) => sku.includes("-6-"))
  const has3 = skus.some((sku) => sku.includes("-3-"))
  const [length, width, height] = has6
    ? ["8", "9", "3"]
    : has3
      ? ["8", "8", "2"]
      : ["4", "6", "1"]

  return {
    length,
    width,
    height,
    distance_unit: "in",
    weight: String(totalOz),
    mass_unit: "oz",
  }
}

const toAddress = (order: BulkOrder): ShippoAddress => {
  const address = order.shipping_address
  if (!address?.address_1 || !address.city || !address.province || !address.postal_code) {
    throw new Error("Order is missing a complete shipping address")
  }

  return {
    name:
      [address.first_name, address.last_name].filter(Boolean).join(" ") ||
      "Customer",
    street1: address.address_1,
    street2: address.address_2 || undefined,
    city: address.city,
    state: address.province,
    zip: address.postal_code,
    country: (address.country_code || "US").toUpperCase(),
    phone: address.phone || undefined,
    email: order.email || undefined,
  }
}

async function waitForValidBatch(client: ShippoClient, batchId: string): Promise<ShippoBatch> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const batch = await client.getBatch(batchId, { results: 100 })
    if (batch.status === "VALID" || batch.status === "INVALID") return batch
    await sleep(1500)
  }

  return client.getBatch(batchId, { results: 100 })
}

async function markBatchStatus(
  fulfillmentModuleService: IFulfillmentModuleService,
  fulfillmentId: string,
  batchId: string | undefined,
  status: string,
  error?: string
) {
  await withShippingLock(`fulfillment:${fulfillmentId}`, async () => {
    const fulfillment = await fulfillmentModuleService.retrieveFulfillment(fulfillmentId)
    const currentData = ((fulfillment as { data?: Record<string, unknown> }).data ||
      {}) as Record<string, unknown>

    await fulfillmentModuleService.updateFulfillment(fulfillmentId, {
      data: {
        ...currentData,
        ...(batchId ? { batch_id: batchId } : {}),
        batch_status: {
          status,
          error,
          updated_at: new Date().toISOString(),
        },
      },
    })
    if (currentData.order_id) await recordShippingAttempt(String(currentData.order_id), error ? "needs_attention" : "processing", {
      ...(batchId ? { batch_id: batchId } : {}), ...(error ? { error } : {}),
    })
  })
}

/**
 * POST /admin/bulk-fulfill/execute
 * Body: { items: [{ order_id, rate_object_id, carrier_account, servicelevel_token }] }
 *
 * Creates Medusa fulfillments in a pending-batch state, submits one real Shippo
 * batch using those fulfillment ids as metadata, then purchases the batch once
 * Shippo validates it. Shippo webhooks attach label URLs/tracking as they arrive.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { items } = req.body as { items: FulfillItem[] }
  if (!Array.isArray(items) || !items.length || items.length > 100) return res.status(400).json({ error: "Select between 1 and 100 orders" })

  const apiToken = process.env.SHIPPO_API_TOKEN
  if (!apiToken) return res.status(503).json({ error: "SHIPPO_API_TOKEN not configured" })

  const invalid = items.find(
    (item) => !item.carrier_account || !item.servicelevel_token
  )
  if (invalid) {
    return res.status(400).json({
      error: "Each selected rate must include carrier_account and servicelevel_token",
      order_id: invalid.order_id,
    })
  }

  if (new Set(items.map((item) => item.order_id)).size !== items.length) return res.status(400).json({ error: "Each order may be selected only once" })

  const query = req.scope.resolve("query")
  const client = new ShippoClient({ api_token: apiToken, api_url: process.env.SHIPPO_API_URL })
  const fulfillmentModuleService: IFulfillmentModuleService = req.scope.resolve(
    Modules.FULFILLMENT
  )
  const results: FulfillResult[] = []
  const batchShipments: Parameters<ShippoClient["createBatch"]>[0]["batch_shipments"] = []

  for (const item of items) {
    try {
      const { data: orders } = await query.graph({
        entity: "order",
        filters: { id: item.order_id },
        fields: [
          "id",
          "display_id",
          "status",
          "canceled_at",
          "metadata",
          "email",
          "shipping_address.first_name",
          "shipping_address.last_name",
          "shipping_address.address_1",
          "shipping_address.address_2",
          "shipping_address.city",
          "shipping_address.province",
          "shipping_address.postal_code",
          "shipping_address.country_code",
          "shipping_address.phone",
          "items.id",
          "items.quantity",
          "items.requires_shipping",
          "items.variant_sku",
          "items.detail.fulfilled_quantity",
          "items.variant.weight",
        ],
      })

      const order = orders?.[0] as BulkOrder | undefined
      if (!order) {
        results.push({ order_id: item.order_id, success: false, error: "Order not found" })
        continue
      }

      const alreadyFulfilled = await fulfilledOrderIds(query, [item.order_id])
      if (alreadyFulfilled.has(item.order_id)) {
        results.push({
          order_id: item.order_id,
          display_id: order.display_id,
          success: false,
          error: "Order already has a fulfillment",
        })
        continue
      }

      if (isCanceledOrder(order)) {
        results.push({
          order_id: item.order_id,
          display_id: order.display_id,
          success: false,
          error: "Order is canceled",
        })
        continue
      }

      if (isUnshippedReminderSuppressed(order)) {
        results.push({
          order_id: item.order_id,
          display_id: order.display_id,
          success: false,
          error: "Order is suppressed from fulfillment reminders",
        })
        continue
      }

      const fulfillItems = remainingShippableItems(order)
      if (!fulfillItems.length) {
        results.push({
          order_id: item.order_id,
          display_id: order.display_id,
          success: false,
          error: "No items to fulfill",
        })
        continue
      }

      const destination = toAddress(order)
      const parcel = parcelForOrder(order.items || [])
      preSelectedRates.set(item.order_id, {
        mode: "batch_pending",
        rate_object_id: item.rate_object_id,
        carrier_account: item.carrier_account as string,
        servicelevel_token: item.servicelevel_token as string,
        carrier: item.carrier,
        service: item.service,
      })

      try {
        await createOrderFulfillmentWorkflow(req.scope).run({
          input: { order_id: item.order_id, items: fulfillItems, no_notification: true },
        })
      } catch (e) {
        preSelectedRates.delete(item.order_id)
        results.push({
          order_id: item.order_id,
          display_id: order.display_id,
          success: false,
          error: (e as Error).message,
        })
        continue
      }

      const { data: updatedOrders } = await query.graph({
        entity: "order",
        filters: { id: item.order_id },
        fields: ["fulfillments.id", "fulfillments.data", "fulfillments.created_at"],
      })
      const fulfillments = updatedOrders?.[0]?.fulfillments

      const latest = (fulfillments || [])
        .slice()
        .sort(
          (a: { created_at?: string }, b: { created_at?: string }) =>
            Date.parse(String(b.created_at)) - Date.parse(String(a.created_at))
        )[0] as { id?: string } | undefined

      if (!latest?.id) {
        results.push({
          order_id: item.order_id,
          display_id: order.display_id,
          success: false,
          error: "Fulfillment was created but could not be retrieved",
        })
        continue
      }

      batchShipments.push({
        carrier_account: item.carrier_account,
        servicelevel_token: item.servicelevel_token,
        metadata: latest.id,
        shipment: {
          address_from: fromAddress(),
          address_to: destination,
          parcels: [parcel],
        },
      })

      results.push({
        order_id: item.order_id,
        display_id: order.display_id,
        fulfillment_id: latest.id,
        success: true,
        status: "Pending batch",
      })
    } catch (e) {
      results.push({
        order_id: item.order_id,
        success: false,
        error: (e as Error).message,
      })
    }
  }

  if (!batchShipments.length) {
    return res.status(422).json({ error: "No fulfillments prepared", results })
  }

  let batchId: string | undefined
  try {
    const first = batchShipments[0]
    const batch = await client.createBatch({
      default_carrier_account: first.carrier_account as string,
      default_servicelevel_token: first.servicelevel_token as string,
      label_filetype: "PDF_4x6",
      metadata: `Dab Pal ${new Date().toISOString().slice(0, 16)}`,
      batch_shipments: batchShipments,
    })

    batchId = batch.object_id

    for (const result of results) {
      if (result.success && result.fulfillment_id) {
        await markBatchStatus(
          fulfillmentModuleService,
          result.fulfillment_id,
          batch.object_id,
          batch.status
        )
        result.batch_id = batch.object_id
        result.status = batch.status
      }
    }

    const validated = await waitForValidBatch(client, batch.object_id)
    if (validated.status !== "VALID") {
      for (const result of results) {
        if (result.success && result.fulfillment_id) {
          await markBatchStatus(
            fulfillmentModuleService,
            result.fulfillment_id,
            batch.object_id,
            validated.status === "INVALID" ? "INVALID" : "VALIDATION_PENDING",
            validated.status === "INVALID" ? "Shippo batch validation failed. Review the existing batch." : "Validation is still pending. Review this batch in Shippo before purchase."
          )
          result.success = false
          result.status = validated.status
          result.error = validated.status === "INVALID" ? "Shippo batch validation failed" : "Batch validation is still pending; no purchase was submitted"
        }
      }

      return res.status(422).json({
        error: validated.status === "INVALID" ? "Shippo batch validation failed" : "Batch validation is still pending; no purchase was submitted",
        batch_id: batch.object_id,
        status: validated.status,
        object_results: validated.object_results,
        results,
      })
    }

    const purchased = await client.purchaseBatch(batch.object_id)
    for (const result of results) {
      if (result.success && result.fulfillment_id) {
        await markBatchStatus(
          fulfillmentModuleService,
          result.fulfillment_id,
          batch.object_id,
          purchased.status
        )
        result.status = purchased.status
      }
    }

    res.status(202).json({
      batch_id: batch.object_id,
      status: purchased.status,
      object_results: purchased.object_results,
      label_urls: purchased.label_url || [],
      results,
    })
  } catch (error) {
    const message = `The batch result could not be confirmed. Refresh from Shippo before taking another action. ${(error as Error).message}`
    for (const result of results) {
      if (result.fulfillment_id) {
        await markBatchStatus(fulfillmentModuleService, result.fulfillment_id, batchId, "REVIEW_REQUIRED", message)
        result.success = false
        result.error = message
        result.status = "Needs attention"
      }
    }
    res.status(502).json({ error: message, results })
  }

}
