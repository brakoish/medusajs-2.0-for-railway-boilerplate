import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

// Medusa 2 stores prices in major units (e.g. USD dollars), not cents.
// `$20.00` is stored as `20`, `$20.50` as `20.5`. So we pass the amount
// straight into Intl.NumberFormat with no divisor.
// Ref: https://docs.medusajs.com/resources/commerce-modules/pricing/concepts
export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString()
}
