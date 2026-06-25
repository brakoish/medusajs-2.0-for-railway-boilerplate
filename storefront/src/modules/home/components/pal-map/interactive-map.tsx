"use client"

import {
  ArrowPathMini,
  MinusMini,
  PlusMini,
  Map as MapIcon,
} from "@medusajs/icons"
import { useEffect, useMemo, useRef } from "react"
import type { LatLngBoundsExpression, Map as LeafletMap } from "leaflet"

import { PalLocation } from "./locations"

type InteractivePalMapProps = {
  locations: PalLocation[]
}

const LOWER_48_BOUNDS: LatLngBoundsExpression = [
  [24.396308, -124.848974],
  [49.384358, -66.885444],
]

const pluralize = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

const formatLocation = (location: PalLocation) =>
  [
    location.city,
    location.province,
    location.country === "US" ? "" : location.country,
  ]
    .filter(Boolean)
    .join(", ")

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")

export default function InteractivePalMap({
  locations,
}: InteractivePalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  const markerLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          Number.isFinite(location.latitude) &&
          Number.isFinite(location.longitude)
      ),
    [locations]
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let disposed = false

    const mountMap = async () => {
      const L = await import("leaflet")
      if (disposed || !containerRef.current) return

      const map = L.map(containerRef.current, {
        attributionControl: true,
        center: [39.5, -98.35],
        maxBoundsViscosity: 0.45,
        minZoom: 3,
        scrollWheelZoom: true,
        zoom: 4,
        zoomControl: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      map.fitBounds(LOWER_48_BOUNDS, {
        animate: false,
        padding: [18, 18],
      })

      markerLocations.forEach((location) => {
        const size = Math.min(24, 10 + Math.sqrt(location.count) * 5)
        const label = escapeHtml(formatLocation(location))
        const count = escapeHtml(pluralize(location.count, "Dab Pal"))
        const icon = L.divIcon({
          className: "pal-map-leaflet-marker",
          html: `<span class="pal-map-pin-dot" style="width:${size}px;height:${size}px"></span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

        L.marker([location.latitude, location.longitude], {
          icon,
          keyboard: true,
          title: `${formatLocation(location)}, ${pluralize(
            location.count,
            "Dab Pal"
          )}`,
        })
          .bindTooltip(
            `<strong>${label}</strong><span>${count}</span>`,
            {
              className: "pal-map-leaflet-tooltip",
              direction: "top",
              offset: [0, -12],
              opacity: 1,
            }
          )
          .addTo(map)
      })

      mapRef.current = map
    }

    mountMap()

    return () => {
      disposed = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [markerLocations])

  const reset = () => {
    mapRef.current?.fitBounds(LOWER_48_BOUNDS, {
      animate: true,
      padding: [18, 18],
    })
  }

  return (
    <div className="pal-map-shell">
      <div
        ref={containerRef}
        className="pal-map-viewport pal-map-leaflet"
        aria-label="Interactive Dab Pal order map"
      />

      <div className="pal-map-controls" aria-label="Map controls">
        <button
          type="button"
          className="pal-map-control"
          aria-label="Zoom in"
          title="Zoom in"
          onClick={() => mapRef.current?.zoomIn()}
        >
          <PlusMini />
        </button>
        <button
          type="button"
          className="pal-map-control"
          aria-label="Zoom out"
          title="Zoom out"
          onClick={() => mapRef.current?.zoomOut()}
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
