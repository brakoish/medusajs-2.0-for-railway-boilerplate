import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import BreadcrumbSchema from "@modules/common/components/breadcrumb-schema"
import { BlogIndexTemplate } from "@modules/blog/templates"

const base = getBaseURL()

export const metadata: Metadata = {
  title: "Dab Cleaning Guides",
  description:
    "Cleaning guides for Puffco, Dr. Dabber, quartz bangers, and glass. Compare dab swabs, choose supplies, and follow care instructions for your exact gear.",
  alternates: {
    canonical: `${base}/blog`,
  },
  openGraph: {
    title: "Dab Cleaning Guides | Dab Pal",
    description:
      "Practical cleaning guides for Puffco, Dr. Dabber, quartz bangers, glass, and dab swabs.",
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
