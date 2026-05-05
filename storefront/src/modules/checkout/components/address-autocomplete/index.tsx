"use client"

/**
 * AddressAutocomplete — Google Places Autocomplete dropdown wrapping the
 * existing address line 1 input.
 *
 * Calls our own /api/places/autocomplete proxy (key stays server-side).
 * On selection, fetches /api/places/details and emits a parsed address
 * via onSelect (the parent fills city/state/zip/country).
 *
 * Falls back gracefully: if the API is unavailable or returns nothing,
 * the underlying input keeps working as a normal text field.
 */

import Input from "@modules/common/components/input"
import { useEffect, useId, useRef, useState } from "react"

type Suggestion = {
  placeId: string
  text: string
  secondaryText?: string
}

type ParsedPlace = {
  line1: string
  city: string
  province: string
  postalCode: string
  country: string
}

type Props = {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelect: (place: ParsedPlace) => void
  required?: boolean
  countryCode?: string
  "data-testid"?: string
}

const AddressAutocomplete: React.FC<Props> = ({
  label,
  name,
  value,
  onChange,
  onSelect,
  required,
  countryCode = "us",
  "data-testid": dataTestId,
}) => {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Suggestion[]>([])
  const [highlight, setHighlight] = useState(0)
  const sessionRef = useRef<string>("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  // Maintain a session token per autocomplete session (for Google
  // billing — bundles autocomplete + details into one charge).
  if (!sessionRef.current) {
    sessionRef.current =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
  }

  // Close on click outside.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Fetch suggestions on value change (debounced).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value || value.trim().length < 3) {
      setItems([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(
            value.trim()
          )}&country=${encodeURIComponent(countryCode)}&sessionToken=${
            sessionRef.current
          }`,
          { cache: "no-store" }
        )
        if (!r.ok) return
        const data = await r.json()
        const list: Suggestion[] = data?.suggestions || []
        setItems(list)
        setOpen(list.length > 0)
        setHighlight(0)
      } catch {
        /* network blip — ignore, plain typing still works */
      }
    }, 180)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, countryCode])

  const pick = async (s: Suggestion) => {
    setOpen(false)
    try {
      const r = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(
          s.placeId
        )}&sessionToken=${sessionRef.current}`,
        { cache: "no-store" }
      )
      if (!r.ok) return
      const data: ParsedPlace = await r.json()
      onSelect(data)
      // Refresh the session token so the next autocomplete sequence is
      // billed independently.
      sessionRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2)
    } catch {
      /* drop the suggestion silently if details lookup fails */
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || items.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight((h) => (h + 1) % items.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((h) => (h - 1 + items.length) % items.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      pick(items[highlight])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <Input
        label={label}
        name={name}
        autoComplete="address-line1"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown as any}
        onFocus={() => items.length > 0 && setOpen(true)}
        required={required}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        data-testid={dataTestId}
      />
      {open && items.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-md border border-ui-border-base bg-white shadow-lg text-sm"
        >
          {items.map((s, i) => (
            <li
              key={s.placeId}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => {
                // mousedown so the input's blur doesn't fire first
                e.preventDefault()
                pick(s)
              }}
              onMouseEnter={() => setHighlight(i)}
              className={`cursor-pointer px-4 py-2 ${
                i === highlight ? "bg-ui-bg-base-hover" : ""
              }`}
            >
              <div className="font-medium">{s.text}</div>
              {s.secondaryText && (
                <div className="text-ui-fg-subtle text-xs">
                  {s.secondaryText}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AddressAutocomplete
