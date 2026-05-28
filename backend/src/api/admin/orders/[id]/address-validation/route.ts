import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ShippoClient } from "../../../../../modules/shippo/client"

type ShippoAddressValidationMessage = {
  code?: string
  text: string
  source?: string
}

type ShippoAddressValidationResult = {
  is_complete?: boolean
  name?: string
  street1?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  validation_results?: {
    is_valid?: boolean
    messages?: ShippoAddressValidationMessage[]
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void | MedusaResponse> {
  const orderId = req.params.id as string
  const query = req.scope.resolve("query")

  const { data: orders } = await query.graph({
    entity: "order",
    filters: { id: orderId },
    fields: [
      "id",
      "display_id",
      "email",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.address_1",
      "shipping_address.address_2",
      "shipping_address.city",
      "shipping_address.province",
      "shipping_address.postal_code",
      "shipping_address.country_code",
      "shipping_address.phone",
    ],
  })

  const order = orders?.[0] as Record<string, unknown> | undefined
  if (!order) {
    return res.status(404).json({ error: "Order not found" })
  }

  const address = order.shipping_address as Record<string, unknown> | null
  if (!address) {
    return res.status(400).json({ error: "Order has no shipping address" })
  }

  const street1 = String(address.address_1 || "")
  const city = String(address.city || "")
  const state = String(address.province || "")
  const zip = String(address.postal_code || "")
  const country = String(address.country_code || "US").toUpperCase()

  if (!street1 || !city || !state || !zip) {
    return res.status(422).json({
      valid: false,
      status: "invalid",
      messages: [{ text: "Street, city, state, and ZIP are required." }],
    })
  }

  const apiToken = process.env.SHIPPO_API_TOKEN
  if (!apiToken) {
    return res.status(503).json({
      valid: null,
      status: "unavailable",
      messages: [{ text: "SHIPPO_API_TOKEN is not configured." }],
    })
  }

  try {
    const client = new ShippoClient({
      api_token: apiToken,
      api_url: process.env.SHIPPO_API_URL,
    })

    const result = (await client.createAndValidateAddress({
      name: [address.first_name, address.last_name].filter(Boolean).join(" ") || "Customer",
      street1,
      street2: (address.address_2 as string | undefined) || undefined,
      city,
      state,
      zip,
      country,
      phone: (address.phone as string | undefined) || undefined,
      email: (order.email as string | undefined) || undefined,
    })) as ShippoAddressValidationResult

    const messages = result.validation_results?.messages || []
    const hasExplicitVerdict = typeof result.validation_results?.is_valid === "boolean"
    const valid = hasExplicitVerdict
      ? result.validation_results?.is_valid === true
      : result.is_complete === true

    res.status(200).json({
      valid,
      status: valid ? (messages.length ? "corrected" : "valid") : "invalid",
      suggestion: {
        name: result.name,
        street1: result.street1,
        street2: result.street2,
        city: result.city,
        state: result.state,
        zip: result.zip,
        country: result.country,
      },
      messages,
    })
  } catch (e) {
    res.status(502).json({
      valid: null,
      status: "unavailable",
      messages: [{ text: (e as Error).message }],
    })
  }
}
