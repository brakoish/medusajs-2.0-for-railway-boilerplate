"use client"

import { Popover, Transition } from "@headlessui/react"
import { Button } from "@medusajs/ui"
import { ShoppingCart } from "@medusajs/icons"
import { usePathname, useRouter } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"
import { subscribeToCartChange } from "@lib/util/cart-events"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)
  const router = useRouter()

  // The nav lives in the layout, so server-action revalidateTag("cart")
  // doesn't refresh it. When client code dispatches a cart-change event
  // (after add/remove/update), force a server-component refresh so the
  // CartButton re-renders with the new count.
  useEffect(() => {
    return subscribeToCartChange(() => {
      router.refresh()
    })
  }, [router])

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  // On desktop the icon doubles as a hover-trigger for the dropdown
  // preview. On mobile (no hover) we want a plain tap-to-navigate link to
  // /cart — standard mobile pattern, no hidden popover swallowing the tap.
  const cartIconChildren = (
    <>
      <span className="hidden small:inline">Cart</span>
      <ShoppingCart aria-hidden="true" />
      <span aria-hidden="true">({totalItems})</span>
    </>
  )

  const cartIconClass = "studio-cart-link"

  return (
    <div className="h-full z-50">
      {/* MOBILE: plain link to /cart, no popover. Hidden on desktop. */}
      <LocalizedClientLink
        href="/cart"
        data-testid="nav-cart-link-mobile"
        aria-label={`Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
        className={`small:hidden ${cartIconClass}`}
      >
        {cartIconChildren}
      </LocalizedClientLink>

      {/* DESKTOP: hover-trigger popover with cart preview. */}
      <div
        className="hidden small:block h-full"
        onMouseEnter={openAndCancel}
        onMouseLeave={close}
      >
      <Popover className="relative h-full">
        {/* Plain link — hover on the parent div handles popover open/close,
            so we don't need Popover.Button toggling on click. */}
        <LocalizedClientLink
          href="/cart"
          data-testid="nav-cart-link"
          aria-label={`Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
          className={cartIconClass}
        >
          {cartIconChildren}
        </LocalizedClientLink>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel
            static
            className="absolute top-[calc(100%+1px)] right-0 bg-white border-x border-b border-gray-200 w-[420px] text-ui-fg-base"
            data-testid="nav-cart-dropdown"
          >
            <div className="p-4 flex items-center justify-center">
              <h3 className="text-large-semi">Cart</h3>
            </div>
            {cartState && cartState.items?.length ? (
              <>
                <div className="overflow-y-scroll max-h-[402px] px-4 grid grid-cols-1 gap-y-8 no-scrollbar p-px">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="grid grid-cols-[122px_1fr] gap-x-4"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={item.variant?.sku?.startsWith("DABPAL-WHT") ? "/store/white-speck" : item.variant?.sku?.startsWith("DABPAL-BLK") ? "/store/black-speck" : "/store"}
                          className="w-24"
                        >
                          <Thumbnail
                            alt={`${item.variant?.sku?.startsWith("DABPAL-WHT") ? "Marble" : "Slate"} Dab Pal`}
                            thumbnail={
                              item.variant?.thumbnail ||
                              item.variant?.product?.thumbnail
                            }
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="flex flex-col justify-between flex-1">
                          <div className="flex flex-col flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                <h3 className="text-base-regular overflow-hidden text-ellipsis">
                                  <LocalizedClientLink
                                    href={item.variant?.sku?.startsWith("DABPAL-WHT") ? "/store/white-speck" : item.variant?.sku?.startsWith("DABPAL-BLK") ? "/store/black-speck" : "/store"}
                                    data-testid="product-link"
                                  >
                                    {item.title}
                                  </LocalizedClientLink>
                                </h3>
                                <LineItemOptions
                                  variant={item.variant}
                                  metadata={item.metadata}
                                  data-testid="cart-item-variant"
                                  data-value={item.variant}
                                />
                                <span
                                  data-testid="cart-item-quantity"
                                  data-value={item.quantity}
                                >
                                  Quantity: {item.quantity}
                                </span>
                              </div>
                              <div className="flex justify-end">
                                <LineItemPrice item={item} style="tight" />
                              </div>
                            </div>
                          </div>
                          <DeleteButton
                            id={item.id}
                            className="mt-1"
                            data-testid="cart-item-remove-button"
                          >
                            Remove
                          </DeleteButton>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-4 flex flex-col gap-y-4 text-small-regular">
                  <div className="flex items-center justify-between">
                    <span className="text-ui-fg-base font-semibold">
                      Subtotal{" "}
                      <span className="font-normal">(excl. taxes)</span>
                    </span>
                    <span
                      className="text-large-semi"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <LocalizedClientLink href="/cart" passHref>
                    <Button
                      className="w-full"
                      size="large"
                      data-testid="go-to-cart-button"
                    >
                      Go to cart
                    </Button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div>
                <div className="flex py-16 flex-col gap-y-4 items-center justify-center">
                  <div className="bg-gray-900 text-small-regular flex items-center justify-center w-6 h-6 rounded-full text-white">
                    <span>0</span>
                  </div>
                  <span>Your cart is empty.</span>
                  <div>
                    <LocalizedClientLink href="/">
                      <>
                        <span className="sr-only">Continue shopping</span>
                        <Button onClick={close}>Continue shopping</Button>
                      </>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
      </div>
    </div>
  )
}

export default CartDropdown
