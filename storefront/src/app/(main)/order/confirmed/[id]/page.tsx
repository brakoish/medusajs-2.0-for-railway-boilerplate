import { Metadata } from "next"

import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { notFound } from "next/navigation"
import { enrichLineItems } from "@lib/data/cart"
import { retrieveOrder } from "@lib/data/orders"
import { HttpTypes } from "@medusajs/types"

// Auth/cookie-gated, must render per-request.
export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ id: string }>
}

async function getOrder(id: string) {
  const order = await retrieveOrder(id)

  if (!order) {
    return
  }

  const enrichedItems = await enrichLineItems(order.items, order.region_id!)

  return {
    ...order,
    items: enrichedItems,
  } as unknown as HttpTypes.StoreOrder
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Order Confirmed",
  description: "Your purchase was successful",
}

export default async function OrderConfirmedPage({ params }: Props) {
  const order = await getOrder((await params).id)
  if (!order) {
    return notFound()
  }

  return <OrderCompletedTemplate order={order} />
}
