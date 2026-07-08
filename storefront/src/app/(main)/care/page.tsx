import { Metadata } from "next"
import Image from "next/image"

import { getBaseURL } from "@lib/util/env"
import BreadcrumbSchema from "@modules/common/components/breadcrumb-schema"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const base = getBaseURL()

export const metadata: Metadata = {
  title: "Dab Pal Care Instructions",
  description:
    "Quick Dab Pal setup and care instructions for Q-tips, 90%+ iso, clean swabs, dirty swabs, and Puffco or banger cleaning.",
  alternates: {
    canonical: `${base}/care`,
  },
  openGraph: {
    title: "Dab Pal Care Instructions",
    description:
      "Set up your Dab Pal with Q-tips, 90%+ iso, and clean/dirty swab separation.",
    url: `${base}/care`,
  },
}

const steps = [
  "Fill the 1oz bottle with your preferred 90%+ iso.",
  "Load clean Q-tips into the clean side.",
  "Swab your Puffco bowl, e-rig chamber, or banger after each dab.",
  "Slide used swabs behind the slider, toward the hinge, until you can toss them.",
]

const notes = [
  "Dab Pal ships empty. Add your own iso.",
  "Keep iso away from device bases, USB ports, and electronics.",
  "Let cleaned parts fully dry before use.",
]

export default function CarePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "" },
          { name: "Care Instructions", path: "/care" },
        ]}
      />
      <main className="bg-white">
        <section className="border-b border-gray-100">
          <div className="content-container grid grid-cols-1 small:grid-cols-[0.85fr_1.15fr] gap-8 small:gap-16 py-10 small:py-16">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-amber-700">
                Dab Pal care
              </span>
              <h1 className="mt-4 text-4xl small:text-6xl font-semibold tracking-tight leading-[1.05] text-gray-950">
                Use it, clean it, keep the mess contained.
              </h1>
              <p className="mt-5 text-base small:text-lg leading-relaxed text-gray-600">
                A quick setup guide for the insert card, QR scans, and anyone
                opening Dab Pal for the first time.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LocalizedClientLink
                  href="/blog/how-to-clean-puffco-peak-pro"
                  className="inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Puffco guides
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/blog/how-to-clean-a-quartz-banger"
                  className="inline-flex rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:border-amber-300"
                >
                  Banger guide
                </LocalizedClientLink>
              </div>
            </div>

            <PrintableCareCard />
          </div>
        </section>

        <section className="content-container grid grid-cols-1 small:grid-cols-[minmax(0,680px)_minmax(260px,1fr)] gap-8 small:gap-14 py-10 small:py-16">
          <div>
            <h2 className="text-2xl small:text-3xl font-semibold tracking-tight text-gray-950">
              Quick setup
            </h2>
            <ol className="mt-5 grid gap-4">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-base leading-7">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-gray-700">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <aside className="rounded-lg border border-gray-200 bg-zinc-50 p-5">
            <h2 className="text-sm font-semibold text-gray-950">Care notes</h2>
            <ul className="mt-3 grid gap-3">
              {notes.map((note) => (
                <li
                  key={note}
                  className="text-sm leading-relaxed text-gray-600"
                >
                  {note}
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
    </>
  )
}

const PrintableCareCard = () => (
  <div className="mx-auto w-full max-w-[3.5in] rounded-lg border border-gray-200 bg-zinc-50 p-4 shadow-elevation-card-rest">
    <div className="rounded-md bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber-700">
            Dab Pal
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
            Quick care card
          </h2>
        </div>
        <Image
          src="/dab-pal/care-qr.png"
          alt="QR code for Dab Pal care instructions"
          width={92}
          height={92}
          className="rounded-md border border-gray-200"
        />
      </div>

      <ol className="mt-5 grid gap-2">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-2 text-xs leading-5 text-gray-700">
            <span className="font-semibold text-gray-950">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-5 border-t border-gray-200 pt-3 text-xs leading-5 text-gray-500">
        Scan for full Puffco, Pivot, Proxy, Plus, Peak, and banger cleaning
        guides.
      </p>
    </div>
  </div>
)
