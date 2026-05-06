"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useSelectedVariantId } from "@modules/products/contexts/variant-context"

type ProductGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  variants?: HttpTypes.StoreProductVariant[]
}

/**
 * PDP image gallery.
 *
 * Default behavior is "show all product images, click a thumbnail to
 * change the hero." On top of that we layer per-variant image targeting:
 * each variant carries a `metadata.image_url` pointing to the canonical
 * shot for that color. When the buyer toggles Color in ProductActions
 * (which updates VariantContext), the gallery jumps to that image.
 *
 * If the variant's image isn't already in the product.images list we
 * splice it in at the top so it can render. This keeps Medusa as the
 * single source of truth — admin can swap a variant's image_url without
 * touching code.
 */
export default function ProductGallery({
  images,
  variants = [],
}: ProductGalleryProps) {
  const selectedVariantId = useSelectedVariantId()

  // Resolve the selected variant's preferred image URL.
  const variantImageUrl = useMemo(() => {
    if (!selectedVariantId) return null
    const v = variants.find((x) => x.id === selectedVariantId)
    const meta = (v?.metadata ?? {}) as Record<string, unknown>
    const url = meta["image_url"]
    return typeof url === "string" && url.length > 0 ? url : null
  }, [selectedVariantId, variants])

  // Build the gallery list. If the variant points at an image that's
  // already in product.images, just reorder it to the front. Otherwise
  // prepend a synthetic entry.
  const gallery = useMemo(() => {
    const base = images ?? []
    if (!variantImageUrl) return base

    const idx = base.findIndex((img) => img.url === variantImageUrl)
    if (idx >= 0) {
      // Move that image to position 0
      const reordered = [base[idx], ...base.filter((_, i) => i !== idx)]
      return reordered
    }
    // Prepend
    return [
      { id: `variant-${selectedVariantId}`, url: variantImageUrl } as HttpTypes.StoreProductImage,
      ...base,
    ]
  }, [images, variantImageUrl, selectedVariantId])

  const [active, setActive] = useState(0)

  // Whenever the variant changes, snap back to the variant image (index 0
  // in the rebuilt gallery). Use a string key so the effect fires only on
  // actual variant change, not on every render.
  useEffect(() => {
    if (variantImageUrl) setActive(0)
  }, [variantImageUrl])

  if (!gallery.length) {
    return <div className="aspect-square w-full bg-zinc-100 rounded-lg" />
  }

  const main = gallery[active] ?? gallery[0]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full bg-zinc-50 rounded-lg overflow-hidden">
        <Image
          key={main.url}
          src={main.url}
          alt="Dab Pal product photo"
          fill
          sizes="(max-width: 800px) 100vw, 50vw"
          className="object-contain p-6 small:p-10 transition-opacity duration-200"
          priority
        />
      </div>
      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {gallery.slice(0, 8).map((img, i) => (
            <button
              key={img.id || img.url || i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square w-full bg-zinc-50 rounded-md overflow-hidden border-2 transition-colors ${
                i === active
                  ? "border-black"
                  : "border-transparent hover:border-gray-200"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="120px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
