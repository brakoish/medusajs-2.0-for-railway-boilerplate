export const PROMO_CODE_ALIASES: Record<string, string[]> = {
  DPSUPERFAM: ["DPSUPERFAM", "DPSUPERFAM-SHIP-6J9K"],
}

export const HIDDEN_PROMOTION_CODES = ["DPSUPERFAM-SHIP-6J9K"]

export function expandPromotionCodes(codes: string[]) {
  return Array.from(
    new Set(
      codes
        .map((code) => code.trim().toUpperCase())
        .filter(Boolean)
        .flatMap((code) => PROMO_CODE_ALIASES[code] ?? [code])
    )
  )
}
