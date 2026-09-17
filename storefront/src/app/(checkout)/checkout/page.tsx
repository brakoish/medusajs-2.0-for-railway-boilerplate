import CommerceEvent from "@modules/common/components/commerce-event"
import { Metadata } from "next"
import { redirect } from "next/navigation"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { enrichLineItems, retrieveCart, updateCart } from "@lib/data/cart"
import { expandPromotionCodes } from "@lib/util/promotion-codes"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

// Auth/cookie-gated, must render per-request.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Checkout",
}

type CheckoutProps = {
  searchParams?: Promise<{
    promo_code?: string | string[]
  }>
}

const getQueryValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value

const applyPromoFromQuery = async (
  cart: HttpTypes.StoreCart,
  promoCode?: string
) => {
  const normalizedCode = promoCode?.trim().toUpperCase()
  if (!normalizedCode) {
    return cart
  }

  const existingCodes = (cart.promotions || [])
    .map((promotion) => promotion.code)
    .filter((code): code is string => Boolean(code))

  if (existingCodes.includes(normalizedCode)) {
    return cart
  }

  try {
    return await updateCart(
      { promo_codes: expandPromotionCodes([...existingCodes, normalizedCode]) },
      cart.id
    )
  } catch {
    return cart
  }
}

const fetchCart = async (promoCode?: string) => {
  const cart = await retrieveCart()
  if (!cart?.items?.length) {
    return redirect("/cart")
  }

  const cartWithPromo = await applyPromoFromQuery(cart, promoCode)

  if (cartWithPromo?.items?.length) {
    const enrichedItems = await enrichLineItems(
      cartWithPromo.items,
      cartWithPromo.region_id!
    )
    cartWithPromo.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  return cartWithPromo
}

export default async function Checkout({ searchParams }: CheckoutProps) {
  const params = await searchParams
  const cart = await fetchCart(getQueryValue(params?.promo_code))
  const customer = await getCustomer()

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-6 small:gap-12 py-6 small:py-12">
      <CommerceEvent event="begin_checkout" value={cart.total ?? 0} currency={cart.currency_code} sessionKey={cart.id} />
      <h1 className="text-3xl font-semibold small:col-span-2">Checkout</h1>
      <div className="small:col-start-2 small:row-start-2"><CheckoutSummary cart={cart} /></div>
      <div className="small:col-start-1 small:row-start-2"><Wrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </Wrapper></div>
    </div>
  )
}
