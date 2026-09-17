import { Metadata } from "next"
import { Suspense } from "react"
import { getBaseURL } from "@lib/util/env"
import BreadcrumbSchema from "@modules/common/components/breadcrumb-schema"
import FinishProductTemplate from "@modules/store/templates/finish-product"

const base = getBaseURL()
export const metadata: Metadata = {
  title: { absolute: "Dab Pal | 3D-Printed Dab Swab Case" },
  description: "A 3D-printed dab swab case with separate clean and used swab storage. Choose Slate or Marble, in single, 3-pack, or 6-pack. Empty 1 oz bottle included.",
  alternates: { canonical: `${base}/store` },
  openGraph: {
    title: "Dab Pal | 3D-Printed Dab Swab Case",
    description: "Choose Slate or Marble. Case, slider, and empty 1 oz bottle included. Swabs and isopropyl alcohol not included.",
    url: `${base}/store`,
    images: ["/dab-pal/lineup.png"],
  },
}
export default function StorePage() {
  return <>
    <BreadcrumbSchema items={[{ name: "Home", path: "" }, { name: "Dab Pal", path: "/store" }]} />
    <Suspense fallback={<div className="content-container py-12" role="status">Loading Dab Pal…</div>}>
      <FinishProductTemplate />
    </Suspense>
  </>
}
