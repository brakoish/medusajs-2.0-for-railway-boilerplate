"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSelectedVariantId } from "@modules/products/contexts/variant-context"

type ProductGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  variants?: HttpTypes.StoreProductVariant[]
}

const VIDEO_URL =
  "https://bucket-production-a39d.up.railway.app/medusa-media/dabpal_video-01KRBQAN081CB5FHH4QC6G6PKN.mp4"

/**
 * PDP image gallery.
 *
 * Default behavior is "show all product images, click a thumbnail to
 * change the hero." On top of that we layer per-variant image targeting:
 * each variant carries a `metadata.image_url` pointing to the canonical
 * shot for that color. When the buyer toggles Color in ProductActions
 * (which updates VariantContext), the gallery jumps to that image.
 *
 * Clicking the hero image opens a lightbox with a thumbnail strip,
 * arrow-key + swipe nav, and Esc-to-close. Built inline (no library) to
 * keep bundle weight down.
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
  // already in product.images, reorder it to the front. Otherwise prepend.
  // Video is always first when present.
  const gallery = useMemo(() => {
    const base = images ?? []
    const videoItem = [
      { id: "product-video", url: VIDEO_URL } as HttpTypes.StoreProductImage,
    ]

    if (!variantImageUrl) return [...videoItem, ...base]

    const idx = base.findIndex((img) => img.url === variantImageUrl)
    if (idx >= 0) {
      const reordered = [base[idx], ...base.filter((_, i) => i !== idx)]
      return [...videoItem, ...reordered]
    }
    return [
      ...videoItem,
      { id: `variant-${selectedVariantId}`, url: variantImageUrl } as HttpTypes.StoreProductImage,
      ...base,
    ]
  }, [images, variantImageUrl, selectedVariantId])

  const isVideo = (url: string) =>
    url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov")

  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Whenever the variant changes, snap back to the variant image (index 1, after video).
  useEffect(() => {
    if (variantImageUrl) setActive(1)
  }, [variantImageUrl])

  const total = gallery.length
  const goPrev = useCallback(() => {
    setActive((i) => (i - 1 + total) % total)
  }, [total])
  const goNext = useCallback(() => {
    setActive((i) => (i + 1) % total)
  }, [total])

  // Lightbox: keyboard nav + body-scroll lock.
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false)
      else if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [lightboxOpen, goPrev, goNext])

  // Touch swipe inside the lightbox.
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const dx = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext()
      else goPrev()
    }
    setTouchStartX(null)
  }

  if (!gallery.length) {
    return <div className="aspect-square w-full bg-zinc-100 rounded-lg" />
  }

  const main = gallery[active] ?? gallery[0]
  const mainIsVideo = isVideo(main?.url ?? "")

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => !mainIsVideo && setLightboxOpen(true)}
          aria-label={mainIsVideo ? "Product video" : "Open image gallery"}
          className={`relative aspect-square w-full bg-zinc-50 rounded-lg overflow-hidden group ${
            mainIsVideo ? "cursor-default" : "cursor-zoom-in"
          }`}
        >
          {mainIsVideo ? (
            <video
              key={main.url}
              src={main.url}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-contain p-2"
            />
          ) : (
            <Image
              key={main.url}
              src={main.url}
              alt="Dab Pal product photo"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
              className="object-contain p-6 small:p-10 transition-transform duration-300 group-hover:scale-[1.02]"
              priority
            />
          )}
          {/* Subtle expand affordance (hidden for video) */}
          {!mainIsVideo && (
            <span
              aria-hidden
              className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-black"
              >
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
            </span>
          )}
        </button>
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
                {isVideo(img.url) ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <video
                      src={img.url}
                      className="w-full h-full object-contain p-1"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 text-white drop-shadow-md"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-contain p-2"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product image gallery"
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-3 small:px-6 small:py-4 text-white/80"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs small:text-sm tracking-wide">
              {active + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close gallery"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Main image area. The wrapper still receives the backdrop
              click (closes the lightbox); only the image itself and the
              nav chevrons stop propagation. */}
          <div
            className="relative flex-1 flex items-center justify-center px-4 small:px-16"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="relative w-full h-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideo(main.url) ? (
                <video
                  key={main.url}
                  src={main.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  key={main.url}
                  src={main.url}
                  alt={`Product image ${active + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-contain"
                  priority
                />
              )}
            </div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goPrev()
                  }}
                  aria-label="Previous image"
                  className="hidden small:inline-flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goNext()
                  }}
                  aria-label="Next image"
                  className="hidden small:inline-flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {total > 1 && (
            <div
              className="px-4 pb-4 small:px-6 small:pb-6 pt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center gap-2 overflow-x-auto">
                {gallery.map((img, i) => (
                  <button
                    key={img.id || img.url || i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`View image ${i + 1}`}
                    aria-current={i === active}
                    className={`relative w-16 h-16 small:w-20 small:h-20 rounded-md overflow-hidden flex-shrink-0 bg-white/5 border-2 transition-colors ${
                      i === active
                        ? "border-amber-400"
                        : "border-transparent hover:border-white/30"
                    }`}
                  >
                    {isVideo(img.url) ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <video
                          src={img.url}
                          className="w-full h-full object-contain p-1"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5 text-white drop-shadow-md"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
