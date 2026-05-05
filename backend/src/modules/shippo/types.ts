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
  tracking_number?: string
  tracking_url_provider?: string
  label_url?: string
  commercial_invoice_url?: string
  messages?: { code?: string; text: string }[]
}

export type ShippoRefund = {
  object_id: string
  status: "QUEUED" | "PENDING" | "SUCCESS" | "ERROR"
  transaction: string
}
