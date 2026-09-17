import { defineWidgetConfig } from "@medusajs/admin-sdk"
export default function OrderBuild({ data }: { data: { id: string; items?: any[] } }) {
  const custom = data.items?.filter(item => item.variant_sku === "DABPAL-CUSTOM-SINGLE") || []
  return <section className="mb-4 space-y-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-5 text-ui-fg-base"><h2 className="font-semibold">Build & production</h2>{custom.map(item => <p key={item.id} className="text-sm">{item.quantity} × Custom Dab Pal · {item.metadata?.custom_color_summary || "Color specification missing — confirm before printing."}</p>)}<a className="text-sm underline" href={`/app/dab-pal?order=${encodeURIComponent(data.id)}`}>Open build sheet and production status</a></section>
}
export const config = defineWidgetConfig({ zone: "order.details.before" })
