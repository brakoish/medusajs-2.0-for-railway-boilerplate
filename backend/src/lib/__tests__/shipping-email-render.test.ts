import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { OrderPlacedTemplate } from "../../modules/email-notifications/templates/order-placed"

test("confirmation HTML identifies Marble, Slate packs, and the correct photos in a mixed order", () => {
  const order: any = {
    id: "order-fixture", display_id: "LOCAL", currency_code: "usd",
    summary: { raw_current_order_total: { value: 90 } },
    items: [
      { id: "line1", variant_sku: "DABPAL-WHT-SINGLE", variant_title: "Single", quantity: 1, unit_price: 25 },
      { id: "line2", variant_sku: "DABPAL-BLK-3PACK", variant_title: "3-Pack", quantity: 1, unit_price: 65 },
    ],
  }
  const html = renderToStaticMarkup(React.createElement(OrderPlacedTemplate, {
    order, shippingAddress: { first_name: "Local", address_1: "Fixture", address_2: "Apartment 4B" } as any,
  }))
  expect(html).toContain("Marble Dab Pal")
  expect(html).toContain("Slate Dab Pal")
  expect(html).toContain("3-Pack")
  expect(html).toContain("product-front-white.jpg")
  expect(html).toContain("product-front.png")
  expect(html).toContain("Apartment 4B")
  expect(html).toContain("3-5 business days")
  expect(html).not.toContain("2-3 business days")
})
