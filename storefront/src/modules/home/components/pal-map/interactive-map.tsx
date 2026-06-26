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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { geoAlbersUsa, geoGraticule10, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import countriesAtlas from "world-atlas/countries-50m.json"

import { PalLocation } from "./locations"

type InteractivePalMapProps = {
  locations: PalLocation[]
}

type ViewState = {
  scale: number
  x: number
  y: number
}

type ViewportSize = {
  width: number
  height: number
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
const MAX_SCALE = 8
const ZOOM_STEP = 1.55
const MAP_FRAME: [[number, number], [number, number]] = [
  [55, 45],
  [945, 575],
]
const MAP_SIZE = {
  width: 1000,
  height: 620,
}

const pluralize = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

const countriesFeature = feature(
  countriesAtlas as any,
  (countriesAtlas as any).objects.countries
) as any
const unitedStatesFeature = countriesFeature.features.find(
  (country: any) => country.id === "840"
)

const projection = geoAlbersUsa().fitExtent(MAP_FRAME, unitedStatesFeature)
const path = geoPath(projection)
const landPath = path(unitedStatesFeature) || ""
const graticulePath = path(geoGraticule10()) || ""

const projectLocation = (longitude: number, latitude: number) =>
  projection([longitude, latitude])

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

export default function InteractivePalMap({
  locations,
}: InteractivePalMapProps) {
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
  const [viewportSize, setViewportSize] = useState<ViewportSize>({
    width: 0,
    height: 0,
  })
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const mapCanvas = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height) {
      return {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      }
    }

    const width = Math.min(
      viewportSize.width,
      viewportSize.height * (MAP_SIZE.width / MAP_SIZE.height)
    )
    const height = width / (MAP_SIZE.width / MAP_SIZE.height)

    return {
      width,
      height,
      left: (viewportSize.width - width) / 2,
      top: (viewportSize.height - height) / 2,
    }
  }, [viewportSize.height, viewportSize.width])

  const locationPins = useMemo(
    () =>
      locations
        .map((location) => {
          const position = projectLocation(
            location.longitude,
            location.latitude
          )

          if (!position) return null

          return {
            key: `${location.city}-${location.province}-${location.country}`,
            location,
            position: {
              left: `${(position[0] / MAP_SIZE.width) * 100}%`,
              top: `${(position[1] / MAP_SIZE.height) * 100}%`,
            },
            size: Math.min(24, 10 + Math.sqrt(location.count) * 5),
            tooltipAlign:
              position[0] < MAP_SIZE.width * 0.22
                ? "left"
                : position[0] > MAP_SIZE.width * 0.78
                ? "right"
                : "center",
          }
        })
        .filter(
          (
            pin
          ): pin is {
            key: string
            location: PalLocation
            position: { left: string; top: string }
            size: number
            tooltipAlign: "left" | "center" | "right"
          } => Boolean(pin)
        ),
    [locations]
  )

  const clampView = useCallback(
    (next: ViewState): ViewState => {
      const viewport = viewportRef.current
      if (!viewport) return next

      const { width, height } = viewport.getBoundingClientRect()
      const baseWidth = mapCanvas.width || width
      const baseHeight = mapCanvas.height || height
      const margin = Math.min(width, height) * 0.18
      const minX = width - mapCanvas.left - baseWidth * next.scale - margin
      const maxX = margin - mapCanvas.left
      const minY = height - mapCanvas.top - baseHeight * next.scale - margin
      const maxY = margin - mapCanvas.top

      return {
        scale: next.scale,
        x: next.scale === 1 ? 0 : clamp(next.x, minX, maxX),
        y: next.scale === 1 ? 0 : clamp(next.y, minY, maxY),
      }
    },
    [mapCanvas.height, mapCanvas.left, mapCanvas.top, mapCanvas.width]
  )

  const setClampedView = useCallback(
    (next: ViewState) => {
      setView(clampView(next))
    },
    [clampView]
  )

  const zoomAt = useCallback(
    (scale: number, centerX?: number, centerY?: number) => {
      const viewport = viewportRef.current
      if (!viewport) return

      const rect = viewport.getBoundingClientRect()
      const nextScale = clamp(scale, MIN_SCALE, MAX_SCALE)
      const originX = centerX ?? rect.width / 2
      const originY = centerY ?? rect.height / 2
      const contentX = (originX - mapCanvas.left - view.x) / view.scale
      const contentY = (originY - mapCanvas.top - view.y) / view.scale

      setClampedView({
        scale: nextScale,
        x: originX - mapCanvas.left - contentX * nextScale,
        y: originY - mapCanvas.top - contentY * nextScale,
      })
    },
    [mapCanvas.left, mapCanvas.top, setClampedView, view.scale, view.x, view.y]
  )

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const resize = () => {
      const { width, height } = viewport.getBoundingClientRect()
      setViewportSize({ width, height })
    }

    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(viewport)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = viewport.getBoundingClientRect()
      const zoomFactor = event.deltaY > 0 ? 0.84 : 1.2
      zoomAt(
        view.scale * zoomFactor,
        event.clientX - rect.left,
        event.clientY - rect.top
      )
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false })
    return () => viewport.removeEventListener("wheel", handleWheel)
  }, [mapCanvas.left, mapCanvas.top, view.scale, view.x, view.y, zoomAt])

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

    setActiveKey(null)

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
      const contentX =
        (startOriginX - mapCanvas.left - start.view.x) / start.view.scale
      const contentY =
        (startOriginY - mapCanvas.top - start.view.y) / start.view.scale

      setClampedView({
        scale: nextScale,
        x: originX - mapCanvas.left - contentX * nextScale,
        y: originY - mapCanvas.top - contentY * nextScale,
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
                "--map-x": `${mapCanvas.left + view.x}px`,
                "--map-y": `${mapCanvas.top + view.y}px`,
                "--map-width": `${mapCanvas.width * view.scale}px`,
                "--map-height": `${mapCanvas.height * view.scale}px`,
              } as CSSProperties
            }
          >
            <svg
              className="pal-map-outline"
              viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`}
              aria-hidden="true"
              focusable={false}
            >
              <path className="pal-map-graticule" d={graticulePath} />
              <path className="pal-map-land" d={landPath} />
            </svg>

            {locationPins.map(
              ({ key, location, position, size, tooltipAlign }) => {
                const active = activeKey === key

                return (
                  <button
                    key={key}
                    type="button"
                    className={`pal-map-pin is-${tooltipAlign}${
                      active ? " is-active" : ""
                    }`}
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
              }
            )}
          </div>
        </div>
      </div>

      <div className="pal-map-controls" aria-label="Map controls">
        <button
          type="button"
          className="pal-map-control"
          aria-label="Zoom in"
          title="Zoom in"
          disabled={view.scale >= MAX_SCALE}
          onClick={() => zoomAt(view.scale * ZOOM_STEP)}
        >
          <PlusMini />
        </button>
        <button
          type="button"
          className="pal-map-control"
          aria-label="Zoom out"
          title="Zoom out"
          disabled={view.scale <= MIN_SCALE}
          onClick={() => zoomAt(view.scale / ZOOM_STEP)}
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
