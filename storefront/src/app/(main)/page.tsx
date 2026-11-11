import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import Hero from "@modules/home/components/hero"
import PalPicker from "@modules/home/components/pal-picker"
import StudioStory from "@modules/home/components/studio-story"
import FAQ from "@modules/home/components/faq"
import StructuredData from "@modules/home/components/structured-data"
import BreadcrumbSchema from "@modules/common/components/breadcrumb-schema"

export const metadata: Metadata = {
  title: { absolute: "Dab Pal | Cleaning Kit for Puffco Peak, Pro, Proxy & E-Rigs" },
  description:
    "A portable Puffco cleaning kit: keep clean Q-tips, used swabs and your iso bottle in one case. Fits Peak, Pro, Proxy, e-rig and banger routines. $25, made to order in NY.",
  alternates: {
    canonical: getBaseURL(),
  },
}

export default async function Home() {
  return (
    <main>
      <StructuredData />
      <BreadcrumbSchema items={[{ name: "Home", path: "" }]} />
      <Hero />
      <PalPicker />
      <StudioStory />
      <FAQ />
    </main>
  )
}
