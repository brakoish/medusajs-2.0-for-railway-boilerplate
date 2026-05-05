import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * POST /store/shipping/validate-address
 *
 * Body: { name?, street1|address_1, street2|address_2?, city, state|province,
 *         zip|postal_code, country|country_code?, phone?, email? }
 *
 * Validates the address against Shippo's address-correction service. We hit
 * the Shippo REST API directly here rather than going through the
 * fulfillment provider container, because the Medusa fulfillment module
 * keeps providers in a private nested DI scope that route handlers can't
 * reach. Same SHIPPO_API_TOKEN is used either way.
 *
 * Fail-open: if SHIPPO_API_TOKEN is missing or Shippo errors, we return
 * valid:true so the customer can still complete checkout.
 */

type ShippoValidationResult = {
  is_complete?: boolean
  street1?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  validation_results?: {
    is_valid?: boolean
    messages?: { code?: string; text: string; source?: string }[]
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const body = (req.body || {}) as Record<string, string | undefined>
  const street1 = body.street1 || body.address_1 || ""
  const street2 = body.street2 || body.address_2
  const state = body.state || body.province || ""
  const zip = body.zip || body.postal_code || ""
  const country = (body.country || body.country_code || "US").toUpperCase()

  if (!street1 || !body.city || !state || !zip) {
    res.status(400).json({
      valid: false,
      messages: [{ text: "street1, city, state, and zip are required" }],
    })
    return
  }

  const token = process.env.SHIPPO_API_TOKEN
  const apiUrl = (process.env.SHIPPO_API_URL || "https://api.goshippo.com").replace(
    /\/+$/,
    ""
  )

  const logger = req.scope.resolve("logger") as {
    warn?: (msg: string) => void
  }

  if (!token) {
    res.json({ valid: true, messages: [{ text: "Address validation disabled" }] })
    return
  }

  try {
    const shippoRes = await fetch(`${apiUrl}/addresses`, {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${token}`,
        "Content-Type": "application/json",
        "Shippo-API-Version": "2018-02-08",
      },
      body: JSON.stringify({
        name: body.name,
        street1,
        street2,
        city: body.city,
        state,
        zip,
        country,
        phone: body.phone,
        email: body.email,
        validate: true,
      }),
    })

    if (!shippoRes.ok) {
      const errBody = await shippoRes.text()
      logger.warn?.(
        `[validate-address] Shippo HTTP ${shippoRes.status}: ${errBody.slice(0, 200)}`
      )
      res.json({
        valid: true,
        messages: [{ text: `Address validation unavailable (${shippoRes.status})` }],
      })
      return
    }

    const result = (await shippoRes.json()) as ShippoValidationResult
    const isValid =
      result.validation_results?.is_valid === true ||
      result.is_complete === true

    res.json({
      valid: !!isValid,
      suggestion: isValid
        ? {
            street1: result.street1,
            street2: result.street2,
            city: result.city,
            state: result.state,
            zip: result.zip,
            country: result.country,
          }
        : undefined,
      messages: result.validation_results?.messages || [],
    })
  } catch (e) {
    logger.warn?.(
      `[validate-address] fetch failed: ${(e as Error).message}`
    )
    res.json({
      valid: true,
      messages: [
        { text: `Address validation unavailable: ${(e as Error).message}` },
      ],
    })
  }
}
