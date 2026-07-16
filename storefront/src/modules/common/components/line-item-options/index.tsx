import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { getCustomColorSummary } from "@lib/util/custom-colors"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  metadata?: Record<string, unknown> | null
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  metadata,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  const customColorSummary = getCustomColorSummary(metadata)

  return (
    <span className="block">
      <Text
        data-testid={dataTestid}
        data-value={dataValue}
        className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
      >
        {variant?.title}
      </Text>
      {customColorSummary && (
        <Text className="mt-1 block text-xs leading-5 text-ui-fg-subtle whitespace-normal">
          {customColorSummary}
        </Text>
      )}
    </span>
  )
}

export default LineItemOptions
