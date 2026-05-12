/**
 * Process-level singleton. Maps order_id → Shippo rate object_id chosen by
 * the operator in the rate-preview widget. Consumed (and deleted) once by
 * ShippoProviderService.createFulfillment so the provider skips re-rating
 * and uses the exact rate the operator picked.
 *
 * Safe at Dab Pal scale (single Railway worker). If we ever go multi-worker
 * we'd swap this for Redis.
 */
export const preSelectedRates = new Map<string, string>()
