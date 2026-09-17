import type { Metadata } from "next"
import SupportPage from "@modules/support/template"
import { supportPages } from "@modules/support/pages"
import { getBaseURL } from "@lib/util/env"
const page = supportPages["shipping-returns"]
export const metadata: Metadata = { title: `${page.title} · Dab Pal`, description: page.description, alternates: { canonical: `${getBaseURL()}/shipping-returns` } }
export default function Page() { return <SupportPage page={page} privacy={false} /> }
