import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import BuySection from "@modules/home/components/buy-section"
import FeatureTrio from "@modules/home/components/feature-trio"
import DetailBlock from "@modules/home/components/detail-block"
import Reviews from "@modules/home/components/reviews"
import FAQ from "@modules/home/components/faq"

export const metadata: Metadata = {
  title: "Dab Pal — Portable Q-tip and Iso Case for Puffco & Quartz Bangers",
  description:
    "The Dab Pal is a slim, made-to-order case that holds 30 Q-tips and a 1oz iso bottle, with a built-in slider to keep clean and dirty separate. Made in NY.",
}

export default async function Home() {
  return (
    <>
      <Hero />
      <BuySection countryCode="us" />
      <FeatureTrio />
      <DetailBlock />
      <Reviews />
      <FAQ />
    </>
  )
}
