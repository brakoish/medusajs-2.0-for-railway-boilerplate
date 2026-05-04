"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState } from "react"

type ProductGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [active, setActive] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-zinc-100 rounded-lg" />
    )
  }

  const main = images[active] || images[0]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full bg-zinc-50 rounded-lg overflow-hidden">
        <Image
          src={main.url}
          alt="Dab Pal product photo"
          fill
          sizes="(max-width: 800px) 100vw, 50vw"
          className="object-contain p-6 small:p-10"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 8).map((img, i) => (
            <button
              key={img.id || i}
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
