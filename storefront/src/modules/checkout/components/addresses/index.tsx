"use client"

import { CheckCircleSolid } from "@medusajs/icons"
import { Heading, Text, useToggleState } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { useFormState } from "react-dom"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isAddressComplete = hasCompleteShippingAddress(cart)
  const isOpen = searchParams.get("step") === "address" || !isAddressComplete

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useFormState(setAddresses, null)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
        >
          Shipping Address
          {!isOpen && isAddressComplete && <CheckCircleSolid />}
        </Heading>
        {!isOpen && isAddressComplete && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-address-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <Heading
                  level="h2"
                  className="text-3xl-regular gap-x-4 pb-6 pt-8"
                >
                  Billing address
                </Heading>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6" data-testid="submit-address-button">
              Continue to delivery
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && isAddressComplete ? (
              <div
                className="grid grid-cols-1 small:grid-cols-3 gap-y-6 small:gap-x-6"
              >
                <div
                  className="flex flex-col"
                  data-testid="shipping-address-summary"
                >
                  <Text className="txt-medium-plus text-ui-fg-base mb-1">
                    Shipping Address
                  </Text>
                  <AddressLines a={cart.shipping_address} />
                </div>

                <div
                  className="flex flex-col min-w-0"
                  data-testid="shipping-contact-summary"
                >
                  <Text className="txt-medium-plus text-ui-fg-base mb-1">
                    Contact
                  </Text>
                  {cart.email && (
                    <Text className="txt-medium text-ui-fg-subtle break-all">
                      {cart.email}
                    </Text>
                  )}
                  {cart.shipping_address.phone && (
                    <Text className="txt-medium text-ui-fg-subtle">
                      {formatPhone(cart.shipping_address.phone)}
                    </Text>
                  )}
                </div>

                <div
                  className="flex flex-col"
                  data-testid="billing-address-summary"
                >
                  <Text className="txt-medium-plus text-ui-fg-base mb-1">
                    Billing Address
                  </Text>

                  {sameAsBilling ? (
                    <Text className="txt-medium text-ui-fg-subtle">
                      Same as shipping address.
                    </Text>
                  ) : (
                    <AddressLines a={cart.billing_address} />
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Addresses

function hasCompleteShippingAddress(cart: HttpTypes.StoreCart | null) {
  const address = cart?.shipping_address

  return Boolean(
    cart?.email &&
      address?.first_name &&
      address?.last_name &&
      address?.address_1 &&
      address?.city &&
      address?.province &&
      address?.postal_code &&
      address?.country_code
  )
}

/**
 * US-format address block: name / line1 / line2 / city, state ZIP / country.
 * Skips empty lines so we don't print blank rows.
 */
function AddressLines({
  a,
}: {
  a:
    | HttpTypes.StoreCart["shipping_address"]
    | HttpTypes.StoreCart["billing_address"]
    | null
    | undefined
}) {
  if (!a) return null
  const name = [a.first_name, a.last_name].filter(Boolean).join(" ")
  const cityLine = [
    a.city,
    [a.province, a.postal_code].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ")
  const country = a.country_code?.toUpperCase() || ""

  return (
    <>
      {name && (
        <Text className="txt-medium text-ui-fg-subtle">{name}</Text>
      )}
      {a.address_1 && (
        <Text className="txt-medium text-ui-fg-subtle">{a.address_1}</Text>
      )}
      {a.address_2 && (
        <Text className="txt-medium text-ui-fg-subtle">{a.address_2}</Text>
      )}
      {cityLine && (
        <Text className="txt-medium text-ui-fg-subtle">{cityLine}</Text>
      )}
      {country && (
        <Text className="txt-medium text-ui-fg-subtle">{country}</Text>
      )}
    </>
  )
}

/**
 * Lightweight US phone formatter: 9709034747 -> (970) 903-4747.
 * Falls back to the raw value for anything that doesn't match.
 */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D+/g, "")
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return raw
}
