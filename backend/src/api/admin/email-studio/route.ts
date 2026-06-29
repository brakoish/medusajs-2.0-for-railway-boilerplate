import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INotificationModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { emailLogStats, listEmailLogs } from "../../../lib/email-log"
import {
  AbandonedCartTemplate,
  EmailTemplates,
  OrderPlacedTemplate,
  OrderShippedTemplate,
} from "../../../modules/email-notifications/templates"
import {
  ABANDONED_CART_PROMO_CODE,
  ABANDONED_CART_PROMO_PERCENT,
} from "../../../lib/abandoned-cart-offer"

type TestSendBody = {
  template?: string
  to?: string
}

const PREVIEW_TO = "willbrako@gmail.com"

const flowDefinitions = () => [
  {
    template: EmailTemplates.ORDER_PLACED,
    name: "Order confirmation",
    audience: "Customer",
    type: "Transactional",
    trigger: "Order placed",
    timing: "Immediately",
    status: "Live",
    editable: "Code review",
    strategy: "Confirm the order, show the exact kit, reinforce made-in-Brooklyn trust.",
  },
  {
    template: EmailTemplates.ORDER_SHIPPED,
    name: "Shipping confirmation",
    audience: "Customer",
    type: "Transactional",
    trigger: "Fulfillment has tracking",
    timing: "Immediately, plus manual resend in order admin",
    status: "Live",
    editable: "Code review",
    strategy: "Make tracking obvious and keep support paths simple.",
  },
  {
    template: EmailTemplates.ABANDONED_CART,
    name: "Abandoned cart",
    audience: "Customer",
    type: "Marketing",
    trigger: "Cart has email + items, no order, not unsubscribed",
    timing: `${process.env.ABANDONED_CART_RECOVERY_MIN_AGE_MINUTES || 60} minutes`,
    status: process.env.ABANDONED_CART_RECOVERY_ENABLED === "0" ? "Disabled" : "Live",
    editable: "Env + code review",
    strategy: `${ABANDONED_CART_PROMO_CODE} gives ${ABANDONED_CART_PROMO_PERCENT}% off. Button restores cart and applies code.`,
  },
  {
    template: EmailTemplates.PASSWORD_RESET,
    name: "Admin password reset",
    audience: "Admin",
    type: "Transactional",
    trigger: "Password reset requested",
    timing: "Immediately",
    status: "Live",
    editable: "Code review",
    strategy: "Plain utility email. Do not market here.",
  },
  {
    template: EmailTemplates.INVITE_USER,
    name: "Admin invite",
    audience: "Admin",
    type: "Transactional",
    trigger: "Admin invite created",
    timing: "Immediately",
    status: "Live",
    editable: "Code review",
    strategy: "Plain utility email. Do not market here.",
  },
  {
    template: EmailTemplates.UNSHIPPED_ORDER_REMINDER,
    name: "Unshipped order reminder",
    audience: "Internal",
    type: "Ops",
    trigger: "Scheduled job",
    timing: "Daily at 9 AM ET",
    status: "Live",
    editable: "Code review",
    strategy: "Keep fulfillment honest without touching customers.",
  },
]

const recommendations = [
  {
    title: "Add a delivery follow-up",
    priority: "High",
    note: "Send after delivered tracking. Ask if it arrived cleanly, include care tips, then ask for a review.",
  },
  {
    title: "Consider a second cart email",
    priority: "Medium",
    note: "Wait 24 hours. Use social proof and product photo, no bigger discount.",
  },
  {
    title: "Keep transactional emails discount-free",
    priority: "High",
    note: "Order and shipping emails should reduce anxiety, not train people to wait for coupons.",
  },
  {
    title: "Track conversion per cart email",
    priority: "Medium",
    note: "We have send logs now. Next step is marking orders that came from DABBACK10 recovery links.",
  },
]

const previewData = (template: string) => {
  switch (template) {
    case EmailTemplates.ORDER_PLACED:
      return {
        subject: "[Dab Pal preview] Order confirmation",
        data: {
          ...OrderPlacedTemplate.PreviewProps,
          emailOptions: {
            replyTo: "hello@thedabpal.com",
            subject: "[Dab Pal preview] Order confirmation",
            tags: [{ name: "preview", value: "email-studio" }],
          },
        },
      }
    case EmailTemplates.ORDER_SHIPPED:
      return {
        subject: "[Dab Pal preview] Shipping confirmation",
        data: {
          ...OrderShippedTemplate.PreviewProps,
          emailOptions: {
            replyTo: "hello@thedabpal.com",
            subject: "[Dab Pal preview] Shipping confirmation",
            tags: [{ name: "preview", value: "email-studio" }],
          },
        },
      }
    case EmailTemplates.ABANDONED_CART:
      return {
        subject: "[Dab Pal preview] Abandoned cart",
        data: {
          ...AbandonedCartTemplate.PreviewProps,
          emailOptions: {
            replyTo: "hello@thedabpal.com",
            subject: "[Dab Pal preview] Abandoned cart",
            tags: [{ name: "preview", value: "email-studio" }],
          },
        },
      }
    default:
      return null
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const [logs, stats] = await Promise.all([
    listEmailLogs(50).catch(() => []),
    emailLogStats().catch(() => []),
  ])

  res.json({
    flows: flowDefinitions(),
    logs,
    stats,
    recommendations,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as TestSendBody
  const template = body.template || ""
  const preview = previewData(template)

  if (!preview) {
    res.status(400).json({ error: "Only customer preview templates can be sent from Email Studio right now." })
    return
  }

  const notificationModuleService: INotificationModuleService = req.scope.resolve(Modules.NOTIFICATION)
  const to = body.to?.trim() || PREVIEW_TO

  await notificationModuleService.createNotifications({
    to,
    channel: "email",
    template,
    data: preview.data,
  })

  res.json({ ok: true, template, to })
}
