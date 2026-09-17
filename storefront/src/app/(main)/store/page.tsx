import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import BreadcrumbSchema from "@modules/common/components/breadcrumb-schema"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

const base = getBaseURL()

export const metadata: Metadata = {
  title: "Shop Dab Pal Puffco Cleaning Kits",
  description:
    "Shop Dab Pal portable dab cleaning kits for Puffco, e-rigs, quartz bangers, Q-tips, iso, and clean/dirty swab storage.",
  alternates: {
    canonical: `${base}/store`,
  },
  openGraph: {
    title: "Shop Dab Pal Puffco Cleaning Kits",
    description:
      "Slate and Marble dab swab cases with Q-tip storage, iso bottle storage, and a clean/dirty slider.",
    url: `${base}/store`,
    images: ["/dab-pal/lineup.png"],
  },
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export default async function StorePage({ searchParams }: Params) {
  const { sortBy, page } = await searchParams

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "" },
          { name: "Shop", path: "/store" },
        ]}
      />
      <StoreTemplate sortBy={sortBy} page={page} countryCode="us" />
    </>
  )
}
