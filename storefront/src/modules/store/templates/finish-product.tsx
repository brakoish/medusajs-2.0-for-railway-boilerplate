import { getProductByHandle } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"
import { buildProductGroupSchema } from "@lib/util/product-schema"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { shopProducts } from "./shop-products"
import UnifiedProduct, { type FinishCatalog } from "./unified-product"

const details = [
  ["Size & capacity", "80 × 80 × 25 mm closed. Holds 30 regular cotton swabs and the included 1 oz bottle. Specialty swab fit varies."],
  ["Construction", "3D printed to order. Small variations in texture and visible print layers are part of the process."],
]

const instructions = [
  "Fill the 1 oz bottle with your preferred 90%+ isopropyl alcohol.",
  "Load clean cotton swabs into the clean side.",
  "Swab your Puffco bowl, e-rig chamber, or banger after each dab.",
  "Slide used swabs behind the slider, toward the hinge, until you can toss them.",
]

export default async function FinishProductTemplate() {
  const region = await getRegion("us")
  if (!region) throw new Error("Store region unavailable")
  const products = await Promise.all(shopProducts.filter(product => product.available).map(async product => ({
    product,
    catalog: await getProductByHandle(product.medusaHandle!, region.id),
  })))
  const availableProducts = products.filter(item => !!item.catalog)
  if (!availableProducts.length) throw new Error("Product catalog unavailable")
  const catalog: FinishCatalog[] = availableProducts.map(item => ({
    finish: item.product.handle === "white-speck" ? "marble" : "slate",
    productId: item.catalog.id,
    variants: (item.catalog.variants || []).map(variant => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      manage_inventory: variant.manage_inventory,
      allow_backorder: variant.allow_backorder,
      inventory_quantity: variant.inventory_quantity,
      calculated_price: variant.calculated_price ? {
        calculated_amount: variant.calculated_price.calculated_amount,
        currency_code: variant.calculated_price.currency_code,
      } : undefined,
    })),
  }))
  return (
    <main className="studio-product">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductGroupSchema(availableProducts, getBaseURL())).replace(/</g, "\\u003c") }} />
      <section className="content-container py-6 small:py-12">
        <UnifiedProduct catalog={catalog}>
          <ProductDetails />
          <ProductInstructions />
        </UnifiedProduct>
      </section>
    </main>
  )
}

const ProductDetails = ({ className = "" }: { className?: string }) => (
  <div className={`divide-y divide-gray-200 ${className}`}>
    <h2 className="pt-5 pb-3 text-xl font-semibold">Product details</h2>
    {details.map(([title, body]) => (
      <div key={title} className="py-4">
        <h3 className="text-base font-semibold text-gray-950">{title}</h3>
        <p className="mt-1 text-base leading-relaxed text-gray-600">{body}</p>
      </div>
    ))}
  </div>
)

const ProductInstructions = ({ className = "" }: { className?: string }) => (
  <section className={`border-t border-gray-200 pt-5 ${className}`}>
    <h2 className="text-xl font-semibold text-gray-950">How to use it</h2>
    <p className="mt-3 text-sm text-gray-600">
      <LocalizedClientLink href="/care" className="underline">Case care</LocalizedClientLink>
      {" · "}
      <LocalizedClientLink href="/blog/how-to-clean-puffco-peak-pro-proxy" className="underline">Puffco cleaning guides</LocalizedClientLink>
    </p>
    <ol className="mt-3 grid gap-3">
      {instructions.map((instruction, index) => (
        <li key={instruction} className="flex gap-3 text-base leading-relaxed">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-gray-700">
            {index + 1}
          </span>
          <span className="text-gray-600">{instruction}</span>
        </li>
      ))}
    </ol>
  </section>
)
