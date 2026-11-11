import type { BlogArticle } from "./articles"

/**
 * Hub guide for the "puffco cleaning kit" search. It answers the question
 * people search for (what goes in a kit, per model) and points to the
 * model guides and the product. Facts mirror the sourced model guides.
 */
export const puffcoCleaningKitGuide: BlogArticle = {
  slug: "puffco-cleaning-kit",
  title: "Puffco Cleaning Kit: What You Need for Peak, Pro, Proxy & Pivot",
  eyebrow: "Puffco cleaning kit",
  description:
    "Build a Puffco cleaning kit that matches your model: cotton swabs, 90%+ isopropyl alcohol, a soak container, and a place for used swabs. Model-by-model checklist.",
  publishedAt: "2026-11-11",
  updatedAt: "2026-11-11",
  readingMinutes: 5,
  keywords: [
    "puffco cleaning kit",
    "best puffco cleaning kit",
    "puffco peak cleaning kit",
    "puffco peak pro cleaning kit",
    "puffco proxy cleaning kit",
    "puffco cleaning supplies",
    "e-rig cleaning kit",
  ],
  cover: {
    title: ["Build your", "kit."],
    subtitle: "Puffco cleaning kit checklist",
    dark: true,
  },
  sources: [
    { label: "Puffco: current Peak care and recommended solution", url: "https://www.puffco.com/pages/new-peak-support" },
    { label: "Puffco: Proxy care by component", url: "https://www.puffco.com/pages/proxy-support" },
    { label: "Puffco: original Peak cleaning instructions", url: "https://puffco.zendesk.com/hc/en-us/articles/360055108754-How-do-I-clean-my-Peak" },
    { label: "Puffco Dual Tool product page", url: "https://www.puffco.com/products/the-puffco-dual-tool" },
  ],
  affiliateProducts: ["qtips"],
  howTo: {
    totalTime: "PT35M",
    supplies: ["Cotton swabs", "90% or stronger isopropyl alcohol", "Paper towel or a clean cloth"],
    tools: ["Small container that fits the removable parts", "A case or holder that keeps used swabs apart"],
    steps: [
      "Check your exact Puffco model and which parts its instructions allow you to soak.",
      "After each session, swab the warm (not hot) chamber with a dry or lightly iso-dampened cotton swab.",
      "For a deep clean, let everything cool, remove the approved parts and soak them in 90%+ iso, keeping the electronic base out.",
      "Rinse only the parts your model's instructions say can be rinsed, then let everything air-dry completely.",
      "Restock clean swabs and empty the used-swab side before your next session.",
    ],
  },
  intro: [
    "A Puffco cleaning kit needs four things: cotton swabs, 90% or stronger isopropyl alcohol, a small container for soaking the parts your model allows, and somewhere to put used swabs so they never mix with clean ones. Most people already own the first three.",
    "What changes from model to model is which parts can be soaked. The electronic base never goes in alcohol, and some parts, like the New Proxy Core cup, should not be soaked at all. Use the checklist below, then open the guide for your device.",
  ],
  comparison: [
    { type: "Peak / Peak Pro", use: "Swabs and 90%+ iso for the chamber; a container for soaking the glass.", check: "Puffco's current Peak support names 99% iso as its preferred solution. Keep the base dry." },
    { type: "Proxy", use: "Swabs and 90%+ iso; a container for a 20–30 minute chamber soak.", check: "Do not soak the New Proxy Core cup. Use Puffco's soak-and-rinse method for glass and avoid abrasives." },
    { type: "Pivot", use: "Swabs and 90%+ iso; a container for the chamber and mouthpiece.", check: "Soak the chamber 20–30 minutes; wipe the base connection with a swab instead of soaking it." },
    { type: "Plus", use: "Tightly wound cotton swabs and iso for the chamber and Dart.", check: "Do not soak gunmetal parts in rubbing alcohol." },
  ],
  sections: [
    {
      heading: "1. Cotton swabs: the part you use every session",
      body: [
        "Puffco recommends a tightly wound cotton swab for wiping byproduct out of the chamber. Regular Q-tips do that job. Puffco's own Dual Tool pairs a cotton swab with a loading end, which is handy if you also want a loader, but it is not required.",
        "Plan for one or two swabs per session and keep a small supply where you dab. Specialty tips are worth buying only when their shape solves a real reach problem.",
      ],
    },
    {
      heading: "2. Isopropyl alcohol: 90% or stronger",
      body: [
        "Puffco's instructions call for 90% or higher isopropyl alcohol, so both 91% and 99% meet the stated concentration. Lower percentages carry more water, which is why drugstore 70% is a poor fit here.",
        "A small refillable bottle is enough for routine swabbing. Keep the big bottle at home for deep cleans, and keep all alcohol away from heat and flame.",
      ],
    },
    {
      heading: "3. A soak container and a place to dry",
      body: [
        "For a deep clean you need a small container that fits the removable parts your model allows you to soak, usually the chamber and glass. Keep the electronic base out of it, and wipe its connection with a damp swab instead.",
        "Then give the parts a clean, stable place to air-dry completely. A soak timer is not a drying timer; if you are unsure whether a part is dry, leave it out longer.",
      ],
    },
    {
      heading: "4. Somewhere to keep clean and used swabs apart",
      body: [
        "This is the part most kits skip. Used swabs end up on the table, back in the box, or in a pocket. A case with a separate used side keeps the routine tidy, especially when you take your Puffco out of the house.",
        "Dab Pal is a pocket cleaning kit built for exactly that: it holds 30 regular Q-tips on the clean side, a slider moves used swabs to their own side, and an empty 1 oz bottle carries your iso. Swabs and alcohol are not included. Dab Pal is an independent product and is not made or endorsed by Puffco.",
      ],
    },
    {
      heading: "A simple routine with your kit",
      body: [
        "After each session, swab the chamber while it is warm but not hot, then move the swab to the used side. Every so often, or when flavor drops, let the device cool and deep clean the approved parts with a soak in 90%+ iso.",
        "Puffco's app and support pages give model-specific timing and steps. When a general guide and your device's instructions disagree, follow the device instructions.",
      ],
    },
  ],
  guideLinks: [
    { slug: "how-to-clean-puffco-peak-pro", label: "Clean a Puffco Peak Pro", description: "Chamber, glass and base, step by step." },
    { slug: "how-to-clean-puffco-proxy", label: "Clean a Puffco Proxy", description: "Chamber soak, glass and the Core cup." },
    { slug: "how-to-clean-puffco-pivot", label: "Clean a Puffco Pivot", description: "Chamber, mouthpiece and base." },
    { slug: "91-vs-99-isopropyl-alcohol-puffco", label: "91% or 99% iso?", description: "Match the cleaner to your model's instructions." },
    { slug: "best-swabs-for-dabs", label: "Choose your swabs", description: "Regular Q-tips, pointed tips and specialty swabs." },
  ],
  faq: [
    { q: "What is the best Puffco cleaning kit?", a: "The best kit is the one that matches your model's instructions: tightly wound cotton swabs, 90%+ isopropyl alcohol, a container for the parts you are allowed to soak, and a way to keep used swabs away from clean ones. You do not need a preassembled kit, but a case keeps it together." },
    { q: "Does Puffco sell a cleaning kit?", a: "Puffco sells cleaning accessories such as the Dual Tool, a loading tool with a cotton swab at the other end. Check Puffco's site for its current lineup. Dab Pal is a separate, independent product." },
    { q: "Can I use 70% rubbing alcohol on my Puffco?", a: "Puffco's instructions call for 90% or stronger isopropyl alcohol. Lower concentrations contain more water, so use 90%+ unless your model's instructions say otherwise." },
    { q: "Does Dab Pal fit Puffco Peak, Pro and Proxy routines?", a: "Yes. Dab Pal holds the regular Q-tips and iso you use with Peak, Peak Pro, Proxy, Pivot and other e-rigs. It stores supplies; it does not attach to the device." },
  ],
}
