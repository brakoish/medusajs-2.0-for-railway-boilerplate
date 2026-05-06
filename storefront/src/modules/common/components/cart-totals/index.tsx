"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    item_subtotal?: number | null
    item_total?: number | null
    tax_total?: number | null
    shipping_total?: number | null
    shipping_subtotal?: number | null
    shipping_tax_total?: number | null
    discount_total?: number | null
    gift_card_total?: number | null
    currency_code: string
  }
}

/**
 * Customer-facing cart / order summary totals.
 *
 * Notes on Medusa's data model that drive the math here:
 *
 * - `subtotal` on Order objects rolls in the shipping subtotal, so the
 *   raw value would mislabel "Subtotal (excl. shipping and taxes)".
 *   We use `item_subtotal` (items-only, pre-tax, pre-discount) instead.
 *
 * - `discount_total` rolls in the tax-portion that was eliminated alongside
 *   the items-portion. On a 95%-off $25 cart in NY it returns $25.86,
 *   which looks broken to a customer ("how is the discount more than the
 *   subtotal?"). We show only the items-portion of the discount.
 *
 * - `shipping_total` on Order objects is tax-inclusive. We split it into
 *   a Shipping line (subtotal) and roll its tax into the Taxes line so
 *   each row reads cleanly and the math still ties to the total.
 *
 * - The Taxes line shows total tax owed (items + shipping), which is what
 *   buyers expect on a receipt. Splitting it further reads as accountant-y.
 */
const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    subtotal,
    item_subtotal,
    item_total,
    tax_total,
    shipping_total,
    shipping_subtotal,
    shipping_tax_total,
    discount_total,
    gift_card_total,
  } = totals

  // Items only, pre-tax, pre-discount.
  const itemsSub = item_subtotal ?? subtotal ?? 0

  // Compute the items-only portion of the discount.
  // item_total = items × (1 + taxRate) × (1 - discountRate), so
  //   itemsDiscount = item_subtotal - (item_total - itemTax)
  // Order-level tax_total includes shipping tax, so subtract that out
  // to isolate the per-item tax for the formula above.
  const orderTax = tax_total ?? 0
  const shipTax = shipping_tax_total ?? 0
  const itemTax = Math.max(0, orderTax - shipTax)
  const itemTotal = item_total ?? itemsSub
  const itemsDiscount = Math.max(0, itemsSub - (itemTotal - itemTax))
  // Fall back to discount_total only when we can't compute the items-only
  // value (e.g. partially-populated payload).
  const displayDiscount = itemsDiscount || discount_total || 0

  // Shipping pre-tax. On Order objects, shipping_total is tax-inclusive;
  // shipping_subtotal is the pre-tax shipping. Carts before a method is
  // selected return 0 for both, which is fine.
  const shippingSub = shipping_subtotal ?? shipping_total ?? 0

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span className="flex gap-x-1 items-center">
            Subtotal (excl. shipping and taxes)
          </span>
          <span data-testid="cart-subtotal" data-value={itemsSub}>
            {convertToLocale({ amount: itemsSub, currency_code })}
          </span>
        </div>
        {!!displayDiscount && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={displayDiscount}
            >
              -{" "}
              {convertToLocale({ amount: displayDiscount, currency_code })}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span data-testid="cart-shipping" data-value={shippingSub}>
            {convertToLocale({ amount: shippingSub, currency_code })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center ">Taxes</span>
          <span data-testid="cart-taxes" data-value={orderTax}>
            {convertToLocale({ amount: orderTax, currency_code })}
          </span>
        </div>
        {!!gift_card_total && (
          <div className="flex items-center justify-between">
            <span>Gift card</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-gift-card-amount"
              data-value={gift_card_total || 0}
            >
              -{" "}
              {convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>Total</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
