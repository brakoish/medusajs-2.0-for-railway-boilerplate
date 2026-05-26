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
  if (data.actor_type !== 'user') {
    console.warn(`[password-reset] Unsupported actor type "${data.actor_type}", skipping reset email`)
    return
  }

  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const resetLink = `${BACKEND_URL}/app/reset-password?token=${encodeURIComponent(data.token)}`

  try {
    await notificationModuleService.createNotifications({
      to: data.entity_id,
      channel: 'email',
      template: EmailTemplates.PASSWORD_RESET,
      data: {
        emailOptions: {
          replyTo: 'hello@thedabpal.com',
          subject: 'Reset your Dab Pal admin password',
        },
        resetLink,
        preview: 'Reset your Dab Pal admin password.',
      },
    })
  } catch (error) {
    console.error('[password-reset] Error sending password reset notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'auth.password_reset',
}
