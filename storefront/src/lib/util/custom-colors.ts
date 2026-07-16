type ColorPart = {
  name?: string
  value?: string
}

type CustomColors = {
  body?: ColorPart
  lid?: ColorPart
  slider?: ColorPart
}

const label = (part: ColorPart | undefined) =>
  [part?.name, part?.value ? `(${part.value})` : ""].filter(Boolean).join(" ")

export const getCustomColorSummary = (
  metadata?: Record<string, unknown> | null
) => {
  const explicit = metadata?.custom_color_summary
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit
  }

  const colors = metadata?.custom_colors as CustomColors | undefined
  if (!colors) return null

  return [
    ["Body", label(colors.body)],
    ["Lid", label(colors.lid)],
    ["Slider", label(colors.slider)],
  ]
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}: ${value}`)
    .join(", ")
}
