export type ShippingStage =
  | "processing"
  | "needs_attention"
  | "label_ready"
  | "in_transit"
  | "delivered"
  | "canceled"

export type ShippingFulfillment = {
  id: string
  data?: Record<string, any> | null
  tracking_numbers?: (string | { tracking_number?: string })[]
  created_at?: string | Date
  shipped_at?: string | Date | null
  delivered_at?: string | Date | null
  canceled_at?: string | Date | null
}

export const carrierHasPossession = (status?: string) =>
  ["TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"].includes(
    status || "",
  )

export function shippingProgress(fulfillment: ShippingFulfillment) {
  const data = fulfillment.data || {}
  const tracking = data.tracking_status?.status
  const batch = data.batch_status?.status
  const transaction = data.transaction_status?.status
  const first = fulfillment.tracking_numbers?.[0]
  const trackingNumber =
    data.tracking_number ||
    (typeof first === "string" ? first : first?.tracking_number) ||
    null
  let stage: ShippingStage = "processing"
  let message =
    "Waiting for the label result. Refresh status before taking another action."
  if (fulfillment.canceled_at) {
    stage = "canceled"
    message = "Fulfillment canceled. Check the label refund separately."
  } else if (fulfillment.delivered_at || tracking === "DELIVERED") {
    stage = "delivered"
    message = "The carrier reports delivery."
  } else if (["FAILURE", "RETURNED"].includes(tracking)) {
    stage = "needs_attention"
    message =
      data.tracking_status?.status_details ||
      "The carrier reports a delivery issue."
  } else if (["ERROR", "REFUNDED", "REFUNDPENDING"].includes(transaction)) {
    stage = "needs_attention"
    message =
      data.transaction_status?.messages
        ?.map((m: { text: string }) => m.text)
        .join("; ") || "Review this label transaction in Shippo."
  } else if (carrierHasPossession(tracking)) {
    stage = "in_transit"
    message =
      data.tracking_status?.status_details || "The carrier has the parcel."
  } else if (data.label_url) {
    stage = "label_ready"
    message =
      "Print the label and hand the parcel to the carrier. Awaiting a carrier scan."
  } else if (
    [
      "INVALID",
      "TRANSACTION_FAILED",
      "ERROR",
      "REVIEW_REQUIRED",
      "VALIDATION_PENDING",
    ].includes(batch)
  ) {
    stage = "needs_attention"
    message =
      data.batch_status?.error ||
      data.batch_status?.messages
        ?.map((m: { text: string }) => m.text)
        .join("; ") ||
      "Review the existing batch in Shippo before purchasing again."
  } else if (
    Date.now() - Date.parse(String(fulfillment.created_at || "")) >
    15 * 60 * 1000
  ) {
    stage = "needs_attention"
    message =
      "The label result is taking longer than expected. Refresh from Shippo; do not buy another label."
  }
  return {
    fulfillment_id: fulfillment.id,
    stage,
    message,
    label_url:
      stage === "canceled" ||
      ["ERROR", "REFUNDED", "REFUNDPENDING"].includes(transaction)
        ? null
        : data.label_url || null,
    tracking_number: trackingNumber,
    tracking_url: data.tracking_url || null,
    carrier: data.carrier || null,
    service: data.service || null,
    batch_id: data.batch_id || null,
    transaction_id: data.transaction_id || null,
    batch_label_urls:
      stage === "canceled" ||
      ["ERROR", "REFUNDED", "REFUNDPENDING"].includes(transaction)
        ? []
        : ((data.batch_label_urls || []) as string[]),
    email_status: data.tracking_email_sent_at
      ? "sent"
      : data.tracking_email_error
        ? "needs_attention"
        : data.tracking_email_started_at
          ? "processing"
          : "waiting_for_carrier",
  }
}

export const shippingStageLabel: Record<ShippingStage, string> = {
  processing: "Label processing",
  needs_attention: "Needs attention",
  label_ready: "Ready to print",
  in_transit: "In transit",
  delivered: "Delivered",
  canceled: "Canceled",
}
