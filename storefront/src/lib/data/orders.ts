"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { getAuthHeaders } from "./cookies"

export const retrieveOrder = cache(async function (id: string) {
  return sdk.store.order
    .retrieve(
      id,
      { fields: "*payment_collections.payments,+payment_status,+fulfillment_status,*fulfillments.labels,+fulfillments.data,+fulfillments.id,+fulfillments.delivered_at,+fulfillments.canceled_at" },
      { next: { tags: ["order"] }, ...await getAuthHeaders() }
    )
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
})

export const listOrders = cache(async function (
  limit: number = 10,
  offset: number = 0
) {
  return sdk.store.order
    .list({ limit, offset }, { next: { tags: ["order"] }, ...await getAuthHeaders() })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
})
