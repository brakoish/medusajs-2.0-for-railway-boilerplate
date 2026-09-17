"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useState, type ReactNode } from "react"
import type { HttpTypes } from "@medusajs/types"
import { addToCart } from "@lib/data/cart"
import { dispatchCartChange } from "@lib/util/cart-events"
import { convertToLocale } from "@lib/util/money"
import { useAnalytics } from "@lib/util/analytics"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PdpBuyNow, { type WalletVariant } from "@modules/checkout/components/express-checkout/pdp-buy-now"

export type FinishCatalog = {
  finish: "slate" | "marble"
  productId: string
  variants: (WalletVariant & Pick<HttpTypes.StoreProductVariant, "manage_inventory" | "allow_backorder" | "inventory_quantity">)[]
}

const packs = [{ value: "1", label: "Single" }, { value: "3", label: "3-pack" }, { value: "6", label: "6-pack" }]
const finishes = [{ value: "slate", label: "Slate" }, { value: "marble", label: "Marble" }]
const imageFor = (finish: string) => `/dab-pal/studio/${finish === "marble" ? "white" : "black"}.webp`
const packSku = (finish: string, pack: string) => `DABPAL-${finish === "marble" ? "WHT" : "BLK"}-${pack === "1" ? "SINGLE" : pack}`

export default function UnifiedProduct({ catalog, children }: { catalog: FinishCatalog[]; children: ReactNode }) {
  const params = useSearchParams()
  const finish = params.get("finish") === "marble" ? "marble" : "slate"
  const pack = ["3", "6"].includes(params.get("pack") || "") ? params.get("pack")! : "1"
  const product = catalog.find(item => item.finish === finish)
  const variant = product?.variants.find(item => item.sku === packSku(finish, pack))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [added, setAdded] = useState("")
  const analytics = useAnalytics()
  const price = variant?.calculated_price
  const amount = price?.calculated_amount
  const currency = price?.currency_code || "usd"
  const hasPrice = typeof amount === "number" && Number.isFinite(amount) && amount >= 0
  const inStock = !!variant && (!variant.manage_inventory || !!variant.allow_backorder || (variant.inventory_quantity || 0) > 0)
  const money = (value: number) => convertToLocale({ amount: value, currency_code: currency, minimumFractionDigits: 0, maximumFractionDigits: 2 })
  const finishName = finish === "marble" ? "Marble" : "Slate"
  const packName = packs.find(item => item.value === pack)!.label

  function select(key: "finish" | "pack", value: string) {
    const next = new URLSearchParams(params.toString())
    next.set(key, value)
    window.history.pushState(null, "", `/store?${next.toString()}`)
    setError("")
    setAdded("")
  }

  async function add() {
    if (!variant || pending || !inStock || !hasPrice) return
    setPending(true)
    setError("")
    setAdded("")
    try {
      await addToCart({ variantId: variant.id, quantity: 1, countryCode: "us" })
      dispatchCartChange()
      setAdded(`${finishName} · ${packName} added to your cart.`)
      analytics.capture("add_to_cart", { product_id: product?.productId, variant_id: variant.id, quantity: 1, currency, value: amount, source: "unified_product" })
    } catch {
      setError("We couldn’t add this to your cart. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1.08fr_0.92fr] small:grid-rows-[auto_1fr] gap-6 small:gap-12 items-start">
      <div className="order-1 relative aspect-[16/9] max-h-[320px] small:max-h-none rounded-lg overflow-hidden bg-[#cec6bc]">
        <Image src={imageFor(finish)} alt={`Dab Pal — ${finishName}, open case with an example bottle and swabs`} fill priority sizes="(max-width: 1023px) 100vw, 55vw" className="object-contain" />
      </div>
      <div className="order-2 min-w-0 small:row-span-2">
        <h1 className="text-4xl small:text-5xl leading-tight">Dab Pal</h1>
        <p className="mt-2 text-lg font-medium">3D-printed swab case</p>
        <p className="mt-3 text-base leading-relaxed text-gray-600">Keep fresh and used swabs separate, with space for your cleaning bottle.</p>
        <p className="mt-3 text-sm leading-relaxed">Includes case, slider, and empty 1 oz bottle. Swabs and isopropyl alcohol not included.</p>

        <div className="mt-6 space-y-5">
          <fieldset disabled={pending}>
            <legend className="text-sm font-semibold mb-2">Finish</legend>
            <div className="grid grid-cols-2 gap-3">
              {finishes.map(item => (
                <label key={item.value} className="relative cursor-pointer">
                  <input type="radio" name="product-finish" value={item.value} checked={finish === item.value} onChange={() => select("finish", item.value)} className="peer sr-only" />
                  <span className="flex items-center justify-center gap-3 min-h-[48px] rounded-lg border border-gray-400 peer-checked:border-gray-950 peer-checked:bg-white/60 peer-checked:ring-1 peer-checked:ring-gray-950 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-disabled:opacity-60">
                    <span aria-hidden="true" className={`h-5 w-5 rounded-full border border-gray-400 ${item.value === "marble" ? "bg-[#e6e3dc]" : "bg-[#343735]"}`} />
                    {item.label}
                    {finish === item.value && <span aria-hidden="true" className="absolute right-2 top-1 text-xs">✓</span>}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600">{finish === "marble" ? "Light, marble-look finish. 3D printed, not stone." : "Dark speckled finish. 3D printed to order."}</p>
          </fieldset>
          <fieldset disabled={pending} aria-describedby={pack !== "1" ? "pack-contents" : undefined}>
            <legend className="text-sm font-semibold mb-2">Pack size</legend>
            <div className="grid grid-cols-3 gap-2">
              {packs.map(item => {
                const option = product?.variants.find(v => v.sku === packSku(finish, item.value))
                const total = option?.calculated_price?.calculated_amount
                const single = product?.variants.find(v => v.sku === packSku(finish, "1"))?.calculated_price?.calculated_amount
                const saving = typeof total === "number" && typeof single === "number" ? single * Number(item.value) - total : 0
                return (
                  <label key={item.value} className="relative cursor-pointer">
                    <input type="radio" name="product-pack" value={item.value} checked={pack === item.value} onChange={() => select("pack", item.value)} className="peer sr-only" />
                    <span className="flex flex-col items-center justify-center min-h-[80px] px-1 py-2 rounded-lg border border-gray-400 peer-checked:border-gray-950 peer-checked:bg-white/60 peer-checked:ring-1 peer-checked:ring-gray-950 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-disabled:opacity-60">
                      <span className="text-sm">{item.label}</span>
                      {pack === item.value && <span aria-hidden="true" className="absolute right-2 top-1 text-xs">✓</span>}
                      <span className="text-sm font-semibold mt-1">{typeof total === "number" ? money(total) : "Unavailable"}</span>
                      {saving > 0 && <span className="text-xs text-amber-800 mt-1">Save {money(saving)}</span>}
                    </span>
                  </label>
                )
              })}
            </div>
            {pack !== "1" && <p id="pack-contents" className="mt-2 text-sm text-gray-600">{pack} complete kits, all in {finishName}.{hasPrice && ` ${money(amount / Number(pack))} per kit.`}</p>}
          </fieldset>
          <div className="space-y-3">
            <p className="text-2xl font-semibold" aria-live="polite">{hasPrice ? money(amount) : "Price unavailable"}</p>
            <p className="text-sm leading-relaxed">Made to order in Astoria, NY. Ships in 3–5 business days, plus carrier transit. U.S. shipping calculated at checkout.</p>
            <button type="button" className="studio-button w-full min-h-[52px]" onClick={add} disabled={pending || !inStock || !hasPrice} aria-busy={pending} data-testid="add-product-button">
              {pending ? "Adding…" : !variant || !hasPrice ? "Currently unavailable" : !inStock ? "Out of stock" : `Add to cart — ${money(amount)}`}
            </button>
            {added && <p role="status" className="text-sm">{added} <LocalizedClientLink href="/cart" className="underline font-semibold">View cart</LocalizedClientLink></p>}
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <PdpBuyNow key={variant?.id} variant={variant} countryCode="us" inStock={inStock} disabled={pending || !hasPrice} />
            <p className="text-sm"><LocalizedClientLink href="/shipping-returns" className="underline">14-day returns from delivery, including opened kits.</LocalizedClientLink></p>
          </div>
        </div>
        <div className="mt-6 small:hidden">
          <ProductDemo finish={finish} />
        </div>
        <div className="mt-6 border-t border-gray-300">{children}</div>
      </div>
      <div className="order-3 small:col-start-1 space-y-4">
        <div className="hidden small:block"><ProductDemo finish={finish} /></div>

        <figure className="rounded-lg border border-gray-300 p-3">
          <div className="relative aspect-[4/3]"><Image src={finish === "marble" ? "/dab-pal/product-front-white.jpg" : "/dab-pal/product-front.png"} alt={`Dab Pal — ${finishName}, case and bottle detail`} fill sizes="(max-width: 800px) 100vw, 50vw" className="object-contain" /></div>
          <figcaption className="mt-2 text-sm text-gray-600">One complete kit shown. Swabs and isopropyl alcohol not included.</figcaption>
        </figure>
      </div>
    </div>
  )
}

function ProductDemo({ finish }: { finish: string }) {
  return (
        <details className="rounded-lg border border-gray-300 overflow-hidden">
          <summary className="cursor-pointer px-4 py-4 font-semibold">Watch the slider in action</summary>
          <video controls muted playsInline preload="none" poster={imageFor(finish)} className="block aspect-video w-full bg-black object-contain" aria-label="Dab Pal product demo video">
            <source src="https://bucket-production-a39d.up.railway.app/medusa-media/dabpal_video-01KRBQAN081CB5FHH4QC6G6PKN.mp4" type="video/mp4" />
          </video>
        </details>
  )
}
