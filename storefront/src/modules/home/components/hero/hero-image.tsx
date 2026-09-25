"use client"

import Image from "next/image"
import type { PointerEvent } from "react"

export default function HeroImage() {
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return

    const element = event.currentTarget
    const bounds = element.getBoundingClientRect()
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1))
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1))

    element.dataset.active = "true"
    element.style.setProperty("--hero-tilt-x", `${-y * 5}deg`)
    element.style.setProperty("--hero-tilt-y", `${x * 7}deg`)
    element.style.setProperty("--hero-shift-x", `${x * 6}px`)
  }

  const reset = (event: PointerEvent<HTMLDivElement>) => {
    delete event.currentTarget.dataset.active
    event.currentTarget.style.removeProperty("--hero-tilt-x")
    event.currentTarget.style.removeProperty("--hero-tilt-y")
    event.currentTarget.style.removeProperty("--hero-shift-x")
  }

  return (
    <div className="studio-hero-image" onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
      <div className="studio-hero-tilt">
        <div className="studio-hero-float">
          <Image
            src="/dab-pal/model-2026-09/dab-pal-slate-open-cutout.webp"
            alt="Slate Dab Pal case with a bottle and example swabs, shown open"
            fill
            priority
            draggable={false}
            sizes="(max-width: 700px) 100vw, 50vw"
          />
        </div>
      </div>
    </div>
  )
}
