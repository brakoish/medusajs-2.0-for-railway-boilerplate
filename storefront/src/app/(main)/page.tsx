import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import Hero from "@modules/home/components/hero"
import ProductFamilyGallery from "@modules/home/components/product-family-gallery"
import FeatureTrio from "@modules/home/components/feature-trio"
import DetailBlock from "@modules/home/components/detail-block"
import PalMap from "@modules/home/components/pal-map"
import Reviews from "@modules/home/components/reviews"
import FAQ from "@modules/home/components/faq"
import StructuredData from "@modules/home/components/structured-data"
import BreadcrumbSchema from "@modules/common/components/breadcrumb-schema"

export const metadata: Metadata = {
  title: "Dab Pal | Puffco Cleaning Kit and Dab Swab Case",
  description:
    "Portable dab cleaning kit for Puffco Peak, Pro, Proxy, e-rigs, and quartz bangers. Holds 30 Q-tips, a 1oz iso bottle, and clean/dirty swabs in one pocket case.",
  alternates: {
    canonical: getBaseURL(),
  },
}

export default async function Home() {
  return (
    <>
      <StructuredData />
      <BreadcrumbSchema items={[{ name: "Home", path: "" }]} />
      <Hero />
      <ProductFamilyGallery />
      <FeatureTrio />
      <DetailBlock />
      <Reviews />
      <PalMap />
      <FAQ />
    </>
  )
}
