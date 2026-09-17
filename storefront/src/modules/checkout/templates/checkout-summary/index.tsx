"use client"

import { useState } from "react"
import { convertToLocale } from "@lib/util/money"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import Thumbnail from "@modules/products/components/thumbnail"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const [isOpen, setIsOpen] = useState(false)
  const itemCount = cart.items?.reduce((count, item) => count + item.quantity, 0) || 0
  const shippingPending = !cart.shipping_methods?.length

  return (
    <section className="studio-checkout-summary small:sticky small:top-6" aria-label="Order summary">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-4 text-left small:hidden"
        aria-expanded={isOpen}
        aria-controls="checkout-summary-details"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          Order summary ({itemCount})
          <ChevronDown size={16} className={isOpen ? "rotate-180" : ""} />
        </span>
        <span className="text-right shrink-0">
          <span className="block text-base font-semibold">{convertToLocale({ amount: cart.total ?? 0, currency_code: cart.currency_code })}</span>
          <span className="block text-xs text-ui-fg-subtle">{shippingPending ? "Estimated total" : "Total"}</span>
        </span>
      </button>
      <div id="checkout-summary-details" className={`${isOpen ? "block" : "hidden"} px-4 pb-4 small:block small:p-6`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="hidden small:block">Order summary</h2>
          <LocalizedClientLink href="/cart" className="text-sm underline underline-offset-4 py-2">Edit cart</LocalizedClientLink>
        </div>
        <ul className="flex flex-col gap-4 mb-5" data-testid="items-table">
          {cart.items?.map((item) => (
            <li key={item.id} className="flex items-start gap-3" data-testid="product-row">
              <div className="w-14 shrink-0">
                <Thumbnail alt="Dab Pal" thumbnail={item.variant?.thumbnail || item.thumbnail || item.variant?.product?.thumbnail} size="square" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold" data-testid="product-title">Dab Pal</p>
                <LineItemOptions variant={item.variant} metadata={item.metadata} data-testid="product-variant" />
                <p className="text-ui-fg-subtle mt-1">Qty {item.quantity}</p>
              </div>
              <div className="shrink-0"><LineItemPrice item={item} style="tight" /></div>
            </li>
          ))}
        </ul>
        <CartTotals totals={cart} shippingPending={shippingPending} />
        <div className="mt-2"><DiscountCode cart={cart} /></div>
      </div>
    </section>
  )
}

export default CheckoutSummary
