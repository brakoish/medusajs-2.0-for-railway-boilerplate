import { Resend } from "resend"
import * as React from "react"
import { AbandonedCartTemplate } from "../modules/email-notifications/templates/abandoned-cart"
import { OrderPlacedTemplate } from "../modules/email-notifications/templates/order-placed"
import { OrderShippedTemplate } from "../modules/email-notifications/templates/order-shipped"

const to = process.env.EMAIL_PREVIEW_TO || "willbrako@gmail.com"
const from = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set")
}

if (!from) {
  throw new Error("RESEND_FROM_EMAIL is not set")
}

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendPreview(subject: string, react: React.ReactElement) {
  const result = await resend.emails.send({
    from,
    to,
    subject,
    react,
  })

  if (result.error) {
    throw new Error(`${subject}: ${result.error.message}`)
  }

  console.log(`${subject}: ${result.data?.id}`)
}

async function main() {
  await sendPreview(
    "[Dab Pal preview] Order confirmation",
    <OrderPlacedTemplate {...OrderPlacedTemplate.PreviewProps} />
  )

  await sendPreview(
    "[Dab Pal preview] Shipping confirmation",
    <OrderShippedTemplate {...OrderShippedTemplate.PreviewProps} />
  )

  await sendPreview(
    "[Dab Pal preview] Abandoned cart",
    <AbandonedCartTemplate {...AbandonedCartTemplate.PreviewProps} />
  )
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
