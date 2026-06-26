import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components"
import * as React from "react"

export const UNSHIPPED_ORDER_REMINDER = "unshipped-order-reminder"

type ReminderItem = {
  title?: string | null
  variant_sku?: string | null
  quantity?: number | string | null
  detail?: {
    fulfilled_quantity?: number | string | null
  } | null
}

export type ReminderOrder = {
  id: string
  display_id?: number | string | null
  email?: string | null
  created_at?: string | Date | null
  status?: string | null
  fulfillment_status?: string | null
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    city?: string | null
    province?: string | null
    postal_code?: string | null
  } | null
  items?: ReminderItem[] | null
}

export interface UnshippedOrderReminderProps {
  orders: ReminderOrder[]
  generatedAt: string
  preview?: string
}

export const isUnshippedOrderReminderData = (
  data: unknown
): data is UnshippedOrderReminderProps => {
  if (!data || typeof data !== "object") return false

  const candidate = data as Partial<UnshippedOrderReminderProps>
  return Array.isArray(candidate.orders) && typeof candidate.generatedAt === "string"
}

const itemRemaining = (item: ReminderItem) => {
  const quantity = Number(item.quantity ?? 0)
  const fulfilled = Number(item.detail?.fulfilled_quantity ?? 0)
  return Math.max(0, quantity - fulfilled)
}

const customerName = (order: ReminderOrder) =>
  [
    order.shipping_address?.first_name,
    order.shipping_address?.last_name,
  ]
    .filter(Boolean)
    .join(" ") || order.email || "Customer"

const addressLine = (order: ReminderOrder) =>
  [
    order.shipping_address?.city,
    order.shipping_address?.province,
    order.shipping_address?.postal_code,
  ]
    .filter(Boolean)
    .join(", ")

const daysOpen = (createdAt?: string | Date | null) => {
  if (!createdAt) return null

  const created = new Date(createdAt).getTime()
  if (!Number.isFinite(created)) return null

  return Math.max(0, Math.floor((Date.now() - created) / 86_400_000))
}

const S = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily: "Inter, -apple-system, sans-serif",
    margin: 0,
    padding: "32px 16px",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    margin: "0 auto",
    maxWidth: "560px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#18181b",
    padding: "24px 28px",
  },
  wordmark: {
    color: "#f59e0b",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    margin: 0,
    textTransform: "uppercase" as const,
  },
  content: {
    padding: "28px",
  },
  h1: {
    color: "#18181b",
    fontSize: "20px",
    fontWeight: "650",
    margin: "0 0 8px",
  },
  subtitle: {
    color: "#71717a",
    fontSize: "14px",
    margin: "0 0 24px",
  },
  order: {
    borderTop: "1px solid #e4e4e7",
    padding: "18px 0",
  },
  orderTitle: {
    color: "#18181b",
    fontSize: "15px",
    fontWeight: "650",
    margin: "0 0 4px",
  },
  meta: {
    color: "#71717a",
    fontSize: "13px",
    margin: "0 0 10px",
  },
  item: {
    color: "#3f3f46",
    fontSize: "13px",
    margin: "0 0 4px",
  },
  footer: {
    borderTop: "1px solid #f4f4f5",
    padding: "18px 28px",
    textAlign: "center" as const,
  },
  footerText: {
    color: "#a1a1aa",
    fontSize: "12px",
    margin: 0,
  },
  link: {
    color: "#f59e0b",
    textDecoration: "none",
  },
}

export const UnshippedOrderReminderTemplate: React.FC<UnshippedOrderReminderProps> & {
  PreviewProps: UnshippedOrderReminderProps
} = ({ orders, generatedAt, preview }) => {
  const count = orders.length
  const previewText = preview || `${count} Dab Pal order${count === 1 ? "" : "s"} still need shipping.`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={S.body}>
        <Container style={S.container}>
          <Section style={S.header}>
            <Text style={S.wordmark}>DAB PAL</Text>
          </Section>

          <Section style={S.content}>
            <Text style={S.h1}>Unshipped order reminder</Text>
            <Text style={S.subtitle}>
              {count} order{count === 1 ? "" : "s"} still need a label or shipment scan.
            </Text>

            {orders.map((order) => {
              const openDays = daysOpen(order.created_at)
              const orderUrl = `https://admin.thedabpal.com/app/orders/${order.id}`

              return (
                <Section key={order.id} style={S.order}>
                  <Text style={S.orderTitle}>
                    <Link href={orderUrl} style={S.link}>Order #{order.display_id || order.id}</Link>
                    {" · "}
                    {customerName(order)}
                  </Text>
                  <Text style={S.meta}>
                    {addressLine(order)}
                    {openDays !== null ? ` · ${openDays} day${openDays === 1 ? "" : "s"} open` : ""}
                    {order.fulfillment_status ? ` · ${order.fulfillment_status.replace("_", " ")}` : ""}
                  </Text>

                  {(order.items || [])
                    .filter((item) => itemRemaining(item) > 0)
                    .map((item, index) => (
                      <Text key={`${order.id}-${index}`} style={S.item}>
                        {item.title || item.variant_sku || "Item"} x {itemRemaining(item)}
                      </Text>
                    ))}
                </Section>
              )
            })}
          </Section>

          <Section style={S.footer}>
            <Text style={S.footerText}>
              Generated {new Date(generatedAt).toLocaleString("en-US", {
                timeZone: "America/New_York",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })} ET
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

UnshippedOrderReminderTemplate.PreviewProps = {
  generatedAt: new Date().toISOString(),
  orders: [
    {
      id: "order_123",
      display_id: 7,
      email: "customer@example.com",
      created_at: new Date().toISOString(),
      fulfillment_status: "not_fulfilled",
      shipping_address: {
        first_name: "Jason",
        last_name: "Robertus",
        city: "Oak Creek",
        province: "WI",
        postal_code: "53154",
      },
      items: [
        {
          title: "Dab Pal Single Black Speck",
          variant_sku: "DABPAL-1-BLK",
          quantity: 1,
          detail: { fulfilled_quantity: 0 },
        },
      ],
    },
  ],
}

export default UnshippedOrderReminderTemplate
