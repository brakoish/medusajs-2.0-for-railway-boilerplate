"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, ArrowRight } from "@medusajs/icons"
import { addToCart } from "@lib/data/cart"
import { dispatchCartChange } from "@lib/util/cart-events"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useAnalytics } from "@lib/util/analytics"

type Finish = {
  handle: string
  name: string
  image: string
  productId?: string
  variantId?: string
  amount: number | null
  currency: string
  available: boolean
}

export default function PalPickerClient({
  finishes,
  heading: Heading,
}: {
  finishes: Finish[]
  heading: "h1" | "h2"
}) {
  const [selected, setSelected] = useState(
    finishes.find((f) => f.available)?.handle || finishes[0]?.handle
  )
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [added, setAdded] = useState("")
  const posthog = useAnalytics()
  const finish = finishes.find((f) => f.handle === selected)
  const price =
    finish?.amount != null
      ? convertToLocale({
          amount: finish.amount,
          currency_code: finish.currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : null
  async function add() {
    if (!finish?.variantId || !finish.available || !price || pending) return
    setPending(true)
    setError("")
    setAdded("")
    try {
      await addToCart({
        variantId: finish.variantId,
        quantity: 1,
        countryCode: "us",
      })
      setAdded(finish.name)
      dispatchCartChange()
      posthog?.capture("add_to_cart", {
        product_id: finish.productId,
        variant_id: finish.variantId,
        quantity: 1,
        currency: finish.currency,
        value: finish.amount,
        source: "pick_your_pal",
      })
    } catch {
      setError("We couldn’t add this Pal. Please try again.")
    } finally {
      setPending(false)
    }
  }
  return (
    <section
      id="shop"
      className="studio-picker studio-container"
      aria-labelledby="picker-title"
    >
      <div className="studio-picker-copy">
        <Heading id="picker-title" className="studio-display">
          Pick your Pal.
        </Heading>
        <p className="studio-price">
          {price ? (
            <>
              {price} <span>each</span>
            </>
          ) : (
            "Price unavailable"
          )}
        </p>
        <p>
          Includes case, slider + empty 1 oz bottle.
          <br />
          Swabs and isopropyl alcohol not included.
        </p>
        <div className="studio-picker-facts">
          <p>Closed: 80 × 80 × 25 mm</p>
          <p>
            Made to order · 3–5 business days handling.
            <br />
            <LocalizedClientLink href="/#faq">
              14-day returns.
            </LocalizedClientLink>
          </p>
        </div>
      </div>
      <div className="studio-picker-controls">
        <fieldset disabled={pending} className="studio-finish-grid">
          <legend className="sr-only">Choose your finish</legend>
          {finishes.map((item) => (
            <label
              key={item.handle}
              className={`studio-finish ${
                selected === item.handle ? "is-selected" : ""
              }`}
            >
              <input
                type="radio"
                name="finish"
                value={item.handle}
                checked={selected === item.handle}
                onChange={() => {
                  setSelected(item.handle)
                  setAdded("")
                  setError("")
                }}
              />
              <div className="studio-finish-photo">
                <Image
                  src={item.image}
                  alt={`${item.name} Dab Pal open case`}
                  width={1000}
                  height={563}
                  sizes="(max-width: 700px) 45vw, 30vw"
                />
              </div>
              <span className="studio-selection-mark" aria-hidden="true">
                {selected === item.handle && <Check />}
              </span>
              <span className="studio-finish-label">
                {item.name}
                {selected === item.handle ? " selected" : ""}
                {!item.available ? " · Unavailable" : ""}
              </span>
            </label>
          ))}
        </fieldset>
        <button
          type="button"
          className="studio-button studio-add"
          disabled={pending || !finish?.available || !price}
          onClick={add}
          data-testid="pal-add-to-cart"
          aria-busy={pending}
        >
          {pending
            ? "Adding your Pal…"
            : !finish?.available
            ? "Currently unavailable"
            : !price
            ? "Price unavailable"
            : `Add to cart — ${price}`}
        </button>
        <div aria-live="polite" className="studio-cart-feedback">
          {added && (
            <p>
              {added} added.{" "}
              <LocalizedClientLink href="/cart">
                View your cart <ArrowRight />
              </LocalizedClientLink>
            </p>
          )}
          {error && <p role="alert">{error}</p>}
        </div>
        <LocalizedClientLink
          href={`/store?finish=${finish?.handle === "white-speck" ? "marble" : "slate"}`}
          className="studio-detail-link"
        >
          Details & multi-packs <ArrowRight />
        </LocalizedClientLink>
      </div>
    </section>
  )
}
