import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * POST /store/custom/enrich-pi
 *
 * Body: { cart_id: string }
 *
 * Patches the Stripe PaymentIntent associated with the cart's active
 * Stripe payment session. Sets:
 *  - receipt_email (so Stripe sends its branded receipt)
 *  - statement_descriptor_suffix=DABPAL (so retail buyers don't see the
 *    shared "NS LABS" descriptor on their card statement)
 *  - shipping (name + address; helps Stripe Radar + shows on receipt)
 *  - description (human-readable: "Dab Pal · 1-Pack Black")
 *  - metadata (channel="retail-dabpal", cart_id, email, sku, ...)
 *
 * The Stripe Medusa provider (`@medusajs/payment-stripe`) only whitelists
 * a few keys when creating the PI, so we patch the rest here right after
 * the session is created. Safe up until the buyer confirms the payment;
 * Stripe still allows updating receipt_email and metadata even after
 * `succeeded`.
 *
 * Always responds 200 with `{ ok, patched, error? }`. Storefront treats
 * this as best-effort and never blocks the buyer on failure.
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const body = (req.body || {}) as { cart_id?: string }
  const cartId = body.cart_id

  if (!cartId) {
    res.status(200).json({ ok: false, error: "missing cart_id" })
    return
  }

  const apiKey = process.env.STRIPE_API_KEY
  if (!apiKey) {
    res.status(200).json({ ok: false, error: "stripe not configured" })
    return
  }

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const { data: carts } = await query.graph({
      entity: "cart",
      filters: { id: cartId },
      fields: [
        "id",
        "email",
        "currency_code",
        "items.id",
        "items.title",
        "items.variant_sku",
        "items.variant_title",
        "items.quantity",
        "items.unit_price",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "shipping_address.phone",
        "shipping_address.address_1",
        "shipping_address.address_2",
        "shipping_address.city",
        "shipping_address.province",
        "shipping_address.postal_code",
        "shipping_address.country_code",
        "payment_collection.id",
        "payment_collection.payment_sessions.id",
        "payment_collection.payment_sessions.provider_id",
        "payment_collection.payment_sessions.status",
        "payment_collection.payment_sessions.data",
      ],
    })

    const cart = carts?.[0]
    if (!cart) {
      res.status(200).json({ ok: false, error: "cart not found" })
      return
    }

    // Locate the active Stripe payment session
    const sessions = cart?.payment_collection?.payment_sessions || []
    const stripeSession = sessions.find(
      (s: any) =>
        (s.provider_id === "pp_stripe_stripe" ||
          s.provider_id?.startsWith("pp_stripe")) &&
        (s.status === "pending" || s.status === "authorized")
    )
    const piId =
      (stripeSession?.data as any)?.id ||
      (stripeSession?.data as any)?.payment_intent
    if (!piId || typeof piId !== "string" || !piId.startsWith("pi_")) {
      res.status(200).json({ ok: false, error: "no stripe pi found" })
      return
    }

    // Build the patch
    const items = (cart.items || []) as any[]
    const firstItem = items[0]
    const itemSummary = firstItem
      ? `${firstItem.title || "Dab Pal"}${
          firstItem.variant_title ? ` - ${firstItem.variant_title}` : ""
        }${items.length > 1 ? ` + ${items.length - 1} more` : ""}`
      : "Dab Pal"
    const description = `Dab Pal · ${itemSummary}`.slice(0, 350)

    const metadata: Record<string, string> = {
      channel: "retail-dabpal",
      cart_id: cart.id,
    }
    if (cart.email) metadata.email = cart.email
    if (firstItem?.variant_sku) metadata.sku = firstItem.variant_sku
    if (items.length) metadata.item_count = String(items.length)
    if (firstItem?.quantity) metadata.first_qty = String(firstItem.quantity)

    const sa = (cart as any).shipping_address || {}
    const hasShipping =
      sa.address_1 && sa.city && sa.postal_code && sa.country_code
    const fullName =
      [sa.first_name, sa.last_name].filter(Boolean).join(" ").trim() || undefined

    // Build form-encoded body for Stripe REST API
    const params = new URLSearchParams()
    if (cart.email) params.append("receipt_email", cart.email)
    params.append("statement_descriptor_suffix", "DABPAL")
    params.append("description", description)
    Object.entries(metadata).forEach(([k, v]) =>
      params.append(`metadata[${k}]`, v)
    )
    if (hasShipping && fullName) {
      params.append("shipping[name]", fullName)
      if (sa.phone) params.append("shipping[phone]", sa.phone)
      params.append("shipping[address][line1]", sa.address_1)
      if (sa.address_2) params.append("shipping[address][line2]", sa.address_2)
      params.append("shipping[address][city]", sa.city)
      if (sa.province) params.append("shipping[address][state]", sa.province)
      params.append("shipping[address][postal_code]", sa.postal_code)
      params.append(
        "shipping[address][country]",
        String(sa.country_code).toUpperCase()
      )
    }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/payment_intents/${piId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          // Idempotency: same cart + same patch shouldn't double-fire.
          "Idempotency-Key": `enrich-pi:${piId}:${cart.email || ""}`,
        },
        body: params.toString(),
      }
    )

    if (!stripeRes.ok) {
      const text = await stripeRes.text().catch(() => "")
      res.status(200).json({
        ok: false,
        error: `stripe ${stripeRes.status}`,
        detail: text.slice(0, 500),
      })
      return
    }

    const patched = ["statement_descriptor_suffix", "description", "metadata"]
    if (cart.email) patched.push("receipt_email")
    if (hasShipping && fullName) patched.push("shipping")

    res.status(200).json({ ok: true, patched, pi: piId })
  } catch (err: any) {
    res.status(200).json({ ok: false, error: err?.message || "unknown error" })
  }
}
