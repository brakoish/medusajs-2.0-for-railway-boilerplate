import { defineWidgetConfig } from "@medusajs/admin-sdk"
export default function ProductStudioLink({ data }: { data: { handle?: string } }) {
  if (!data.handle?.startsWith("dab-pal")) return null
  return <div className="mb-4 rounded-xl border border-ui-border-base bg-ui-bg-base p-5 text-sm text-ui-fg-base"><strong>Storefront content</strong><p className="mt-2">Manage customer-facing copy, finish photographs and custom colors in <a className="underline" href="/app/dab-pal-products">Product Studio</a>. Use the catalog below for prices and stock.</p></div>
}
export const config = defineWidgetConfig({ zone: "product.details.before" })
