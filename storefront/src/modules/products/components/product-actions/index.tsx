"use client"

import { Button } from "@medusajs/ui"
import { isEqual } from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"

import MobileActions from "./mobile-actions"
import PdpBuyNow from "@modules/checkout/components/express-checkout/pdp-buy-now"
import ProductPrice from "../product-price"
import { addToCart } from "@lib/data/cart"
import { dispatchCartChange } from "@lib/util/cart-events"
import { useSetSelectedVariantId } from "@modules/products/contexts/variant-context"
import { HttpTypes } from "@medusajs/types"

const COUNTRY = "us"
const BATCH_TIME_ZONE = "America/New_York"
const BATCH_CLOSE_HOUR = 17
const BATCH_OPEN_HOUR = 9

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  hideMobileActions?: boolean
}

const optionsAsKeymap = (variantOptions: any) => {
  return variantOptions?.reduce((acc: Record<string, string | undefined>, varopt: any) => {
    if (varopt.option && varopt.value !== null && varopt.value !== undefined) {
      acc[varopt.option.title] = varopt.value
    }
    return acc
  }, {})
}

type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: number
}

const formatParts = new Intl.DateTimeFormat("en-US", {
  timeZone: BATCH_TIME_ZONE,
  weekday: "short",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})

const weekdayIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

const getZonedParts = (date: Date): ZonedParts => {
  const parts = Object.fromEntries(
    formatParts.formatToParts(date).map((part) => [part.type, part.value])
  )

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: weekdayIndex[parts.weekday] ?? 0,
  }
}

const getTimeZoneOffsetMs = (date: Date) => {
  const parts = getZonedParts(date)
  const zonedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  )

  return zonedAsUtc - date.getTime()
}

const zonedTimeToUtc = (
  year: number,
  month: number,
  day: number,
  hour: number
) => {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, 0, 0))
  const offset = getTimeZoneOffsetMs(guess)

  return new Date(guess.getTime() - offset)
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

const getNextBusinessDay = (parts: ZonedParts) => {
  let candidate = zonedTimeToUtc(
    parts.year,
    parts.month,
    parts.day,
    BATCH_OPEN_HOUR
  )

  do {
    candidate = addDays(candidate, 1)
  } while ([0, 6].includes(getZonedParts(candidate).weekday))

  return candidate
}

const formatDuration = (ms: number) => {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) return `${minutes}m`
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`
}

const getBatchUrgency = (now: Date) => {
  const parts = getZonedParts(now)
  const isBusinessDay = parts.weekday >= 1 && parts.weekday <= 5

  if (isBusinessDay && parts.hour < BATCH_CLOSE_HOUR) {
    const closesAt = zonedTimeToUtc(
      parts.year,
      parts.month,
      parts.day,
      BATCH_CLOSE_HOUR
    )

    return {
      label: "Today's small-batch queue closes in",
      duration: formatDuration(closesAt.getTime() - now.getTime()),
      note: "Orders are made to order in NY.",
    }
  }

  const opensAt = getNextBusinessDay(parts)

  return {
    label: "Next small-batch queue opens in",
    duration: formatDuration(opensAt.getTime() - now.getTime()),
    note: "Orders are made to order in NY.",
  }
}

const BatchUrgency = () => {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const urgency = useMemo(() => getBatchUrgency(now), [now])

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-sm text-gray-900">
      <div className="flex items-center justify-between gap-3">
        <span>{urgency.label}</span>
        <time className="font-semibold tabular-nums text-amber-800">
          {urgency.duration}
        </time>
      </div>
      <p className="mt-1 text-xs text-gray-600">{urgency.note}</p>
    </div>
  )
}

export default function ProductActions({
  product,
  region,
  disabled,
  hideMobileActions,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>(() => {
    // Pre-compute defaults so there's no "Select variant" flash on first render.
    if (!product.variants?.length) return {}
    const DEFAULT_SKU = "DABPAL-1-BLK"
    const preferred =
      product.variants.find((v) => v.sku === DEFAULT_SKU) ??
      product.variants[0]
    return optionsAsKeymap(preferred.options) ?? {}
  })
  const [isAdding, setIsAdding] = useState(false)
  const [btnReady, setBtnReady] = useState(false)
  const prevVariantIdRef = useRef<string | undefined>(undefined)
  const countryCode = COUNTRY

  // State is pre-initialized with defaults above. This effect only runs if
  // the product prop changes identity (practically never on a single-product
  // storefront), keeping the selection in sync if it does.
  useEffect(() => {
    if (!product.variants?.length) return
    setOptions((prev) => {
      if (Object.keys(prev).length > 0) return prev // already initialized
      const DEFAULT_SKU = "DABPAL-1-BLK"
      const preferred =
        product.variants!.find((v) => v.sku === DEFAULT_SKU) ??
        product.variants![0]
      return optionsAsKeymap(preferred.options) ?? {}
    })
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // Pulse the Add to Cart button once when the variant first resolves.
  useEffect(() => {
    const wasEmpty = !prevVariantIdRef.current
    const nowFilled = !!selectedVariant?.id
    if (wasEmpty && nowFilled) {
      setBtnReady(true)
      const t = setTimeout(() => setBtnReady(false), 950)
      return () => clearTimeout(t)
    }
    prevVariantIdRef.current = selectedVariant?.id
  }, [selectedVariant?.id])

  // Push the selected variant id up so siblings (the gallery) can react.
  // We also push when only Color is set (no Pack Size) so the gallery
  // can swap to the white image even before the buyer locks in size.
  const setSelectedVariantId = useSetSelectedVariantId()
  useEffect(() => {
    if (selectedVariant?.id) {
      setSelectedVariantId(selectedVariant.id)
      return
    }
    // Color-only fallback: find any variant matching just the Color option.
    const color = options["Color"]
    if (color && product.variants?.length) {
      const colorMatch = product.variants.find((v) => {
        const m = optionsAsKeymap(v.options) ?? {}
        return m["Color"] === color
      })
      if (colorMatch?.id) {
        setSelectedVariantId(colorMatch.id)
        return
      }
    }
    setSelectedVariantId(null)
  }, [selectedVariant?.id, options, product.variants, setSelectedVariantId])

  // update the options when a variant is selected
  // Special-case: when the buyer picks a Color first, auto-select the
  // 1-Pack so the page resolves to a complete variant immediately
  // instead of dead-ending on a half-selected option set. Most carts
  // are 1-packs, and you can still up-size with one tap.
  const setOptionValue = (title: string, value: string) => {
    setOptions((prev) => {
      const next: Record<string, string | undefined> = {
        ...prev,
        [title]: value,
      }
      if (title === "Color" && !next["Pack Size"]) {
        next["Pack Size"] = "Single"
      }
      return next
    })
  }

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  const eyebrow = useMemo(() => {
    const size = options["Pack Size"]
    const color = options["Color"]
    if (size && color) return `${size} \u00b7 ${color}`
    if (color) return `${color} \u00b7 pick a size`
    return "Pick your Dab Pal"
  }, [options])

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    dispatchCartChange()
    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <span className="uppercase tracking-[0.25em] text-xs text-gray-500 transition-all duration-300">
          {eyebrow}
        </span>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.title ?? ""]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      variants={product.variants ?? []}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        <BatchUrgency />

        <Button
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || !!disabled || isAdding}
          variant="primary"
          className={`w-full h-10 rounded-lg transition-shadow${btnReady ? " animate-btn-ready" : ""}`}
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant
            ? "Select variant"
            : !inStock
            ? "Out of stock"
            : "Add to cart"}
        </Button>
        <PdpBuyNow
          variant={selectedVariant}
          countryCode={countryCode}
          inStock={inStock}
          disabled={!!disabled || isAdding}
        />
        {!hideMobileActions && (
          <MobileActions
            product={product}
            variant={selectedVariant}
            options={options}
            updateOptions={setOptionValue}
            inStock={inStock}
            handleAddToCart={handleAddToCart}
            isAdding={isAdding}
            show={!inView}
            optionsDisabled={!!disabled || isAdding}
          />
        )}
      </div>
    </>
  )
}
