type Fulfillment = {
  id: string
  canceled_at?: string | Date | null
  delivered_at?: string | Date | null
  data?: Record<string, any> | null
  labels?: { tracking_number?: string; tracking_url?: string }[]
}

export function orderTracking(fulfillments: Fulfillment[] = []) {
  return fulfillments.map(f => {
    const data = f.data || {}
    const state = data.tracking_status?.status
    const number = data.tracking_number || f.labels?.[0]?.tracking_number
    let url: string | undefined
    try {
      const candidate = new URL(data.tracking_url || f.labels?.[0]?.tracking_url)
      if (candidate.protocol === "https:") url = candidate.href
    } catch { /* A tracking number can be displayed without a usable link. */ }
    const status = f.canceled_at ? "Shipment canceled"
      : f.delivered_at || state === "DELIVERED" ? "Delivered"
      : state === "OUT_FOR_DELIVERY" ? "Out for delivery"
      : state === "TRANSIT" ? "In transit"
      : ["FAILURE", "RETURNED"].includes(state) ? "Delivery needs attention — please contact us"
      : number ? "Label created — waiting for the carrier"
      : "Preparing your order"
    return { id: f.id, status, number: f.canceled_at ? undefined : number, url: f.canceled_at ? undefined : url }
  })
}
