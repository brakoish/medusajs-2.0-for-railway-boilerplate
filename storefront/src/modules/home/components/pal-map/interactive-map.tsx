"use client"

import {
  ArrowPathMini,
  MinusMini,
  PlusMini,
  Map as MapIcon,
} from "@medusajs/icons"
import {
  CSSProperties,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { PalLocation } from "./locations"

type InteractivePalMapProps = {
  locations: PalLocation[]
}

type ViewState = {
  scale: number
  x: number
  y: number
}

type PointerState = {
  x: number
  y: number
}

type PinchState = {
  distance: number
  centerX: number
  centerY: number
  view: ViewState
}

const MIN_SCALE = 1
const MAX_SCALE = 4
const mapFrame = {
  left: 4,
  top: 12,
  width: 92,
  height: 76,
}

const pluralize = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

const projectLocation = (longitude: number, latitude: number) => ({
  left: `${mapFrame.left + ((longitude + 180) / 360) * mapFrame.width}%`,
  top: `${mapFrame.top + ((90 - latitude) / 180) * mapFrame.height}%`,
})

const formatLocation = (location: PalLocation) =>
  [
    location.city,
    location.province,
    location.country === "US" ? "" : location.country,
  ]
    .filter(Boolean)
    .join(", ")

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const distanceBetween = (a: PointerState, b: PointerState) =>
  Math.hypot(a.x - b.x, a.y - b.y)

const centerBetween = (a: PointerState, b: PointerState) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
})

export default function InteractivePalMap({ locations }: InteractivePalMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const pointers = useRef(new Map<number, PointerState>())
  const dragStart = useRef<{
    pointerId: number
    x: number
    y: number
    view: ViewState
  } | null>(null)
  const pinchStart = useRef<PinchState | null>(null)

  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0 })
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const locationPins = useMemo(
    () =>
      locations.map((location) => ({
        key: `${location.city}-${location.province}-${location.country}`,
        location,
        position: projectLocation(location.longitude, location.latitude),
        size: Math.min(34, 18 + location.count * 5),
      })),
    [locations]
  )

  const clampView = (next: ViewState): ViewState => {
    const viewport = viewportRef.current
    if (!viewport) return next

    const { width, height } = viewport.getBoundingClientRect()
    const margin = Math.min(width, height) * 0.18
    const minX = width - width * next.scale - margin
    const maxX = margin
    const minY = height - height * next.scale - margin
    const maxY = margin

    return {
      scale: next.scale,
      x: next.scale === 1 ? 0 : clamp(next.x, minX, maxX),
      y: next.scale === 1 ? 0 : clamp(next.y, minY, maxY),
    }
  }

  const setClampedView = (next: ViewState) => {
    setView(clampView(next))
  }

  const zoomAt = (scale: number, centerX?: number, centerY?: number) => {
    const viewport = viewportRef.current
    if (!viewport) return

    const rect = viewport.getBoundingClientRect()
    const nextScale = clamp(scale, MIN_SCALE, MAX_SCALE)
    const originX = centerX ?? rect.width / 2
    const originY = centerY ?? rect.height / 2
    const contentX = (originX - view.x) / view.scale
    const contentY = (originY - view.y) / view.scale

    setClampedView({
      scale: nextScale,
      x: originX - contentX * nextScale,
      y: originY - contentY * nextScale,
    })
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = viewport.getBoundingClientRect()
      const zoomFactor = event.deltaY > 0 ? 0.88 : 1.12
      zoomAt(
        view.scale * zoomFactor,
        event.clientX - rect.left,
        event.clientY - rect.top
      )
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false })
    return () => viewport.removeEventListener("wheel", handleWheel)
  }, [view.scale, view.x, view.y])

  const beginPinch = () => {
    const [first, second] = Array.from(pointers.current.values())
    if (!first || !second) return

    const center = centerBetween(first, second)
    pinchStart.current = {
      distance: distanceBetween(first, second),
      centerX: center.x,
      centerY: center.y,
      view,
    }
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.closest(".pal-map-pin")
    ) {
      return
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    if (pointers.current.size === 1) {
      dragStart.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        view,
      }
      pinchStart.current = null
    } else if (pointers.current.size === 2) {
      dragStart.current = null
      beginPinch()
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    if (pointers.current.size >= 2 && pinchStart.current) {
      const [first, second] = Array.from(pointers.current.values())
      if (!first || !second) return

      const rect = viewportRef.current?.getBoundingClientRect()
      if (!rect) return

      const center = centerBetween(first, second)
      const start = pinchStart.current
      const nextScale = clamp(
        start.view.scale * (distanceBetween(first, second) / start.distance),
        MIN_SCALE,
        MAX_SCALE
      )
      const originX = center.x - rect.left
      const originY = center.y - rect.top
      const startOriginX = start.centerX - rect.left
      const startOriginY = start.centerY - rect.top
      const contentX = (startOriginX - start.view.x) / start.view.scale
      const contentY = (startOriginY - start.view.y) / start.view.scale

      setClampedView({
        scale: nextScale,
        x: originX - contentX * nextScale,
        y: originY - contentY * nextScale,
      })
      return
    }

    const start = dragStart.current
    if (!start || start.pointerId !== event.pointerId) return

    setClampedView({
      scale: start.view.scale,
      x: start.view.x + event.clientX - start.x,
      y: start.view.y + event.clientY - start.y,
    })
  }

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    dragStart.current = null
    pinchStart.current = null

    if (pointers.current.size === 2) {
      beginPinch()
    }
  }

  const reset = () => {
    setView({ scale: 1, x: 0, y: 0 })
    setActiveKey(null)
  }

  return (
    <div className="pal-map-shell">
      <div
        ref={viewportRef}
        className="pal-map-viewport"
        aria-label="Interactive Dab Pal order map"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div className="pal-map-surface">
          <div
            className="pal-map-layer"
            style={
              {
                "--map-x": `${view.x}px`,
                "--map-y": `${view.y}px`,
                "--map-scale": view.scale,
              } as CSSProperties
            }
          >
            <div className="pal-map-graticule" aria-hidden="true" />
            <img
              className="pal-map-outline"
              src="/dab-pal/world-map.svg"
              alt=""
              aria-hidden="true"
              draggable={false}
            />

            {locationPins.map(({ key, location, position, size }) => {
              const active = activeKey === key

              return (
                <button
                  key={key}
                  type="button"
                  className={`pal-map-pin${active ? " is-active" : ""}`}
                  style={
                    {
                      left: position.left,
                      top: position.top,
                      "--pin-size": `${size}px`,
                      "--pin-z": 10 + location.count,
                    } as CSSProperties
                  }
                  aria-label={`${formatLocation(location)}, ${pluralize(
                    location.count,
                    "Dab Pal"
                  )}`}
                  onClick={() => setActiveKey(active ? null : key)}
                >
                  <span className="pal-map-pin-dot" />
                  <span className="pal-map-tooltip">
                    <strong>{formatLocation(location)}</strong>
                    <span>{pluralize(location.count, "Dab Pal")}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="pal-map-controls" aria-label="Map controls">
        <button
          type="button"
          className="pal-map-control"
          aria-label="Zoom in"
          title="Zoom in"
          onClick={() => zoomAt(view.scale * 1.35)}
        >
          <PlusMini />
        </button>
        <button
          type="button"
          className="pal-map-control"
          aria-label="Zoom out"
          title="Zoom out"
          onClick={() => zoomAt(view.scale / 1.35)}
        >
          <MinusMini />
        </button>
        <button
          type="button"
          className="pal-map-control"
          aria-label="Reset map"
          title="Reset map"
          onClick={reset}
        >
          <ArrowPathMini />
        </button>
      </div>

      <div className="pal-map-hint">
        <MapIcon />
        <span>Drag, pinch, or scroll to explore</span>
      </div>
    </div>
  )
}
