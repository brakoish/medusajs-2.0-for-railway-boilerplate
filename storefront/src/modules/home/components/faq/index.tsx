"use client"

import { useState } from "react"

const faqs = [
  {
    q: "What is included, and how big is it?",
    a: "The case, clean/dirty slider, and empty 1oz bottle are included. Q-tips and iso are not included. Closed dimensions are 80 × 80 × 25 mm; the case holds 30 regular Q-tips.",
  },
  {
    q: "Will this fit my Puffco Peak / Pro / Proxy?",
    a: "Yes, the Dab Pal is designed for Puffco Peak, Peak Pro, and Proxy users, plus traditional quartz bangers and any e-rig setup. The kit holds the Q-tips and iso you use after every dab.",
  },
  {
    q: "Is the iso bottle filled?",
    a: "No. The 1oz bottle ships empty. Q-tips and isopropyl alcohol are not included; add your own before use.",
  },
  {
    q: "How does the slider work?",
    a: "There's a moveable divider inside the case. As you use Q-tips, slide them to the 'used' side, so clean ones stay separate and you never grab a dirty swab by mistake.",
  },
  {
    q: "Can I use it for dab swabs or cotton swabs?",
    a: "Yes. Dab Pal is sized for regular cotton swabs and Q-tips, the kind most people use for Puffco bowls, e-rigs, and quartz banger cleaning.",
  },
  {
    q: "How fast does it ship?",
    a: "Each Dab Pal is made to order in our Astoria, NY shop. Allow 3–5 business days for handling before shipping. Delivery time is additional. You'll get tracking when it goes out.",
  },
  {
    q: "Is it 3D printed?",
    a: "Yes. We chose 3D printing because it lets us tune the wall strength, the speckle finish, and the slider tolerances to spec. Each kit is hand-finished after printing, so small differences in texture or layer detail are normal and expected.",
  },
  {
    q: "Is it waterproof?",
    a: "It is not waterproof. Keep it dry, away from heat, and do not submerge it.",
  },
  {
    q: "Returns?",
    a: "We accept returns within 14 days of delivery, including opened kits. Email hello@thedabpal.com to arrange a return. You pay change-of-mind return shipping; we cover damaged or incorrect items.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="studio-faq scroll-mt-32">
      <div className="content-container">
        <div className="max-w-2xl mb-12 small:mb-16">
          <span className="uppercase tracking-[0.25em] text-xs text-gray-500">
            Questions
          </span>
          <h2 className="text-3xl small:text-5xl font-semibold tracking-tight mt-4 leading-tight">
            Quick answers.
          </h2>
        </div>
        <div className="max-w-3xl border-t border-gray-200">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="border-b border-gray-200">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-lg small:text-xl font-medium">
                    {faq.q}
                  </span>
                  <span
                    className={`flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div id={`faq-answer-${i}`} className="pb-6 pr-12 text-base text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
