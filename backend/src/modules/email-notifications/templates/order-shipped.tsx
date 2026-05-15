import { Text, Section, Hr, Link, Html, Head, Preview, Body, Container, Row, Column, Button } from '@react-email/components'
import * as React from 'react'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_SHIPPED = 'order-shipped'

export interface OrderShippedTemplateProps {
  order: OrderDTO & { display_id: string }
  shippingAddress: OrderAddressDTO
  trackingNumber: string
  trackingUrl?: string
  carrier?: string
  preview?: string
}

export const isOrderShippedTemplateData = (data: any): data is OrderShippedTemplateProps =>
  typeof data.order === 'object' &&
  typeof data.shippingAddress === 'object' &&
  typeof data.trackingNumber === 'string'

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
  trackingBox: { backgroundColor: '#fef3c7', borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px' },
  trackingLabel: { fontSize: '11px', fontWeight: '600', color: '#92400e', letterSpacing: '0.08em', textTransform: 'uppercase' as const, margin: '0 0 4px' },
  trackingNumber: { fontSize: '16px', fontWeight: '700', color: '#18181b', margin: '0 0 12px', letterSpacing: '0.02em' },
  ctaButton: { backgroundColor: '#f59e0b', borderRadius: '8px', color: '#18181b', fontSize: '14px', fontWeight: '600', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' },
  footer: { padding: '20px 32px', borderTop: '1px solid #f4f4f5', textAlign: 'center' as const },
  footerText: { fontSize: '12px', color: '#a1a1aa', margin: '0 0 4px' },
  link: { color: '#f59e0b', textDecoration: 'none' },
}

export const OrderShippedTemplate: React.FC<OrderShippedTemplateProps> = ({
  order,
  shippingAddress,
  trackingNumber,
  trackingUrl,
  carrier,
  preview,
}) => {
  const firstName = shippingAddress.first_name || 'there'
  const previewText = preview || `Your Dab Pal is on its way, ${firstName}.`
  const uspsTrackingUrl = trackingUrl || `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
  const carrierLabel = carrier ? carrier.toUpperCase() : 'USPS'

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
            <Text style={S.h1}>Your order shipped</Text>
            <Text style={S.subtitle}>
              It's on its way, {firstName}. Should arrive in a few days.
            </Text>

            {/* Tracking box */}
            <Section style={S.trackingBox}>
              <Text style={S.trackingLabel}>{carrierLabel} Tracking</Text>
              <Text style={S.trackingNumber}>{trackingNumber}</Text>
              {trackingUrl && (
                <Link href={uspsTrackingUrl} style={S.ctaButton}>
                  Track your package
                </Link>
              )}
            </Section>

            <Hr style={S.hr} />

            {/* Order + address */}
            <Text style={S.label}>Order</Text>
            <Text style={S.value}>#{order.display_id}</Text>

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
              <Link href="https://instagram.com/nslabs_" style={S.link}>@nslabs_</Link>
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

OrderShippedTemplate.defaultProps = {}

export default OrderShippedTemplate
