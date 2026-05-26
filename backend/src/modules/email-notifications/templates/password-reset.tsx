import { Button, Hr, Link, Section, Text } from '@react-email/components'
import { Base } from './base'

export const PASSWORD_RESET = 'password-reset'

export interface PasswordResetEmailProps {
  resetLink: string
  preview?: string
}

export const isPasswordResetData = (data: unknown): data is PasswordResetEmailProps => {
  if (!data || typeof data !== 'object') {
    return false
  }

  const value = data as Partial<PasswordResetEmailProps>

  return (
    typeof value.resetLink === 'string' &&
    (!value.preview || typeof value.preview === 'string')
  )
}

export const PasswordResetEmail = ({
  resetLink,
  preview = 'Reset your Dab Pal admin password.',
}: PasswordResetEmailProps) => {
  return (
    <Base preview={preview}>
      <Section className="text-center">
        <Text className="text-[#f59e0b] text-[18px] font-bold tracking-[0.12em] uppercase">
          DAB PAL
        </Text>
        <Text className="text-black text-[18px] font-semibold leading-[28px]">
          Reset your admin password
        </Text>
        <Text className="text-[#52525b] text-[14px] leading-[22px]">
          Use the button below to choose a new Medusa admin password. This link expires in 15 minutes.
        </Text>
        <Section className="mt-6 mb-[28px]">
          <Button
            className="bg-[#18181b] rounded text-white text-[13px] font-semibold no-underline px-5 py-3"
            href={resetLink}
          >
            Reset Password
          </Button>
        </Section>
        <Text className="text-[#52525b] text-[13px] leading-[20px]">
          If the button does not work, copy and paste this URL into your browser:
        </Text>
        <Text
          style={{
            maxWidth: '100%',
            wordBreak: 'break-all',
            overflowWrap: 'break-word',
          }}
        >
          <Link href={resetLink} className="text-[#f59e0b] no-underline">
            {resetLink}
          </Link>
        </Text>
      </Section>
      <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
      <Text className="text-[#666666] text-[12px] leading-[20px]">
        If you did not request this password reset, you can ignore this email.
      </Text>
    </Base>
  )
}

PasswordResetEmail.PreviewProps = {
  resetLink: 'https://admin.thedabpal.com/app/reset-password?token=abc123',
} as PasswordResetEmailProps

export default PasswordResetEmail
