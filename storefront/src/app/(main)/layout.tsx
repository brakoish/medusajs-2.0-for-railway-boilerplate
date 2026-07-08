import { Metadata, Viewport } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"

const SITE_NAME = "Dab Pal"
const SITE_URL = getBaseURL()
const TAGLINE = "Puffco cleaning kit and dab swab case."
const DESCRIPTION =
  "Dab Pal is a portable Puffco cleaning kit and dab swab case with 30 Q-tips, a 1oz iso bottle, and clean/dirty swab storage. Made for Puffco Peak, Pro, Proxy, e-rigs, and quartz bangers."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  generator: "Next.js",
  keywords: [
    "dab pal",
    "puffco cleaning kit",
    "puffco q-tips holder",
    "puffco swab holder",
    "puffco peak cleaning kit",
    "dab cleaning kit",
    "dab swab case",
    "dab swab holder",
    "heady swab case",
    "heady swabs",
    "portable banger cleaner",
    "banger cleaning kit",
    "banger swab holder",
    "puffco peak accessories",
    "iso q-tips travel case",
    "isopropyl swab kit",
    "quartz banger cleaning",
    "e-rig accessories",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: DESCRIPTION,
    // Next.js will auto-attach src/app/opengraph-image.jpg
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: DESCRIPTION,
    // Next.js will auto-attach src/app/twitter-image.jpg
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

// theme-color sets the browser chrome color on Android Chrome / iOS Safari.
// Cream matches the brand background; tabs and address bars tint to it.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {props.children}
      <Footer />
    </>
  )
}
