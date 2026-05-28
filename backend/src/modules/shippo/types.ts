/**
 * Subset of Shippo REST types we touch. Shippo's TS SDK ships its own,
 * but mapping the few fields we use keeps our code stable across SDK rev bumps.
 *
 * Refs: https://docs.goshippo.com/shippoapi/public-api/
 */

export type ShippoAddress = {
  name?: string
  company?: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
  email?: string
  is_residential?: boolean
}

export type ShippoParcel = {
  length: string
  width: string
  height: string
  distance_unit: "in" | "cm"
  weight: string
  mass_unit: "oz" | "lb" | "g" | "kg"
}

export type ShippoServiceLevel = {
  token: string
  name: string
  terms?: string
}

export type ShippoRate = {
  object_id: string
  amount: string
  currency: string
  amount_local: string
  currency_local: string
  provider: string
  provider_image_75?: string
  provider_image_200?: string
  servicelevel: ShippoServiceLevel
  estimated_days?: number
  duration_terms?: string
  carrier_account: string
  attributes?: string[]
  arrives_by?: string
}

export type ShippoShipment = {
  object_id: string
  status: "QUEUED" | "WAITING" | "SUCCESS" | "ERROR"
  address_from: ShippoAddress & { object_id?: string }
  address_to: ShippoAddress & { object_id?: string }
  parcels: (ShippoParcel & { object_id?: string })[]
  rates: ShippoRate[]
  messages?: { code?: string; text: string }[]
}

export type ShippoTransaction = {
  object_id: string
  status: "QUEUED" | "WAITING" | "SUCCESS" | "ERROR" | "REFUNDED" | "REFUNDPENDING" | "REFUNDREJECTED"
  rate: string
  metadata?: string
  tracking_number?: string
  tracking_url_provider?: string
  label_url?: string
  commercial_invoice_url?: string
  messages?: { code?: string; text: string }[]
  provider?: string
  servicelevel?: { name?: string; token?: string }
}

export type ShippoRefund = {
  object_id: string
  status: "QUEUED" | "PENDING" | "SUCCESS" | "ERROR"
  transaction: string
}

export type ShippoLiveRateLineItem = {
  quantity: number
  total_price: string
  currency: string
  weight: string
  weight_unit: "oz" | "lb" | "g" | "kg"
  title: string
  sku?: string
  manufacture_country?: string
}

export type ShippoLiveRateRequest = {
  address_from: ShippoAddress
  address_to: ShippoAddress
  line_items: ShippoLiveRateLineItem[]
  parcel?: ShippoParcel
}

export type ShippoLiveRate = {
  title: string
  description: string
  amount: string
  currency: string
  amount_local: string
  currency_local: string
  estimated_days?: number
}

export type ShippoLiveRateResponse = {
  results: ShippoLiveRate[]
  count: number
}

export type ShippoAddressValidationResults = {
  is_valid: boolean
  messages?: { code?: string; text: string; source?: string }[]
}

export type ShippoAddressWithValidation = ShippoAddress & {
  object_id: string
  is_complete?: boolean
  validation_results?: ShippoAddressValidationResults
}

export type ShippoTrackingStatus = {
  status:
    | "UNKNOWN"
    | "PRE_TRANSIT"
    | "TRANSIT"
    | "DELIVERED"
    | "RETURNED"
    | "FAILURE"
  status_details?: string
  status_date?: string
  location?: {
    city?: string
    state?: string
    zip?: string
    country?: string
  }
}

export type ShippoTrackWebhookPayload = {
  event?: string
  carrier: string
  tracking_number: string
  tracking_status: ShippoTrackingStatus
  tracking_history?: ShippoTrackingStatus[]
  servicelevel?: { token: string; name: string }
  metadata?: string
  transaction?: string
}
