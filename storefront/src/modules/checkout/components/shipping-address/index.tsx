import { HttpTypes } from "@medusajs/types"
import { updateCartEmail } from "@lib/data/cart"
import { Container } from "@medusajs/ui"
import AddressAutocomplete from "@modules/checkout/components/address-autocomplete"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart]) // Add cart as a dependency

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleEmailBlur = () => {
    const email = String(formData.email || "").trim()
    if (!email) return

    updateCartEmail(email).catch(() => {
      /* email capture is best-effort and should not block checkout */
    })
  }

  // Auto-fill city + state from US zip via zippopotam.us (free, no key).
  // Quietly no-op on non-US or network errors so it never blocks checkout.
  const lookupZip = async (zip: string) => {
    const country = (formData["shipping_address.country_code"] || "us")
      .toString()
      .toLowerCase()
    if (country !== "us") return
    if (!/^\d{5}$/.test(zip)) return
    try {
      const r = await fetch(`https://api.zippopotam.us/us/${zip}`)
      if (!r.ok) return
      const j = await r.json()
      const place = j?.places?.[0]
      if (!place) return
      setFormData((prev: Record<string, any>) => ({
        ...prev,
        "shipping_address.city":
          prev["shipping_address.city"] || place["place name"] || "",
        "shipping_address.province":
          prev["shipping_address.province"] ||
          place["state abbreviation"] ||
          "",
      }))
    } catch {
      /* offline / blocked — skip silently */
    }
  }

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e)
    lookupZip(e.target.value)
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      {/* Email first: lets Stripe Link recognize returning shoppers and
          autofill the rest of the form once they tap the verify code. */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleEmailBlur}
          required
          data-testid="shipping-email-input"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <AddressAutocomplete
          label="Address"
          name="shipping_address.address_1"
          value={formData["shipping_address.address_1"] || ""}
          onChange={handleChange}
          countryCode={(formData["shipping_address.country_code"] || "us")
            .toString()
            .toLowerCase()}
          required
          data-testid="shipping-address-input"
          onSelect={(p) => {
            setFormData((prev: Record<string, any>) => ({
              ...prev,
              "shipping_address.address_1": p.line1 || prev["shipping_address.address_1"] || "",
              "shipping_address.city": p.city || prev["shipping_address.city"] || "",
              "shipping_address.province":
                p.province || prev["shipping_address.province"] || "",
              "shipping_address.postal_code":
                p.postalCode || prev["shipping_address.postal_code"] || "",
              "shipping_address.country_code": (
                p.country ||
                prev["shipping_address.country_code"] ||
                "us"
              ).toLowerCase(),
            }))
          }}
        />
        <Input
          label="Company"
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />
        <Input
          label="Postal code"
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData["shipping_address.postal_code"]}
          onChange={handleZipChange}
          required
          data-testid="shipping-postal-code-input"
        />
        <Input
          label="City"
          name="shipping_address.city"
          autoComplete="address-level2"
          value={formData["shipping_address.city"]}
          onChange={handleChange}
          required
          data-testid="shipping-city-input"
        />
        <CountrySelect
          name="shipping_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["shipping_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-country-select"
        />
        <Input
          label="State / Province"
          name="shipping_address.province"
          autoComplete="address-level1"
          value={formData["shipping_address.province"]}
          onChange={handleChange}
          required
          data-testid="shipping-province-input"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          label="Phone"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          data-testid="shipping-phone-input"
        />
      </div>
      <div className="my-8">
        <Checkbox
          label="Billing address same as shipping address"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
    </>
  )
}

export default ShippingAddress
