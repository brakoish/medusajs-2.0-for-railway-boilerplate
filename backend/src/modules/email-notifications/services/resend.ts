import { Logger, NotificationTypes } from '@medusajs/framework/types'
import { AbstractNotificationProviderService, MedusaError } from '@medusajs/framework/utils'
import { Resend, CreateEmailOptions } from 'resend'
import { ReactNode } from 'react'
import { generateEmailTemplate } from '../templates'
import { logEmailSend } from '../../../lib/email-log'

type InjectedDependencies = {
  logger: Logger
}

interface ResendServiceConfig {
  apiKey: string
  from: string
}

export interface ResendNotificationServiceOptions {
  api_key: string
  from: string
}

type NotificationEmailOptions = Omit<
  CreateEmailOptions,
  'to' | 'from' | 'react' | 'html' | 'attachments'
>

const recipientsToString = (to: CreateEmailOptions["to"]) =>
  Array.isArray(to) ? to.join(", ") : String(to)

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "unknown error"

/**
 * Service to handle email notifications using the Resend API.
 */
export class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "RESEND_NOTIFICATION_SERVICE"
  protected config_: ResendServiceConfig // Configuration for Resend API
  protected logger_: Logger // Logger for error and event logging
  protected resend: Resend // Instance of the Resend API client

  constructor({ logger }: InjectedDependencies, options: ResendNotificationServiceOptions) {
    super()
    this.config_ = {
      apiKey: options.api_key,
      from: options.from
    }
    this.logger_ = logger
    this.resend = new Resend(this.config_.apiKey)
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `No notification information provided`)
    }
    if (notification.channel === 'sms') {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `SMS notification not supported`)
    }

    // Generate the email content using the template
    let emailContent: ReactNode

    try {
      emailContent = generateEmailTemplate(notification.template, notification.data)
    } catch (error) {
      if (error instanceof MedusaError) {
        throw error // Re-throw MedusaError for invalid template data
      }
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to generate email content for template: ${notification.template}`
      )
    }

    const emailOptions = notification.data.emailOptions as NotificationEmailOptions

    // Compose the message body to send via API to Resend
    const message: CreateEmailOptions = {
      to: notification.to,
      from: notification.from?.trim() ?? this.config_.from,
      react: emailContent,
      subject: emailOptions.subject ?? 'You have a new notification',
      headers: emailOptions.headers,
      replyTo: emailOptions.replyTo,
      cc: emailOptions.cc,
      bcc: emailOptions.bcc,
      tags: emailOptions.tags,
      text: emailOptions.text,
      attachments: Array.isArray(notification.attachments)
        ? notification.attachments.map((attachment) => ({
            content: attachment.content,
            filename: attachment.filename,
            content_type: attachment.content_type,
            disposition: attachment.disposition ?? 'attachment',
            id: attachment.id ?? undefined
          }))
        : undefined,
      scheduledAt: emailOptions.scheduledAt
    }

    const logSend = async ({
      status,
      providerMessageId,
      error,
    }: {
      status: "sent" | "failed"
      providerMessageId?: string | null
      error?: string | null
    }) => {
      try {
        await logEmailSend({
          template: notification.template,
          subject: message.subject,
          recipient: recipientsToString(message.to),
          sender: message.from,
          status,
          providerMessageId,
          error,
          tags: message.tags || null,
        })
      } catch (logError) {
        this.logger_.warn(
          `Failed to log "${notification.template}" email: ${errorMessage(logError)}`
        )
      }
    }

    // Send the email via Resend
    try {
      const result = await this.resend.emails.send(message)
      if (result.error) {
        await logSend({
          status: "failed",
          error: result.error.message,
        })
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Failed to send "${notification.template}" email to ${notification.to} via Resend: ${result.error.message}`
        )
      }

      await logSend({
        status: "sent",
        providerMessageId: result.data?.id,
      })
      this.logger_.log(
        `Successfully sent "${notification.template}" email to ${notification.to} via Resend`
      )
      return {} // Return an empty object on success
    } catch (error) {
      const resendError = error as {
        code?: string
        response?: { body?: { errors?: { message?: string }[] } }
      }
      const errorCode = resendError.code
      const responseError = resendError.response?.body?.errors?.[0]
      if (!(error instanceof MedusaError)) {
        await logSend({
          status: "failed",
          error: responseError?.message || errorMessage(error),
        })
      }
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send "${notification.template}" email to ${notification.to} via Resend: ${errorCode} - ${responseError?.message ?? 'unknown error'}`
      )
    }
  }
}
