/**
 * Place Details proxy.
 *
 * Looks up a placeId selected from the autocomplete response and returns
 * its parsed address components: line1, city, state, postal_code, country.
 *
 * Usage: GET /api/places/details?placeId=<id>
 */

import { NextResponse } from "next/server"

export const runtime = "nodejs"

type Out = {
  line1: string
  city: string
  province: string
  postalCode: string
  country: string
}

export async function GET(req: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_MAPS_API_KEY not configured" },
      { status: 500 }
    )
  }

  const url = new URL(req.url)
  const placeId = url.searchParams.get("placeId")?.trim()
  const sessionToken = url.searchParams.get("sessionToken") || undefined

  if (!placeId) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 })
  }

  try {
    const sessionParam = sessionToken
      ? `?sessionToken=${encodeURIComponent(sessionToken)}`
      : ""
    const r = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(
        placeId
      )}${sessionParam}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "addressComponents,formattedAddress",
        },
        cache: "no-store",
      }
    )

    if (!r.ok) {
      const txt = await r.text()
      return NextResponse.json(
        { error: "places upstream error", status: r.status, body: txt.slice(0, 300) },
        { status: 502 }
      )
    }

    const data = await r.json()
    const comps: Array<{ types: string[]; longText: string; shortText: string }> =
      data.addressComponents || []

    const get = (type: string, short = false) => {
      const c = comps.find((x) => x.types.includes(type))
      return (short ? c?.shortText : c?.longText) || ""
    }

    const streetNumber = get("street_number")
    const route = get("route")
    const line1 = [streetNumber, route].filter(Boolean).join(" ")

    const out: Out = {
      line1,
      city:
        get("locality") ||
        get("postal_town") ||
        get("sublocality_level_1") ||
        get("administrative_area_level_2"),
      province: get("administrative_area_level_1", true),
      postalCode: get("postal_code"),
      country: get("country", true),
    }

    return NextResponse.json(out)
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "fetch failed" },
      { status: 500 }
    )
  }
}
