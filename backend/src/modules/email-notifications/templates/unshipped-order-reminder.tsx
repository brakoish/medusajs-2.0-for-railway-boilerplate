import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"
import { DabPalEmailLogo, DabPalProductImage } from "./brand"

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
  canceled_at?: string | Date | null
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

const cleanTitle = (item: ReminderItem) =>
  (item.title || item.variant_sku || "Dab Pal").replace(" / ", ", ")

const daysOpen = (createdAt?: string | Date | null) => {
  if (!createdAt) return null

  const created = new Date(createdAt).getTime()
  if (!Number.isFinite(created)) return null

  return Math.max(0, Math.floor((Date.now() - created) / 86_400_000))
}

const S = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    margin: 0,
    padding: "40px 16px",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "500px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#18181b",
    padding: "30px 32px",
    textAlign: "center" as const,
  },
  content: {
    padding: "32px",
  },
  eyebrow: {
    color: "#92400e",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    margin: "0 0 10px",
    textTransform: "uppercase" as const,
  },
  h1: {
    color: "#18181b",
    fontSize: "24px",
    fontWeight: "700",
    lineHeight: "1.2",
    margin: "0 0 10px",
  },
  subtitle: {
    color: "#52525b",
    fontSize: "15px",
    lineHeight: "1.55",
    margin: "0 0 24px",
  },
  order: {
    backgroundColor: "#fafafa",
    border: "1px solid #e4e4e7",
    borderRadius: "8px",
    margin: "18px 0 0",
    padding: "18px",
  },
  orderTitle: {
    color: "#18181b",
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 6px",
  },
  meta: {
    color: "#71717a",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 16px",
  },
  ctaButton: {
    backgroundColor: "#f59e0b",
    borderRadius: "8px",
    color: "#18181b",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "700",
    padding: "12px 18px",
    textDecoration: "none",
  },
  itemWrap: {
    borderTop: "1px solid #e4e4e7",
    margin: "18px 0 0",
    padding: "4px 0 0",
  },
  itemRow: {
    borderBottom: "1px solid #e4e4e7",
    padding: "14px 0",
  },
  itemPhotoCol: {
    verticalAlign: "top",
    width: "72px",
  },
  itemName: {
    color: "#18181b",
    fontSize: "14px",
    fontWeight: "650",
    margin: "0 0 3px",
  },
  itemMeta: {
    color: "#71717a",
    fontSize: "13px",
    margin: "0",
  },
  note: {
    color: "#71717a",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "24px 0 0",
  },
  hr: {
    borderColor: "#e4e4e7",
    margin: "24px 0 0",
  },
  footer: {
    borderTop: "1px solid #f4f4f5",
    padding: "20px 32px",
    textAlign: "center" as const,
  },
  footerText: {
    color: "#a1a1aa",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: "0 0 6px",
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
            <DabPalEmailLogo />
          </Section>

          <Section style={S.content}>
            <Text style={S.eyebrow}>Ops reminder</Text>
            <Text style={S.h1}>Orders waiting on labels</Text>
            <Text style={S.subtitle}>
              {count} order{count === 1 ? "" : "s"} still need a label or shipment scan. Customer details stay in Medusa.
            </Text>

            {orders.map((order) => {
              const openDays = daysOpen(order.created_at)
              const orderUrl = `https://admin.thedabpal.com/app/orders/${order.id}`
              const metaParts = [
                openDays !== null ? `${openDays} day${openDays === 1 ? "" : "s"} open` : null,
                order.fulfillment_status ? order.fulfillment_status.replace("_", " ") : null,
              ].filter(Boolean)

              return (
                <Section key={order.id} style={S.order}>
                  <Text style={S.orderTitle}>
                    <Link href={orderUrl} style={S.link}>Order #{order.display_id || order.id}</Link>
                  </Text>
                  {metaParts.length > 0 ? (
                    <Text style={S.meta}>{metaParts.join(" · ")}</Text>
                  ) : null}

                  <Button href={orderUrl} style={S.ctaButton}>
                    Open in admin
                  </Button>

                  <Section style={S.itemWrap}>
                    {(order.items || [])
                      .filter((item) => itemRemaining(item) > 0)
                      .map((item, index, items) => {
                        const isLast = index === items.length - 1

                        return (
                          <Row
                            key={`${order.id}-${index}`}
                            style={{
                              ...S.itemRow,
                              borderBottom: isLast ? "0" : S.itemRow.borderBottom,
                            }}
                          >
                            <Column style={S.itemPhotoCol}>
                              <DabPalProductImage variantTitle={item.title || item.variant_sku} />
                            </Column>
                            <Column>
                              <Text style={S.itemName}>Dab Pal</Text>
                              <Text style={S.itemMeta}>
                                {cleanTitle(item)} x {itemRemaining(item)}
                              </Text>
                            </Column>
                          </Row>
                        )
                      })}
                  </Section>
                </Section>
              )
            })}

            <Hr style={S.hr} />
            <Text style={S.note}>
              This internal reminder only includes operational order status. Use the admin link for shipping address and label work.
            </Text>
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
            <Text style={{ ...S.footerText, margin: 0 }}>
              <Link href="https://admin.thedabpal.com/app" style={S.link}>Medusa admin</Link>
              {" · "}
              <Link href="https://thedabpal.com" style={S.link}>thedabpal.com</Link>
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
        first_name: "Customer",
        last_name: null,
        city: "Oak Creek",
        province: "WI",
        postal_code: null,
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
