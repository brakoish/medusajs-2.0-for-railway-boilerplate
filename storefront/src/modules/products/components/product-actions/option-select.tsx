import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"
import { convertToLocale } from "@lib/util/money"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  /**
   * All product variants. Used to resolve a per-option-value price so we
   * can render small per-unit / savings hints under each pack-size pill.
   * Optional — the picker still works without it (no hints rendered).
   */
  variants?: HttpTypes.StoreProductVariant[]
  "data-testid"?: string
}

/**
 * Resolve the per-unit price hint and savings vs. the cheapest unit price
 * for a given option value. Returns:
 *   - perUnit:    "$25.00/ea"
 *   - savings:    "Save $30" (or null if this is the cheapest)
 *   - currency:   ISO currency code
 *
 * Logic:
 *   1. Find any variant whose option_values contain (option.title, value).
 *      Pricing for the same pack-size is identical across colors, so we
 *      take the first match.
 *   2. Parse pack count from the option value text (e.g. "3-Pack" -> 3).
 *      If we can't, we still show the variant price as per-unit.
 *   3. Compare per-unit cost across all sibling option values to compute
 *      savings.
 */
function buildPackHints(
  option: HttpTypes.StoreProductOption,
  variants: HttpTypes.StoreProductVariant[]
) {
  const optionTitle = option.title ?? ""
  // Only do this for the Pack Size option. Other options (Color) get no hint.
  if (!/pack/i.test(optionTitle)) return null

  const valueToVariant: Record<string, HttpTypes.StoreProductVariant> = {}
  for (const v of variants) {
    for (const ov of v.options ?? []) {
      const ovTitle =
        (ov as any).option?.title ?? (ov as any).option_id ?? ""
      const ovValue = ov.value as string | undefined
      if (!ovValue) continue
      const match = ovTitle === optionTitle || ovTitle === option.id
      if (match && !valueToVariant[ovValue]) {
        valueToVariant[ovValue] = v
      }
    }
  }

  type Row = {
    value: string
    amount: number // dollars (Medusa 2.x decimal)
    qty: number
    perUnit: number
    currency: string
  }
  const rows: Row[] = []
  for (const [value, variant] of Object.entries(valueToVariant)) {
    const cp = (variant as any).calculated_price
    const amount = cp?.calculated_amount as number | undefined
    if (typeof amount !== "number") continue
    const m = value.match(/(\d+)/)
    const qty = m ? parseInt(m[1], 10) : 1
    rows.push({
      value,
      amount,
      qty,
      perUnit: amount / qty,
      currency: (cp?.currency_code || "usd").toLowerCase(),
    })
  }
  if (!rows.length) return null

  const cheapestUnit = Math.min(...rows.map((r) => r.perUnit))

  return Object.fromEntries(
    rows.map((r) => {
      const isCheapest = r.perUnit === cheapestUnit
      const baseTotal = r.qty * (rows.find((x) => x.qty === 1)?.perUnit || r.perUnit)
      const savings = baseTotal - r.amount
      return [
        r.value,
        {
          perUnit: convertToLocale({
            amount: r.perUnit,
            currency_code: r.currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          // Total price for this pack, no decimal (e.g. "$25", "$65", "$120")
          totalPrice: convertToLocale({
            amount: r.amount,
            currency_code: r.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }),
          savings:
            savings > 0.5
              ? `Save ${convertToLocale({
                  amount: Math.round(savings),
                  currency_code: r.currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`
              : null,
          isCheapestUnit: isCheapest,
        },
      ]
    })
  ) as Record<
    string,
    { perUnit: string; totalPrice: string; savings: string | null; isCheapestUnit: boolean }
  >
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  variants,
  "data-testid": dataTestId,
  disabled,
}) => {
  // Sort Pack Size options: Single first (no digits → 0), then by pack count.
  // Color options are unaffected (no digits → stable order).
  const filteredOptions = option.values
    ?.map((v) => v.value)
    .sort((a, b) => {
      const order = (s?: string) => {
        if (!s) return 999
        const m = s.match(/(\d+)/)
        return m ? parseInt(m[1], 10) : 0
      }
      return order(a) - order(b)
    })

  const hints = variants?.length ? buildPackHints(option, variants) : null

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div
        className="flex flex-wrap justify-between gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions?.map((v) => {
          const hint = v && hints ? hints[v] : null
          return (
            <button
              onClick={() => updateOption(option.title ?? "", v ?? "")}
              key={v}
              className={clx(
                "relative border-ui-border-base bg-ui-bg-subtle border rounded-rounded flex-1 transition-shadow ease-in-out duration-150",
                hint
                  ? "py-2 px-2 min-h-[56px]"
                  : "h-10 p-2 text-small-regular",
                {
                  "border-ui-border-interactive": v === current,
                  "hover:shadow-elevation-card-rest": v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {hint ? (
                <div className="flex flex-col items-center justify-center leading-tight">
                  <span className="text-sm font-medium">{v}</span>
                  <span className={clx(
                    "text-[10px] font-semibold mt-0.5 uppercase tracking-wide",
                    hint.savings ? "text-amber-600" : "text-gray-400"
                  )}>
                    {hint.savings ?? hint.totalPrice}
                  </span>
                </div>
              ) : (
                v
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
