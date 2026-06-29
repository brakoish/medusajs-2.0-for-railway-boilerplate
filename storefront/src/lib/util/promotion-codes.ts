export const PROMO_CODE_ALIASES: Record<string, string[]> = {
  DPSUPERFAM: ["DPSUPERFAM", "DPSUPERFAM-SHIP-6J9K"],
}

export const HIDDEN_PROMOTION_CODES = ["DPSUPERFAM-SHIP-6J9K"]
export const ABANDONED_CART_PROMO_CODE = "DABBACK10"
export const COMP_PROMO_CODE = "DPSUPERFAM"

export function expandPromotionCodes(codes: string[]) {
  const normalizedCodes = codes
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean)

  const filteredCodes = normalizedCodes.includes(COMP_PROMO_CODE)
    ? normalizedCodes.filter((code) => code !== ABANDONED_CART_PROMO_CODE)
    : normalizedCodes

  return Array.from(
    new Set(
      filteredCodes
        .flatMap((code) => PROMO_CODE_ALIASES[code] ?? [code])
    )
  )
}
