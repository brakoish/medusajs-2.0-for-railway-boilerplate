import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import { getRegion } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"

type Props = {
  params: { handle: string }
}

const COUNTRY = "us"

export async function generateStaticParams() {
  const { response } = await getProductsList({ countryCode: COUNTRY })
  return response.products.map((product) => ({
    handle: product.handle,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = params
  const region = await getRegion(COUNTRY)
  if (!region) notFound()

  const product = await getProductByHandle(handle, region.id)
  if (!product) notFound()

  return {
    title: `${product.title} | Dab Pal`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Dab Pal`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  if (params.handle === "dab-pal-custom") {
    redirect("/store/custom")
  }

  const region = await getRegion(COUNTRY)
  if (!region) notFound()

  const pricedProduct = await getProductByHandle(params.handle, region.id)
  if (!pricedProduct) notFound()

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={COUNTRY}
    />
  )
}
