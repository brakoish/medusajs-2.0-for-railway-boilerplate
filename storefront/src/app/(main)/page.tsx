import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import Hero from "@modules/home/components/hero"
import PalPicker from "@modules/home/components/pal-picker"
import StudioStory from "@modules/home/components/studio-story"
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
      <PalPicker />
      <StudioStory />
      <FAQ />
    </>
  )
}
