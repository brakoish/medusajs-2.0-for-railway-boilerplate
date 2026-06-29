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

export const ABANDONED_CART = "abandoned-cart"

export type AbandonedCartItem = {
  id?: string | null
  title?: string | null
  variant_title?: string | null
  quantity?: number | string | null
  unit_price?: number | string | null
}

export interface AbandonedCartTemplateProps {
  firstName?: string | null
  cartUrl: string
  unsubscribeUrl: string
  items: AbandonedCartItem[]
  subtotal?: number | string | null
  currencyCode?: string | null
  discountCode?: string | null
  discountPercent?: number | string | null
  preview?: string
}

export const isAbandonedCartTemplateData = (
  data: unknown
): data is AbandonedCartTemplateProps => {
  if (!data || typeof data !== "object") return false

  const candidate = data as Partial<AbandonedCartTemplateProps>
  return (
    typeof candidate.cartUrl === "string" &&
    typeof candidate.unsubscribeUrl === "string" &&
    Array.isArray(candidate.items)
  )
}

const fmt = (amount?: number | string | null, currency = "usd") => {
  const value = Number(amount ?? 0)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number.isFinite(value) ? value : 0)
}

const cleanTitle = (item: AbandonedCartItem) => {
  const variant = item.variant_title || item.title || "Dab Pal"
  return variant.replace(" / ", ", ")
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
  bodyPad: {
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
  ctaButton: {
    backgroundColor: "#f59e0b",
    borderRadius: "8px",
    color: "#18181b",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: "700",
    padding: "14px 22px",
    textDecoration: "none",
  },
  offerBox: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    margin: "24px 0 0",
    padding: "16px 18px",
  },
  offerText: {
    color: "#52525b",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 10px",
  },
  offerCode: {
    backgroundColor: "#18181b",
    borderRadius: "6px",
    color: "#f59e0b",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    margin: "0",
    padding: "9px 12px",
  },
  itemWrap: {
    backgroundColor: "#fafafa",
    border: "1px solid #e4e4e7",
    borderRadius: "8px",
    margin: "28px 0 0",
    padding: "6px 18px",
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
  itemPrice: {
    color: "#18181b",
    fontSize: "14px",
    fontWeight: "650",
    margin: "0",
    textAlign: "right" as const,
  },
  total: {
    color: "#18181b",
    fontSize: "16px",
    fontWeight: "700",
    margin: "18px 0 0",
    textAlign: "right" as const,
  },
  note: {
    color: "#71717a",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "22px 0 0",
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

export const AbandonedCartTemplate: React.FC<AbandonedCartTemplateProps> & {
  PreviewProps: AbandonedCartTemplateProps
} = ({
  firstName,
  cartUrl,
  unsubscribeUrl,
  items,
  subtotal,
  currencyCode = "usd",
  discountCode,
  discountPercent,
  preview,
}) => {
  const greeting = firstName ? `${firstName}, future you wants this.` : "Future you wants this."
  const previewText = preview || "Your cart saved the cleanup kit."

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={S.body}>
        <Container style={S.container}>
          <Section style={S.header}>
            <DabPalEmailLogo />
          </Section>

          <Section style={S.bodyPad}>
            <Text style={S.eyebrow}>Still in your cart</Text>
            <Text style={S.h1}>{greeting}</Text>
            <Text style={S.subtitle}>
              One pocket-size kit, clean swabs on one side, used swabs on the other, and no more digging around when the rig needs a reset.
            </Text>

            <Button href={cartUrl} style={S.ctaButton}>
              Finish checkout
            </Button>

            {discountCode && discountPercent && (
              <Section style={S.offerBox}>
                <Text style={S.offerText}>
                  Tiny nudge from future you: use this for {discountPercent}% off your kit.
                </Text>
                <Text style={S.offerCode}>{discountCode}</Text>
              </Section>
            )}

            <Section style={S.itemWrap}>
              {items.map((item, index) => {
                const quantity = Number(item.quantity ?? 1) || 1
                const unitPrice = Number(item.unit_price ?? 0) || 0
                const isLast = index === items.length - 1

                return (
                  <Row
                    key={item.id || `${item.title}-${index}`}
                    style={{
                      ...S.itemRow,
                      borderBottom: isLast ? "0" : S.itemRow.borderBottom,
                    }}
                  >
                    <Column style={S.itemPhotoCol}>
                      <DabPalProductImage variantTitle={item.variant_title || item.title} />
                    </Column>
                    <Column>
                      <Text style={S.itemName}>Dab Pal</Text>
                      <Text style={S.itemMeta}>
                        {cleanTitle(item)} x {quantity}
                      </Text>
                    </Column>
                    <Column style={{ width: "86px", verticalAlign: "top" }}>
                      <Text style={S.itemPrice}>{fmt(unitPrice * quantity, currencyCode || "usd")}</Text>
                    </Column>
                  </Row>
                )
              })}
            </Section>

            <Text style={S.total}>Subtotal: {fmt(subtotal, currencyCode || "usd")}</Text>

            <Hr style={{ borderColor: "#e4e4e7", margin: "24px 0 0" }} />
            <Text style={S.note}>
              Made in Brooklyn. Ships in 2-3 business days. Your next cleanup does not have to be a whole thing.
            </Text>
          </Section>

          <Section style={S.footer}>
            <Text style={S.footerText}>Need anything? DM us on Instagram</Text>
            <Text style={S.footerText}>
              <Link href="https://instagram.com/nslabs_" style={S.link}>@nslabs_</Link>
              {" · "}
              <Link href="https://thedabpal.com" style={S.link}>thedabpal.com</Link>
            </Text>
            <Text style={{ ...S.footerText, margin: 0 }}>
              No longer want these emails?{" "}
              <Link href={unsubscribeUrl} style={S.link}>Unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

AbandonedCartTemplate.PreviewProps = {
  firstName: "Ashley",
  cartUrl: "https://thedabpal.com/checkout?cart_id=cart_123&promo_code=DABBACK10",
  unsubscribeUrl: "https://backend-production-2b05.up.railway.app/marketing/unsubscribe?email=ashley@example.com&token=test",
  currencyCode: "usd",
  subtotal: 25,
  discountCode: "DABBACK10",
  discountPercent: 10,
  items: [
    {
      id: "item_1",
      title: "Dab Pal",
      variant_title: "Single / White Speck",
      quantity: 1,
      unit_price: 25,
    },
  ],
  preview: "Your cart saved the cleanup kit.",
}

export default AbandonedCartTemplate
