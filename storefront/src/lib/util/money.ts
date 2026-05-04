import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

// Currencies stored in subdivided units (cents/pence/etc.) by Medusa.
// Medusa stores prices in the smallest unit (e.g. USD cents). To display
// human-readable amounts we divide by the currency's exponent before
// formatting. Most currencies use 2 decimals; the few zero-decimal ones
// (JPY, KRW, VND, ...) and three-decimal ones (BHD, KWD, OMR, ...) are
// handled explicitly.
const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
])

const THREE_DECIMAL_CURRENCIES = new Set([
  "bhd",
  "iqd",
  "jod",
  "kwd",
  "lyd",
  "omr",
  "tnd",
])

const getDivisor = (currency_code: string) => {
  const c = currency_code?.toLowerCase()
  if (ZERO_DECIMAL_CURRENCIES.has(c)) return 1
  if (THREE_DECIMAL_CURRENCIES.has(c)) return 1000
  return 100
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  const displayAmount = amount / getDivisor(currency_code)

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(displayAmount)
}
