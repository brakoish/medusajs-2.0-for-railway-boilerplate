import { Metadata } from "next"
import { notFound } from "next/navigation"

import FinishProductTemplate from "@modules/store/templates/finish-product"
import { getShopProduct, shopProducts } from "@modules/store/templates/shop-products"

type Props = {
  params: { finish: string }
}

export function generateStaticParams() {
  return shopProducts.map((product) => ({
    finish: product.handle,
  }))
}

export function generateMetadata({ params }: Props): Metadata {
  const product = getShopProduct(params.finish)
  if (!product) notFound()

  return {
    title: `${product.title} Dab Pal | Shop`,
    description: product.description,
    openGraph: {
      title: `${product.title} Dab Pal | Shop`,
      description: product.description,
      images: [product.image],
    },
  }
}

export default async function FinishPage({ params }: Props) {
  const product = getShopProduct(params.finish)
  if (!product) notFound()

  return <FinishProductTemplate product={product} countryCode="us" />
}
