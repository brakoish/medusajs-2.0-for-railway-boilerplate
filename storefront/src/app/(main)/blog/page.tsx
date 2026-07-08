import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import BreadcrumbSchema from "@modules/common/components/breadcrumb-schema"
import { BlogIndexTemplate } from "@modules/blog/templates"

const base = getBaseURL()

export const metadata: Metadata = {
  title: "Dab Cleaning Guides",
  description:
    "Puffco cleaning, quartz banger care, dab swab storage, and travel cleaning kit guides from Dab Pal.",
  alternates: {
    canonical: `${base}/blog`,
  },
  openGraph: {
    title: "Dab Cleaning Guides | Dab Pal",
    description:
      "Practical Puffco, e-rig, quartz banger, and dab swab cleaning guides.",
    url: `${base}/blog`,
  },
}

export default function BlogPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "" },
          { name: "Guides", path: "/blog" },
        ]}
      />
      <BlogIndexTemplate />
    </>
  )
}
