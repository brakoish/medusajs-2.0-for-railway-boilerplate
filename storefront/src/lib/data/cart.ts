"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { omit } from "lodash"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthHeaders, getCartId, removeCartId, setCartId } from "./cookies"
import { getProductsById } from "./products"
import { getRegion } from "./regions"

export async function retrieveCartById(cartId: string) {
  return await sdk.store.cart
    .retrieve(cartId, {}, { next: { tags: ["cart"] }, ...(await getAuthHeaders()) })
    .then(({ cart }) => cart)
    .catch(() => null)
}

export async function retrieveCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return null
  }

  return await sdk.store.cart
    .retrieve(cartId, {}, { next: { tags: ["cart"] }, ...(await getAuthHeaders()) })
    .then(({ cart }) => cart)
    .catch(() => {
      return null
    })
}

export async function getOrSetCart(countryCode: string) {
  let cart = await retrieveCart()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (!cart) {
    const cartResp = await sdk.store.cart.create({ region_id: region.id })
    cart = cartResp.cart
    await setCartId(cart.id)
    revalidateTag("cart")
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(
      cart.id,
      { region_id: region.id },
      {},
      await getAuthHeaders()
    )
    revalidateTag("cart")
  }

  return cart
}

export async function updateCart(
  data: HttpTypes.StoreUpdateCart,
  cartId?: string
) {
  const id = cartId || (await getCartId())
  if (!id) {
    throw new Error("No existing cart found, please create one before updating")
  }

  return sdk.store.cart
    .update(id, data, {}, await getAuthHeaders())
    .then(({ cart }) => {
      revalidateTag("cart")
      return cart
    })
    .catch(medusaError)
}

/**
 * Light-weight totals preview for the Apple Pay / Google Pay wallet sheet.
 *
 * Stripe's ExpressCheckoutElement fires onShippingAddressChange with a
 * partial address (postal_code, state, country — enough for tax). We
 * mirror that into the Medusa cart, optionally lock in a shipping method,
 * then read tax_total / shipping_total / total from the recomputed cart.
 *
 * The cart mutation is intentional: if the buyer cancels the wallet, the
 * abandoned cart now has better data (real address, real tax). The next
 * page load recomputes against any new info.
 *
 * Returns dollars (Medusa 2.x decimal). Caller multiplies by 100 for
 * Stripe.
 */
export async function previewWalletTotals({
  cartId: providedCartId,
  shippingAddress,
  shippingMethodId,
}: {
  cartId?: string
  shippingAddress: {
    address_1?: string
    address_2?: string
    city?: string
    province?: string
    postal_code?: string
    country_code?: string
  }
  shippingMethodId?: string
}) {
  const cartId = providedCartId || (await getCartId())
  if (!cartId) {
    throw new Error("No existing cart found for wallet preview")
  }

  // 1. Push the partial address. Medusa accepts a partial shipping_address
  //    on update; the tax engine only needs country/province/postal_code.
  await sdk.store.cart
    .update(
      cartId,
      {
        shipping_address: {
          first_name: "Wallet",
          last_name: "Preview",
          address_1: shippingAddress.address_1 || "",
          address_2: shippingAddress.address_2 || "",
          city: shippingAddress.city || "",
          province: shippingAddress.province || "",
          postal_code: shippingAddress.postal_code || "",
          country_code: (shippingAddress.country_code || "us").toLowerCase(),
        } as any,
      },
      {},
      await getAuthHeaders()
    )
    .catch(medusaError)

  // 2. Optional: lock in a shipping method so tax + shipping line up in
  //    the wallet sheet. Stripe's onShippingRateChange gives us this.
  if (shippingMethodId) {
    await sdk.store.cart
      .addShippingMethod(
        cartId,
        { option_id: shippingMethodId },
        {},
        await getAuthHeaders()
      )
      .catch(medusaError)
  }

  // 3. Read back. revalidateTag would force a full route refresh; we
  //    skip it here because the wallet flow is ephemeral and we want
  //    the freshest cart for the preview only.
  const { cart } = await sdk.store.cart.retrieve(
    cartId,
    {},
    await getAuthHeaders()
  )

  // Use *_subtotal fields (which exclude tax) for line-item display, and
  // total (which includes tax) for the wallet's grand total. Medusa's
  // shipping_total / item_total mix tax in, so they don't sum cleanly.
  const c = cart as any
  return {
    item_subtotal: (c.item_subtotal as number) ?? (c.subtotal as number) ?? 0,
    shipping_subtotal: (c.shipping_subtotal as number) ?? 0,
    tax_total: (c.tax_total as number) ?? 0,
    total: (c.total as number) ?? 0,
    currency_code: (c.currency_code as string) || "usd",
  }
}

/**
 * Create a throw-away cart for the PDP "Buy Now" wallet flow.
 *
 * Deliberately does NOT set the session cart cookie — the user's real
 * cart is left untouched. Returns just the cart id so the wallet
 * handlers can operate against it directly.
 */
export async function createBuyNowCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}): Promise<string> {
  const region = await getRegion(countryCode)
  if (!region) throw new Error(`Region not found for country code: ${countryCode}`)

  const { cart } = await sdk.store.cart.create(
    { region_id: region.id },
    {},
    await getAuthHeaders()
  )

  await sdk.store.cart.createLineItem(
    cart.id,
    { variant_id: variantId, quantity },
    {},
    await getAuthHeaders()
  )

  return cart.id
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)
  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      await getAuthHeaders()
    )
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, await getAuthHeaders())
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, await getAuthHeaders())
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
  revalidateTag("cart")
}

export async function enrichLineItems(
  lineItems:
    | HttpTypes.StoreCartLineItem[]
    | HttpTypes.StoreOrderLineItem[]
    | null,
  regionId: string
) {
  if (!lineItems) return []

  // Prepare query parameters
  const queryParams = {
    ids: lineItems.map((lineItem) => lineItem.product_id!),
    regionId: regionId,
  }

  // Fetch products by their IDs
  const products = await getProductsById(queryParams)
  // If there are no line items or products, return an empty array
  if (!lineItems?.length || !products) {
    return []
  }

  // Enrich line items with product and variant information
  const enrichedItems = lineItems.map((item) => {
    const product = products.find((p: any) => p.id === item.product_id)
    const variant = product?.variants?.find(
      (v: any) => v.id === item.variant_id
    )

    // If product or variant is not found, return the original item
    if (!product || !variant) {
      return item
    }

    // If product and variant are found, enrich the item
    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, "variants"),
      },
    }
  }) as HttpTypes.StoreCartLineItem[]

  return enrichedItems
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  return sdk.store.cart
    .addShippingMethod(
      cartId,
      { option_id: shippingMethodId },
      {},
      await getAuthHeaders()
    )
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: {
    provider_id: string
    context?: Record<string, unknown>
    data?: Record<string, unknown>
  }
) {
  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, await getAuthHeaders())
    .then((resp) => {
      revalidateTag("cart")
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found")
  }

  await updateCart({ promo_codes: codes })
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`
  )
}

export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())
  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, await getAuthHeaders())
    .then((cartRes) => {
      revalidateTag("cart")
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()
    // Only clear the session cart cookie if this was the session cart.
    if (!cartId) await removeCartId()
    redirect(`/order/confirmed/${cartRes?.order.id}`)
  }

  return cartRes.cart
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    revalidateTag("cart")
  }

  revalidateTag("regions")
  revalidateTag("products")

  redirect(`${currentPath}`)
}
