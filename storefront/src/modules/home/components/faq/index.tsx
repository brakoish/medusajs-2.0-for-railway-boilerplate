"use client"

import { useState } from "react"

const faqs = [
  {
    q: "Will this fit my Puffco Peak / Pro / Proxy?",
    a: "Yes, the Dab Pal is designed for Puffco Peak, Peak Pro, and Proxy users, plus traditional quartz bangers and any e-rig setup. The kit holds the Q-tips and iso you use after every dab.",
  },
  {
    q: "Is the iso bottle filled?",
    a: "No. We ship the bottle empty so it can travel safely (no airline issues, no leaks in transit). Fill it with your preferred isopropyl when it arrives.",
  },
  {
    q: "How does the slider work?",
    a: "There's a moveable divider inside the case. As you use Q-tips, slide them to the 'used' side, so clean ones stay separate and you never grab a dirty swab by mistake.",
  },
  {
    q: "How fast does it ship?",
    a: "Each Dab Pal is made to order in our Astoria, NY shop. Most orders ship in 2 to 3 business days. You'll get tracking when it goes out.",
  },
  {
    q: "Returns?",
    a: "Unopened kits can be returned within 14 days for a full refund. Reach out at hello@dabpal.com if anything's wrong.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-white py-20 small:py-32 scroll-mt-24">
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
                  <div className="pb-6 pr-12 text-base text-gray-600 leading-relaxed">
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
