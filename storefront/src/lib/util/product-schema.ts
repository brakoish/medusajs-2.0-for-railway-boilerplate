import type { HttpTypes } from "@medusajs/types"
import type { ShopProduct } from "@modules/store/templates/shop-products"

export function buildProductSchema(
  product: ShopProduct,
  catalog: HttpTypes.StoreProduct,
  base: string
) {
  const variant = catalog.variants?.find((item) => item.sku === product.sku)
  const price = variant?.calculated_price
  const amount = price?.calculated_amount
  const currency = price?.currency_code
  const finish = product.handle === "white-speck" ? "marble" : "slate"
  const pack = product.sku?.endsWith("-3") ? "3" : product.sku?.endsWith("-6") ? "6" : "1"
  const url = `${base}/store?finish=${finish}&pack=${pack}`
  const availability =
    !variant?.manage_inventory || (variant.inventory_quantity ?? 0) > 0
      ? "InStock"
      : variant.allow_backorder
      ? "BackOrder"
      : "OutOfStock"

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Dab Pal — ${product.title}`,
    description: product.description,
    image: [`${base}${product.image}`],
    url,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Dab Pal" },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Closed dimensions",
        value: "80 × 80 × 25 mm",
      },
    ],
    ...(typeof amount === "number" &&
    Number.isFinite(amount) &&
    amount >= 0 &&
    currency
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: amount,
            priceCurrency: currency.toUpperCase(),
            availability: `https://schema.org/${availability}`,
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "Dab Pal", url: base },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "US",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 14,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
              merchantReturnLink: `${base}/shipping-returns`,
            },
          },
        }
      : {}),
  }
}

export function buildProductGroupSchema(
  products: { product: ShopProduct; catalog: HttpTypes.StoreProduct }[],
  base: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    "@id": `${base}/store#dab-pal`,
    name: "Dab Pal",
    description: "3D-printed dab swab case with separate clean and used swab storage, a slider, and an empty 1 oz bottle. Swabs and isopropyl alcohol not included.",
    url: `${base}/store`,
    productGroupID: "DABPAL",
    brand: { "@type": "Brand", name: "Dab Pal" },
    variesBy: ["https://schema.org/color", "https://schema.org/size"],
    hasVariant: products.flatMap(({ product, catalog }) => (catalog.variants || [])
      .filter(variant => variant.sku && /-(SINGLE|3|6)$/.test(variant.sku))
      .map(variant => {
        const pack = variant.sku!.endsWith("-3") ? "3-pack" : variant.sku!.endsWith("-6") ? "6-pack" : "Single"
        return {
          ...buildProductSchema({ ...product, sku: variant.sku! }, { ...catalog, variants: [variant] }, base),
          name: `Dab Pal — ${product.title} · ${pack}`,
          color: product.title === "Marble" ? "White" : "Black",
          size: pack,
          inProductGroupWithID: "DABPAL",
        }
      })),
  }
}
