import { Metadata } from "next"

import Hero from "@modules/home/components/hero"

export const metadata: Metadata = {
  title: "Dab Pal — Portable Q-tip and Iso Case",
  description:
    "The Dab Pal is a sleek, portable case for cleaning Puffco and quartz bangers anywhere. Holds 50 cotton swabs and a 1oz iso bottle. Made to order in NY.",
}

export default async function Home() {
  return (
    <>
      <Hero />
    </>
  )
}
