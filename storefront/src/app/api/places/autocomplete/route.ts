/**
 * Places Autocomplete proxy.
 *
 * Forwards a query to the Google Places (New) Autocomplete endpoint.
 * Keeps GOOGLE_MAPS_API_KEY server-side so the key never reaches the
 * browser bundle.
 *
 * Usage: GET /api/places/autocomplete?input=<text>&country=us
 *
 * Returns: { suggestions: [{ placeId, text, secondaryText }] }
 */

import { NextResponse } from "next/server"

export const runtime = "nodejs"

type Suggestion = {
  placeId: string
  text: string
  secondaryText?: string
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
  const input = url.searchParams.get("input")?.trim() || ""
  const country = (url.searchParams.get("country") || "us").toUpperCase()
  const sessionToken = url.searchParams.get("sessionToken") || undefined

  if (input.length < 3) {
    return NextResponse.json({ suggestions: [] satisfies Suggestion[] })
  }

  try {
    const r = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
        },
        body: JSON.stringify({
          input,
          includedPrimaryTypes: ["street_address", "premise", "subpremise"],
          includedRegionCodes: [country],
          ...(sessionToken ? { sessionToken } : {}),
        }),
        // Don't cache user keystrokes.
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
    const suggestions: Suggestion[] = (data.suggestions || [])
      .map((s: any) => {
        const p = s.placePrediction
        if (!p) return null
        return {
          placeId: p.placeId,
          text: p.structuredFormat?.mainText?.text || p.text?.text || "",
          secondaryText: p.structuredFormat?.secondaryText?.text || "",
        }
      })
      .filter(Boolean) as Suggestion[]

    return NextResponse.json({ suggestions })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "fetch failed" },
      { status: 500 }
    )
  }
}
