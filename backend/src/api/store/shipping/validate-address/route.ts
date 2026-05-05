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

  const logger = req.scope.resolve("logger") as {
    warn?: (msg: string) => void
    info?: (msg: string) => void
  }

  // The provider is registered as `fp_<identifier>_<id>` inside the
  // FULFILLMENT module's container. The app-level req.scope can't reach into
  // the module container, so we resolve the FULFILLMENT module first and ask
  // it for the provider directly.
  let provider:
    | {
        validateAddress: (input: Record<string, unknown>) => Promise<unknown>
      }
    | null = null

  // Try a few candidate names: direct provider container path, and the
  // FulfillmentProviderService exposed via the FULFILLMENT module's nested
  // container.
  const candidates = [
    "fp_shippo_shippo",
    "fp_shippo",
    "shippo",
  ]
  let lastResolveErr = ""
  for (const name of candidates) {
    try {
      const candidate = req.scope.resolve(name) as Record<string, unknown>
      if (candidate && typeof (candidate as { validateAddress?: unknown }).validateAddress === "function") {
        provider = candidate as typeof provider
        break
      }
    } catch (e) {
      lastResolveErr = (e as Error).message
    }
  }

  if (!provider) {
    // Try fulfillmentProviderService.retrieveProviderRegistration as a fallback.
    try {
      const fulfillmentSvc = req.scope.resolve("fulfillment") as {
        retrieveProviderRegistration?: (id: string) => unknown
      }
      if (fulfillmentSvc?.retrieveProviderRegistration) {
        const reg = fulfillmentSvc.retrieveProviderRegistration(
          "shippo_shippo"
        ) as Record<string, unknown> | undefined
        if (
          reg &&
          typeof (reg as { validateAddress?: unknown }).validateAddress ===
            "function"
        ) {
          provider = reg as typeof provider
        }
      }
    } catch (e) {
      lastResolveErr = (e as Error).message
    }
  }

  if (!provider) {
    logger.warn?.(
      `[validate-address] could not resolve Shippo provider; lastErr=${lastResolveErr}`
    )
    res.json({
      valid: true,
      messages: [
        {
          text: "Address validation provider unavailable",
        },
      ],
    })
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
    logger.warn?.(
      `[validate-address] Shippo call failed: ${(e as Error).message}`
    )
    res.json({
      valid: true,
      messages: [
        { text: `Address validation unavailable: ${(e as Error).message}` },
      ],
    })
  }
}
