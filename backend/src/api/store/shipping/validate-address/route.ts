import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * POST /store/shipping/validate-address
 *
 * Body: { name, street1, street2?, city, state, zip, country?, phone?, email? }
 *
 * Returns Shippo's address validation result so the storefront can warn the
 * customer about typos / undeliverable addresses before they hit "Place order".
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const body = (req.body || {}) as {
    name?: string
    street1?: string
    address_1?: string
    street2?: string
    address_2?: string
    city?: string
    state?: string
    province?: string
    zip?: string
    postal_code?: string
    country?: string
    country_code?: string
    phone?: string
    email?: string
  }

  // Accept Medusa-shaped fields (address_1 / postal_code / country_code /
  // province) so the storefront can pass its existing form state straight
  // through without remapping.
  const street1 = body.street1 || body.address_1 || ""
  const street2 = body.street2 || body.address_2
  const state = body.state || body.province || ""
  const zip = body.zip || body.postal_code || ""
  const country = body.country || body.country_code || "US"

  if (!street1 || !body.city || !state || !zip) {
    res.status(400).json({
      valid: false,
      messages: [
        {
          text: "street1, city, state, and zip are required",
        },
      ],
    })
    return
  }

  let provider
  try {
    provider = req.scope.resolve("fp_shippo_shippo")
  } catch {
    // Shippo provider not registered (e.g. SHIPPO_API_TOKEN missing). Treat
    // the address as valid so we don't block checkout in that case.
    res.json({ valid: true, messages: [] })
    return
  }

  try {
    const result = await provider.validateAddress({
      name: body.name,
      street1,
      street2,
      city: body.city,
      state,
      zip,
      country,
      phone: body.phone,
      email: body.email,
    })
    res.json(result)
  } catch (e) {
    // Shippo failed. Fail open so the customer can still complete checkout;
    // we'd rather take a possibly-bad address than block a sale.
    res.json({
      valid: true,
      messages: [
        { text: `Address validation unavailable: ${(e as Error).message}` },
      ],
    })
  }
}
