import { Text, Section, Hr, Link, Html, Head, Preview, Body, Container, Row, Column } from '@react-email/components'
import * as React from 'react'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_PLACED = 'order-placed'

interface OrderPlacedPreviewProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
  preview?: string
}

export const isOrderPlacedTemplateData = (data: any): data is OrderPlacedTemplateProps =>
  typeof data.order === 'object' && typeof data.shippingAddress === 'object'

const fmt = (amount: number, currency = 'usd') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

const S = {
  body: { backgroundColor: '#f4f4f5', fontFamily: 'Inter, -apple-system, sans-serif', margin: 0, padding: '40px 16px' },
  container: { backgroundColor: '#ffffff', borderRadius: '12px', maxWidth: '480px', margin: '0 auto', overflow: 'hidden' },
  header: { backgroundColor: '#18181b', padding: '28px 32px', textAlign: 'center' as const },
  wordmark: { color: '#f59e0b', fontSize: '22px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' as const, margin: '0' },
  body_pad: { padding: '32px 32px 24px' },
  h1: { fontSize: '20px', fontWeight: '600', color: '#18181b', margin: '0 0 8px' },
  subtitle: { fontSize: '14px', color: '#71717a', margin: '0 0 28px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#71717a', letterSpacing: '0.08em', textTransform: 'uppercase' as const, margin: '0 0 6px' },
  value: { fontSize: '14px', color: '#18181b', margin: '0 0 20px' },
  hr: { borderColor: '#e4e4e7', margin: '20px 0' },
  itemRow: { padding: '12px 0', borderBottom: '1px solid #f4f4f5' },
  itemName: { fontSize: '14px', color: '#18181b', margin: '0 0 2px', fontWeight: '500' },
  itemMeta: { fontSize: '13px', color: '#71717a', margin: '0' },
  itemPrice: { fontSize: '14px', color: '#18181b', fontWeight: '500', textAlign: 'right' as const },
  total: { fontSize: '16px', fontWeight: '600', color: '#18181b', textAlign: 'right' as const, margin: '16px 0 0' },
  badge: { backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: '500', padding: '6px 12px', borderRadius: '6px', display: 'inline-block', margin: '0 0 24px' },
  footer: { padding: '20px 32px', borderTop: '1px solid #f4f4f5', textAlign: 'center' as const },
  footerText: { fontSize: '12px', color: '#a1a1aa', margin: '0 0 4px' },
  link: { color: '#f59e0b', textDecoration: 'none' },
}

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({ order, shippingAddress, preview }) => {
  const firstName = shippingAddress.first_name || 'there'
  const total = order.summary?.raw_current_order_total?.value ?? 0
  const previewText = preview || `Your order is confirmed, ${firstName}. Ships in 2-3 business days.`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={S.body}>
        <Container style={S.container}>

          {/* Header */}
          <Section style={S.header}>
            <Text style={S.wordmark}>DAB PAL</Text>
          </Section>

          {/* Body */}
          <Section style={S.body_pad}>
            <Text style={S.h1}>Order confirmed</Text>
            <Text style={S.subtitle}>Thanks, {firstName}. We got it.</Text>

            <Text style={S.badge}>Ships in 2-3 business days from Brooklyn, NY</Text>

            {/* Order info */}
            <Text style={S.label}>Order</Text>
            <Text style={S.value}>#{order.display_id}</Text>

            {/* Items */}
            <Text style={S.label}>What you ordered</Text>
            {(order.items || []).map((item) => {
              const variantTitle = (item as any).variant_title || item.title || ''
              // Clean up "Single / Black Speck" → "Single, Black Speck"
              const cleanTitle = variantTitle.replace(' / ', ', ')
              return (
                <Row key={item.id} style={S.itemRow}>
                  <Column>
                    <Text style={S.itemName}>Dab Pal</Text>
                    <Text style={S.itemMeta}>{cleanTitle} &times; {item.quantity}</Text>
                  </Column>
                  <Column style={{ width: '80px', verticalAlign: 'top' }}>
                    <Text style={S.itemPrice}>{fmt(item.unit_price * item.quantity)}</Text>
                  </Column>
                </Row>
              )
            })}
            <Text style={S.total}>Total: {fmt(total)}</Text>

            <Hr style={S.hr} />

            {/* Shipping address */}
            <Text style={S.label}>Shipping to</Text>
            <Text style={{ ...S.value, margin: '0' }}>
              {shippingAddress.first_name} {shippingAddress.last_name}<br />
              {shippingAddress.address_1}
              {shippingAddress.address_2 ? `, ${shippingAddress.address_2}` : ''}<br />
              {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={S.footer}>
            <Text style={S.footerText}>Questions? DM us on Instagram</Text>
            <Text style={{ ...S.footerText, margin: '0 0 8px' }}>
              <Link href="https://instagram.com/thedabpal" style={S.link}>@thedabpal</Link>
            </Text>
            <Text style={{ ...S.footerText, margin: '0' }}>
              <Link href="https://thedabpal.com" style={S.link}>thedabpal.com</Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: '4',
    created_at: new Date().toISOString(),
    email: 'will@example.com',
    currency_code: 'usd',
    items: [
      { id: 'item-1', title: 'Single / Black Speck', variant_title: 'Single / Black Speck', product_title: 'Dab Pal', quantity: 1, unit_price: 25 },
    ],
    summary: { raw_current_order_total: { value: 32 } }
  },
  shippingAddress: {
    first_name: 'Chris',
    last_name: 'Cornwall',
    address_1: '123 Main St',
    city: 'Dublin',
    province: 'OH',
    postal_code: '43017',
    country_code: 'US'
  }
} as OrderPlacedPreviewProps

export default OrderPlacedTemplate
