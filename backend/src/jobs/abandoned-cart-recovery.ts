import {
  ICartModuleService,
  INotificationModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { EmailTemplates } from "../modules/email-notifications/templates"
import {
  createMarketingToken,
  isMarketingSuppressed,
  normalizeMarketingEmail,
} from "../lib/marketing-suppression"

type RecoveryCartItem = {
  id?: string
  title?: string | null
  variant_title?: string | null
  quantity?: number | string | null
  unit_price?: number | string | null
}

type RecoveryCart = {
  id: string
  email?: string | null
  currency_code?: string | null
  item_subtotal?: number | string | { value?: number | string } | null
  completed_at?: string | Date | null
  updated_at?: string | Date | null
  metadata?: Record<string, unknown> | null
  items?: RecoveryCartItem[] | null
  shipping_address?: {
    first_name?: string | null
  } | null
}

const STARTED_AT = new Date(
  process.env.ABANDONED_CART_RECOVERY_STARTED_AT || "2026-06-29T16:00:00.000Z"
)
const MIN_AGE_MINUTES = Number(process.env.ABANDONED_CART_RECOVERY_MIN_AGE_MINUTES || 90)
const MAX_AGE_DAYS = Number(process.env.ABANDONED_CART_RECOVERY_MAX_AGE_DAYS || 7)
const MAX_PER_RUN = Number(process.env.ABANDONED_CART_RECOVERY_MAX_PER_RUN || 10)

const storefrontUrl = () =>
  (process.env.STOREFRONT_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://thedabpal.com").replace(/\/+$/, "")

const backendUrl = () =>
  (
    process.env.BACKEND_PUBLIC_URL ||
    process.env.RAILWAY_PUBLIC_DOMAIN_VALUE ||
    "https://backend-production-2b05.up.railway.app"
  )
    .replace(/^([^h])/, "https://$1")
    .replace(/\/+$/, "")

const amountValue = (amount: RecoveryCart["item_subtotal"]) => {
  if (amount && typeof amount === "object" && "value" in amount) {
    return Number(amount.value || 0)
  }

  return Number(amount || 0)
}

const hasItems = (cart: RecoveryCart) =>
  Array.isArray(cart.items) &&
  cart.items.some((item) => Number(item.quantity || 0) > 0)

const isRecoverable = (cart: RecoveryCart) => {
  if (!cart.email || cart.completed_at || !hasItems(cart)) return false

  const metadata = cart.metadata || {}
  if (metadata.abandoned_cart_recovery_sent_at) return false
  if (metadata.abandoned_cart_recovery_suppressed_at) return false

  const updatedAt = cart.updated_at ? new Date(cart.updated_at).getTime() : 0
  if (!Number.isFinite(updatedAt)) return false

  return updatedAt >= STARTED_AT.getTime()
}

const recoveryUrls = (email: string, cartId: string) => {
  const normalized = normalizeMarketingEmail(email)
  const token = createMarketingToken(normalized)
  const params = new URLSearchParams({ email: normalized, token })

  return {
    cartUrl: `${storefrontUrl()}/checkout?cart_id=${encodeURIComponent(cartId)}`,
    unsubscribeUrl: `${backendUrl()}/store/marketing/unsubscribe?${params.toString()}`,
  }
}

export default async function abandonedCartRecovery(container: MedusaContainer) {
  if (process.env.ABANDONED_CART_RECOVERY_ENABLED === "0") {
    console.log("[abandoned-cart-recovery] Disabled by env")
    return
  }

  const cartModuleService: ICartModuleService = container.resolve(Modules.CART)
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)

  const now = new Date()
  const maxUpdatedAt = new Date(now.getTime() - MIN_AGE_MINUTES * 60_000)
  const minUpdatedAt = new Date(now.getTime() - MAX_AGE_DAYS * 86_400_000)
  const lowerBound = STARTED_AT > minUpdatedAt ? STARTED_AT : minUpdatedAt

  const carts = (await cartModuleService.listCarts(
    {
      updated_at: {
        $gte: lowerBound.toISOString(),
        $lte: maxUpdatedAt.toISOString(),
      },
      completed_at: {
        $eq: null,
      },
    } as never,
    {
      take: 100,
      order: {
        updated_at: "ASC",
      },
      relations: ["items", "shipping_address"],
    }
  )) as RecoveryCart[]

  const candidates = carts.filter(isRecoverable).slice(0, MAX_PER_RUN)
  if (!candidates.length) {
    console.log("[abandoned-cart-recovery] No recoverable carts")
    return
  }

  let sent = 0
  for (const cart of candidates) {
    const email = normalizeMarketingEmail(cart.email || "")
    if (!email) continue

    if (await isMarketingSuppressed(email)) {
      await cartModuleService.updateCarts(cart.id, {
        metadata: {
          ...(cart.metadata || {}),
          abandoned_cart_recovery_suppressed_at: now.toISOString(),
        },
      })
      continue
    }

    const { cartUrl, unsubscribeUrl } = recoveryUrls(email, cart.id)
    const firstName = cart.shipping_address?.first_name || undefined

    await notificationModuleService.createNotifications({
      to: email,
      channel: "email",
      template: EmailTemplates.ABANDONED_CART,
      data: {
        emailOptions: {
          replyTo: "hello@thedabpal.com",
          subject: "Still thinking it over?",
          tags: [
            { name: "campaign", value: "abandoned-cart" },
            { name: "cart_id", value: cart.id },
          ],
        },
        firstName,
        cartUrl,
        unsubscribeUrl,
        items: cart.items || [],
        subtotal: amountValue(cart.item_subtotal),
        currencyCode: cart.currency_code || "usd",
        preview: "Your Dab Pal is still saved.",
      },
    })

    await cartModuleService.updateCarts(cart.id, {
      metadata: {
        ...(cart.metadata || {}),
        abandoned_cart_recovery_sent_at: now.toISOString(),
      },
    })

    sent += 1
  }

  console.log(`[abandoned-cart-recovery] Sent ${sent} recovery email${sent === 1 ? "" : "s"}`)
}

export const config = {
  name: "abandoned-cart-recovery",
  schedule: {
    cron: "*/30 * * * *",
    concurrency: "forbid" as const,
  },
}
