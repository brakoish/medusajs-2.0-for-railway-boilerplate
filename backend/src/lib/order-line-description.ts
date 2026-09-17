type Line = {
  product_title?: string | null
  title?: string | null
  variant_title?: string | null
  variant_sku?: string | null
  metadata?: Record<string, unknown> | null
}

export function orderLineDescription(item: Line) {
  const identity = [item.variant_sku, item.product_title, item.title, item.variant_title].filter(Boolean).join(" ")
  const finish = /WHT|white|marble/i.test(identity) ? "Marble"
    : /BLK|black|slate/i.test(identity) ? "Slate"
    : /custom/i.test(identity) ? "Custom" : ""
  return {
    title: finish ? `Dab Pal — ${finish}` : item.product_title || item.title || "Dab Pal",
    pack: item.variant_title || "",
    colors: typeof item.metadata?.custom_color_summary === "string" ? item.metadata.custom_color_summary : "",
    finish,
  }
}
