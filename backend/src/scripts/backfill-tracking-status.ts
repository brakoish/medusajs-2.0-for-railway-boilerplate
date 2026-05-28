import { ExecArgs, IFulfillmentModuleService } from "@medusajs/framework/types"
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

export default async function backfillTrackingStatus({
  container,
  args,
}: ExecArgs) {
  const dryRun = !args.includes("--apply")
  const query = container.resolve("query")
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(
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

  const fulfillments = (data || []) as FulfillmentRow[]
  let checked = 0
  let skipped = 0
  let updated = 0
  let delivered = 0
  let errors = 0

  for (const fulfillment of fulfillments) {
    const trackingNumber = trackingNumberFrom(fulfillment)
    const carrier = carrierFrom(fulfillment)
    const currentStatus = (fulfillment.data?.tracking_status as { status?: string } | undefined)
      ?.status

    if (!trackingNumber || !carrier) {
      skipped++
      continue
    }

    checked++

    try {
      if (!dryRun) {
        await registerTracking(carrier, trackingNumber, fulfillment.id)
      }

      const tracking = await getTracking(carrier, trackingNumber)
      const status = tracking.tracking_status?.status

      if (!status || status === currentStatus) {
        console.log(
          `[backfill] unchanged fulfillment=${fulfillment.id} tracking=${trackingNumber} status=${status || "none"}`
        )
        continue
      }

      console.log(
        `[backfill] ${dryRun ? "would update" : "updating"} fulfillment=${fulfillment.id} tracking=${trackingNumber} ${currentStatus || "none"} -> ${status}`
      )

      if (!dryRun) {
        const currentData = fulfillment.data || {}
        await fulfillmentModuleService.updateFulfillment(fulfillment.id, {
          ...(hasCarrierPossession(status) && !fulfillment.shipped_at
            ? { shipped_at: new Date() }
            : {}),
          data: {
            ...currentData,
            tracking_status: {
              carrier: tracking.carrier || carrier,
              tracking_number: tracking.tracking_number || trackingNumber,
              status,
              status_details: tracking.tracking_status?.status_details,
              status_date: tracking.tracking_status?.status_date,
              location: tracking.tracking_status?.location,
              updated_at: new Date().toISOString(),
            },
            tracking_history: (tracking.tracking_history || []).slice(0, 20),
          },
        })

        if (status === "DELIVERED" && !fulfillment.delivered_at) {
          await markFulfillmentAsDeliveredWorkflow(container).run({
            input: { id: fulfillment.id },
          })
          delivered++
        }
      }

      updated++
    } catch (e) {
      errors++
      console.warn(
        `[backfill] failed fulfillment=${fulfillment.id} tracking=${trackingNumber}: ${
          (e as Error).message
        }`
      )
    }
  }

  console.log(
    `[backfill] done dry_run=${dryRun} checked=${checked} skipped=${skipped} updated=${updated} delivered=${delivered} errors=${errors}`
  )
}
