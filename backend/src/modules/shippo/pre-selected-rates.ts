/**
 * Process-level singleton. Maps order_id → Shippo rate object chosen by the
 * operator in the rate-preview widget. Consumed (and deleted) once by
 * ShippoProviderService.createFulfillment so the provider skips re-rating.
 *
 * Safe at Dab Pal scale (single Railway worker). If we ever go multi-worker
 * we'd swap this for Redis.
 */
export type PreSelectedRate =
  | string
  | {
      mode: "batch_pending"
      rate_object_id: string
      carrier_account: string
      servicelevel_token: string
      carrier?: string
      service?: string
    }

export const preSelectedRates = new Map<string, PreSelectedRate>()
