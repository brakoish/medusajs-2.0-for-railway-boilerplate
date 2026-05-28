import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IFulfillmentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { markFulfillmentAsDeliveredWorkflow } from "@medusajs/medusa/core-flows"

type TrackingNumber = { tracking_number?: string; tracking_url?: string } | string

type FulfillmentRow = {
  id: string
  data?: Record<string, unknown>
  tracking_numbers?: TrackingNumber[]
  shipped_at?: string | Date | null
  delivered_at?: string | Date | null
}

type ShippoTrackingStatus = {
  status?: string
  status_details?: string
  status_date?: string
  location?: {
    city?: string
    state?: string
    zip?: string
    country?: string
  }
}

type ShippoTrackingResponse = {
  carrier?: string
  tracking_number?: string
  tracking_status?: ShippoTrackingStatus
  tracking_history?: ShippoTrackingStatus[]
}

type BackfillResult = {
  fulfillment_id: string
  tracking_number: string
  old_status?: string
  new_status?: string
  action: "updated" | "unchanged" | "skipped" | "error"
  error?: string
}

const hasCarrierPossession = (status?: string): boolean =>
  status === "TRANSIT" ||
  status === "OUT_FOR_DELIVERY" ||
  status === "DELIVERED" ||
  status === "FAILURE" ||
  status === "RETURNED"

const trackingNumberFrom = (fulfillment: FulfillmentRow): string => {
  const first = fulfillment.tracking_numbers?.[0]
  return (
    (typeof first === "string" ? first : first?.tracking_number) ||
    (fulfillment.data?.tracking_number as string | undefined) ||
    ""
  )
}

const carrierFrom = (fulfillment: FulfillmentRow): string => {
  const carrier = (fulfillment.data?.carrier as string | undefined) || ""
  return carrier.toLowerCase().trim()
}

const shippoRequest = async <T>(
  path: string,
  init: RequestInit = {}
): Promise<T> => {
  const token = process.env.SHIPPO_API_TOKEN
  if (!token) throw new Error("SHIPPO_API_TOKEN missing")

  const baseUrl = (process.env.SHIPPO_API_URL || "https://api.goshippo.com").replace(
    /\/+$/,
    ""
  )
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `ShippoToken ${token}`,
      "Content-Type": "application/json",
      "Shippo-API-Version": "2018-02-08",
      ...((init.headers as Record<string, string>) || {}),
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Shippo ${response.status}: ${body.slice(0, 200)}`)
  }

  return (await response.json()) as T
}

const registerTracking = async (
  carrier: string,
  trackingNumber: string,
  fulfillmentId: string
) => {
  await shippoRequest("/tracks", {
    method: "POST",
    body: JSON.stringify({
      carrier,
      tracking_number: trackingNumber,
      metadata: fulfillmentId,
    }),
  })
}

const getTracking = async (
  carrier: string,
  trackingNumber: string
): Promise<ShippoTrackingResponse> =>
  shippoRequest(
    `/tracks/${encodeURIComponent(carrier)}/${encodeURIComponent(trackingNumber)}`
  )

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const body = (req.body || {}) as { dry_run?: boolean; limit?: number }
  const dryRun = body.dry_run !== false
  const limit = Math.max(1, Math.min(Number(body.limit || 50), 100))
  const query = req.scope.resolve("query")
  const fulfillmentModuleService: IFulfillmentModuleService = req.scope.resolve(
    Modules.FULFILLMENT
  )

  const { data } = await query.graph({
    entity: "fulfillment",
    fields: [
      "id",
      "data",
      "tracking_numbers",
      "shipped_at",
      "delivered_at",
    ],
  })

  const fulfillments = ((data || []) as FulfillmentRow[]).slice(0, limit)
  const results: BackfillResult[] = []
  let checked = 0
  let updated = 0
  let delivered = 0
  let skipped = 0
  let errors = 0

  for (const fulfillment of fulfillments) {
    const trackingNumber = trackingNumberFrom(fulfillment)
    const carrier = carrierFrom(fulfillment)
    const oldStatus = (fulfillment.data?.tracking_status as { status?: string } | undefined)
      ?.status

    if (!trackingNumber || !carrier) {
      skipped++
      results.push({
        fulfillment_id: fulfillment.id,
        tracking_number: trackingNumber,
        old_status: oldStatus,
        action: "skipped",
        error: !trackingNumber ? "Missing tracking number" : "Missing carrier",
      })
      continue
    }

    checked++

    try {
      if (!dryRun) {
        await registerTracking(carrier, trackingNumber, fulfillment.id)
      }

      const tracking = await getTracking(carrier, trackingNumber)
      const newStatus = tracking.tracking_status?.status

      if (!newStatus || newStatus === oldStatus) {
        results.push({
          fulfillment_id: fulfillment.id,
          tracking_number: trackingNumber,
          old_status: oldStatus,
          new_status: newStatus,
          action: "unchanged",
        })
        continue
      }

      if (!dryRun) {
        const currentData = fulfillment.data || {}
        await fulfillmentModuleService.updateFulfillment(fulfillment.id, {
          ...(hasCarrierPossession(newStatus) && !fulfillment.shipped_at
            ? { shipped_at: new Date() }
            : {}),
          data: {
            ...currentData,
            tracking_status: {
              carrier: tracking.carrier || carrier,
              tracking_number: tracking.tracking_number || trackingNumber,
              status: newStatus,
              status_details: tracking.tracking_status?.status_details,
              status_date: tracking.tracking_status?.status_date,
              location: tracking.tracking_status?.location,
              updated_at: new Date().toISOString(),
            },
            tracking_history: (tracking.tracking_history || []).slice(0, 20),
          },
        })

        if (newStatus === "DELIVERED" && !fulfillment.delivered_at) {
          await markFulfillmentAsDeliveredWorkflow(req.scope).run({
            input: { id: fulfillment.id },
          })
          delivered++
        }
      }

      updated++
      results.push({
        fulfillment_id: fulfillment.id,
        tracking_number: trackingNumber,
        old_status: oldStatus,
        new_status: newStatus,
        action: "updated",
      })
    } catch (e) {
      errors++
      results.push({
        fulfillment_id: fulfillment.id,
        tracking_number: trackingNumber,
        old_status: oldStatus,
        action: "error",
        error: (e as Error).message,
      })
    }
  }

  res.status(200).json({
    dry_run: dryRun,
    checked,
    updated,
    delivered,
    skipped,
    errors,
    results,
  })
}
