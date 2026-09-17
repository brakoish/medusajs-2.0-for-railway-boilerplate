import { INotificationModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { BACKEND_URL } from '../lib/constants'
import { EmailTemplates } from '../modules/email-notifications/templates'

type PasswordResetEventData = {
  entity_id: string
  actor_type: string
  token: string
}

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetEventData>) {
  if (!['user', 'customer'].includes(data.actor_type)) {
    console.warn(`[password-reset] Unsupported actor type "${data.actor_type}", skipping reset email`)
    return
  }

  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const isCustomer = data.actor_type === 'customer'
  const resetBase = isCustomer ? 'https://thedabpal.com/reset-password' : `${BACKEND_URL}/app/reset-password`
  const resetLink = `${resetBase}?token=${encodeURIComponent(data.token)}`

  try {
    await notificationModuleService.createNotifications({
      to: data.entity_id,
      channel: 'email',
      template: EmailTemplates.PASSWORD_RESET,
      data: {
        emailOptions: {
          replyTo: 'hello@thedabpal.com',
          subject: isCustomer ? 'Reset your Dab Pal password' : 'Reset your Dab Pal admin password',
        },
        resetLink,
        preview: isCustomer ? 'Reset your Dab Pal password.' : 'Reset your Dab Pal admin password.',
        isCustomer,
      },
    })
  } catch (error) {
    console.error('[password-reset] Error sending password reset notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'auth.password_reset',
}
