import type { Metadata } from "next"
import SupportPage from "@modules/support/template"
import { supportPages } from "@modules/support/pages"
import { getBaseURL } from "@lib/util/env"
const page = supportPages["privacy"]
export const metadata: Metadata = { title: page.title, description: page.description, alternates: { canonical: `${getBaseURL()}/privacy` } }
export default function Page() { return <SupportPage page={page} privacy={true} /> }
