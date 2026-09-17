import { Metadata } from "next"
import { Suspense } from "react"
import { getBaseURL } from "@lib/util/env"
import BreadcrumbSchema from "@modules/common/components/breadcrumb-schema"
import FinishProductTemplate from "@modules/store/templates/finish-product"
import { getDabPalSettings } from "@lib/data/dabpal-settings"

const base = getBaseURL()
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getDabPalSettings()
  return {
  title: { absolute: `${settings.title} | 3D-Printed Dab Swab Case` },
  description: `${settings.description} ${settings.included}`,
  alternates: { canonical: `${base}/store` },
  twitter: { card: "summary_large_image", title: `${settings.title} | 3D-Printed Dab Swab Case`, description: `${settings.description} ${settings.included}`, images: [settings.finishes.slate.image] },
  openGraph: {
    title: `${settings.title} | 3D-Printed Dab Swab Case`,
    description: `${settings.description} ${settings.included}`,
    url: `${base}/store`,
    images: [settings.finishes.slate.image],
  },
}
}
export default function StorePage() {
  return <>
    <BreadcrumbSchema items={[{ name: "Home", path: "" }, { name: "Dab Pal", path: "/store" }]} />
    <Suspense fallback={<div className="content-container py-12" role="status">Loading Dab Pal…</div>}>
      <FinishProductTemplate />
    </Suspense>
  </>
}
