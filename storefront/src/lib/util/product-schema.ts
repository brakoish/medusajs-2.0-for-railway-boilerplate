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
  const url = `${base}/store/${product.handle}`
  const availability =
    !variant?.manage_inventory || (variant.inventory_quantity ?? 0) > 0
      ? "InStock"
      : variant.allow_backorder
      ? "BackOrder"
      : "OutOfStock"

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.title} Dab Pal`,
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
