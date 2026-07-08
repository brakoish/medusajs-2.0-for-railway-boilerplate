import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getBaseURL } from "@lib/util/env"
import FinishProductTemplate from "@modules/store/templates/finish-product"
import {
  getShopProduct,
  shopProducts,
} from "@modules/store/templates/shop-products"

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

  const url = `${getBaseURL()}/store/${product.handle}`
  const title = `${product.title} Dab Pal | Puffco Cleaning Kit`
  const description = product.seoDescription ?? product.description

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      images: [product.image],
    },
  }
}

export default async function FinishPage({ params }: Props) {
  const product = getShopProduct(params.finish)
  if (!product) notFound()

  return <FinishProductTemplate product={product} countryCode="us" />
}
