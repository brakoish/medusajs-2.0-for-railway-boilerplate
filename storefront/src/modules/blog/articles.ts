import type { AffiliateProductId } from "./affiliate-supplies"
import { careGuides } from "./new-guides-care"
import { accessoryGuides } from "./new-guides-accessories"

export type BlogSection = {
  heading: string
  body: string[]
  photo?: {
    src: string
    alt: string
    width: number
    height: number
    caption: string
    credit?: { label: string; url: string; license: string; licenseUrl: string }
  }
}

export type BlogFAQ = {
  q: string
  a: string
}

export type BlogHowTo = {
  totalTime: string
  supplies: string[]
  tools: string[]
  steps: string[]
}

export type BlogCover = {
  title: string[]
  subtitle: string
  dark?: boolean
}

export type BlogArticle = {
  slug: string
  title: string
  eyebrow: string
  description: string
  publishedAt: string
  updatedAt: string
  readingMinutes: number
  keywords: string[]
  sourceLabel?: string
  sourceUrl?: string
  sources?: { label: string; url: string }[]
  affiliateProducts?: AffiliateProductId[]
  cover: BlogCover
  howTo?: BlogHowTo
  guideLinks?: { slug: string; label: string; description: string }[]
  comparison?: { type: string; use: string; check: string; source?: { label: string; url: string } }[]
  intro: string[]
  sections: BlogSection[]
  faq: BlogFAQ[]
}

export const blogArticles: BlogArticle[] = [
  ...careGuides,
  ...accessoryGuides,
  {
    slug: "dab-terms-glossary",
    title: "Dab Terms: A Plain-English Guide to Gear & Cleaning",
    eyebrow: "Dab dictionary",
    description: "What do banger, chamber, carb cap, iso, and dab swab mean? Learn the gear and cleaning terms, then find the right care guide for your setup.",
    publishedAt: "2026-09-17",
    updatedAt: "2026-09-17",
    readingMinutes: 4,
    keywords: ["dab terms", "dab glossary", "dab swabs", "quartz banger", "dab cleaning kit"],
    sourceLabel: "Puffco’s dab equipment dictionary",
    sourceUrl: "https://www.puffco.com/blogs/cannabis-knowledge-base/dab-technology-how-do-dab-rigs-dab-pens-work",
    cover: { title: ["Know your", "gear."], subtitle: "A dab & cleaning dictionary" },
    intro: [
      "A dab is a small portion of cannabis concentrate; dabbing refers to vaporizing concentrate with purpose-built equipment. This glossary explains the equipment and cleaning vocabulary you will see in care guides. It is not a dosing guide.",
      "Names matter when you clean: the glass attachment, heated chamber, and electronic base can need different treatment. Identify the part first, then use the instructions for your exact model.",
    ],
    guideLinks: [
      { slug: "how-to-clean-puffco-peak-pro-proxy", label: "Choose your Puffco model", description: "Find model-specific care references." },
      { slug: "best-swabs-for-dabs", label: "Compare swab types", description: "Regular Q-tips, pointed tips, and specialty swabs." },
      { slug: "how-to-clean-a-quartz-banger", label: "Quartz banger care", description: "A separate routine for a separate part." },
    ],
    sections: [
      { heading: "Dab rig and e-rig", body: [
        "A dab rig is equipment designed for concentrates. An e-rig uses an electronic heater. These names describe the setup; they do not tell you whether a particular part can be soaked.",
        "For cleaning, separate manufacturer-approved removable parts from the powered base. Never treat an electronic base as a container you can fill or immerse.",
      ] },
      { heading: "Banger and nail", body: [
        "A nail is a heated surface used with a rig. A banger is a cup-shaped version, commonly made from quartz. Material and construction still matter for care.",
        "A quartz banger guide is not automatically appropriate for a ceramic chamber or electronic atomizer. Check the material and manufacturer before choosing a cleaning method.",
      ] },
      { heading: "Chamber and atomizer", body: [
        "On an e-rig, the chamber is the part where material is heated. Atomizer is another term for the heating assembly; product makers can use the words differently.",
        "Use your device’s exact model and generation when looking up a care guide or replacement part. Similar-looking parts are not proof of compatibility.",
      ] },
      { heading: "Carb cap and loading tool", body: [
        "A carb cap covers the heated cup and helps direct airflow. A loading tool, also called a dabber, transfers material into it. They have different jobs.",
        "Keep caps, tools, and cleaning supplies in their own places. Dab Pal is a swab-and-bottle organizer, not a universal case for glass or loading tools.",
      ] },
      { heading: "Dab swab, Q-tip, and specialty swab", body: [
        "A dab swab is a cotton swab used during clean-up. Q-tips is a brand name often used conversationally for regular cotton swabs. Specialty swabs can have pointed tips, larger heads, or different shafts.",
        "Choose the tip for the surface you need to reach, and check dimensions for storage. Dab Pal holds 30 regular Q-tips. We have not verified every specialty-swab shape; swabs are purchased separately.",
      ] },
      { heading: "Iso", body: [
        "Iso is shorthand for isopropyl alcohol. Its percentage describes the concentration. Follow the concentration and method specified for your exact device and part.",
        "Keep alcohol away from flames and heat. Allow cleaned components to dry fully before use. Dab Pal’s included 1 oz bottle ships empty.",
      ] },
      { heading: "Clean side, used side, and the slider", body: [
        "These describe the storage routine inside Dab Pal. Fresh swabs start together on one side. The movable slider makes space for used swabs separately, toward the hinge.",
        "Dispose of used swabs regularly instead of mixing them back into your supply. Restock, check the bottle’s cap, and make sure the slider and lid move freely. The organizer does not replace your device’s care routine.",
      ] },
    ],
    faq: [
      { q: "Does a dab cleaning kit include a dab rig?", a: "Check the contents. Dab Pal includes the organizer case, slider and empty 1 oz bottle. It does not include a device, swabs or alcohol." },
      { q: "Are dab swabs different from regular Q-tips?", a: "The term describes their use, not one universal shape. Compare the actual tip and shaft dimensions. Regular Q-tips and larger specialty swabs may fit differently." },
      { q: "Can I use one cleaning guide for every device?", a: "No. Match the instructions to the exact model and part. Powered bases, removable chambers and glass can have different cleaning rules." },
    ],
  },
  {
    publishedAt: "2026-07-08",
    updatedAt: "2026-09-16",
    readingMinutes: 3,
    slug: "how-to-clean-puffco-peak-pro-proxy",
    title: "How to Clean a Puffco: Choose Your Model",
    eyebrow: "Puffco cleaning",
    description:
      "Find the cleaning guide for your Puffco Peak, Peak Pro, Proxy, Pivot, or Plus. Start with your model before choosing chamber and glass cleaning steps.",
    keywords: [
      "puffco cleaning kit",
      "how to clean puffco peak",
      "puffco peak pro cleaning kit",
      "puffco proxy cleaning kit",
    ],
    cover: {
      title: ["Find your", "model."],
      subtitle: "Peak / Peak Pro / Proxy / Pivot / Plus",
    },
    intro: [
      "Start with the model you own. Peak, Peak Pro, Proxy, Pivot, and Plus do not share one universal deep-cleaning routine. Use the links below to find your guide, then check Puffco’s instructions for your exact generation and chamber.",
    ],
    guideLinks: [
      {
        slug: "how-to-clean-puffco-peak",
        label: "Peak",
        description: "Check whether you own the original or newer Peak.",
      },
      {
        slug: "how-to-clean-puffco-peak-pro",
        label: "Peak Pro",
        description: "Chamber, glass, and contact cleaning.",
      },
      {
        slug: "how-to-clean-puffco-proxy",
        label: "Proxy",
        description: "Check the instructions for your Proxy generation.",
      },
      {
        slug: "how-to-clean-puffco-pivot",
        label: "Pivot",
        description: "Chamber, mouthpiece, and base care.",
      },
      {
        slug: "how-to-clean-puffco-plus",
        label: "Plus",
        description: "For the pen-style Plus.",
      },
      { slug: "how-to-clean-puffco-hot-knife", label: "Hot Knife accessory", description: "Clean the ceramic tip without soaking the powered tool." },
      { slug: "how-long-puffco-dry-after-cleaning", label: "Drying after cleaning", description: "Know what to check before reassembly." },
    ],
    sections: [
      {
        heading: "Identify your device first",
        body: [
          "Check the model name on your device, packaging, or purchase receipt. A similarly shaped chamber is not enough to establish that two products have the same cleaning instructions.",
          "The linked guides are starting points, with manufacturer care references. If the instructions for your exact hardware differ, follow the manufacturer.",
        ],
      },
      {
        heading: "Build the kit around the routine",
        body: [
          "Keep your fresh swabs, cleaning supplies, and used swabs organized before you begin. A storage case helps you carry those supplies; it does not replace your device’s care instructions.",
          "Dab Pal includes a case, clean/dirty slider, and empty 1oz bottle. It holds 30 regular Q-tips; swabs and isopropyl alcohol are not included. Specialty swab fit varies.",
        ],
      },
      {
        heading: "Quick cleanup and deep cleaning are different",
        body: [
          "Use the model guide to distinguish quick bowl cleanup from a full disassembly. Check which parts can be soaked, which need only a careful wipe, and how they must dry before reassembly.",
          "Do not use one model’s soak time as a rule for every Puffco device.",
        ],
      },
    ],
    faq: [
      {
        q: "Which guide should I use for a Peak Pro?",
        a: "Choose the Peak Pro guide above, then match the manufacturer’s instructions to your chamber and device generation.",
      },
      {
        q: "Is Dab Pal a Puffco device or replacement part?",
        a: "No. Dab Pal is an independent cleaning-supply organizer. It does not attach to or replace parts of your device.",
      },
    ],
  },
  {
    slug: "what-to-keep-in-a-dab-cleaning-kit",
    title: "What Should Be in a Dab Cleaning Kit?",
    eyebrow: "Cleaning kit checklist",
    description:
      "Build a dab cleaning kit with the supplies you actually need: cotton swabs, the right cleaner, separate used-swab storage, and equipment for deeper cleaning.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-09-24",
    readingMinutes: 4,
    keywords: [
      "dab cleaning kit",
      "portable dab cleaning kit",
      "q tip and iso holder",
      "dab kit organizer",
      "isopropyl swab kit",
    ],
    cover: {
      title: ["Keep it", "together."],
      subtitle: "Your cleaning kit checklist",
    },
    sources: [
      { label: "Puffco Proxy care and component guidance", url: "https://www.puffco.com/pages/proxy-support" },
      { label: "Q-tips materials and storage guidance", url: "https://www.qtips.com/pages/faq" },
    ],
    affiliateProducts: ["qtips"],
    intro: [
      "Start with cotton swabs, the cleaner specified for your device, and somewhere to put used swabs. For deeper cleaning, add a suitable soaking container and a stable place to let the removable parts dry. You may already own most of the kit.",
      "Keep the everyday supplies within reach and the soaking equipment at your cleaning station. A pocket case does not need to carry everything required for a full disassembly.",
    ],
    comparison: [
      { type: "Routine cleanup", use: "Fresh cotton swabs and any cleaner required by your device's care guide.", check: "Keep unused swabs covered and give used swabs a separate place." },
      { type: "Deep cleaning", use: "Manufacturer-approved cleaner, a compatible container, and a clear drying area.", check: "Identify each removable part before deciding what may be soaked or rinsed." },
      { type: "Optional storage", use: "A small case, divider, or existing organizer that suits your supplies.", check: "Check swab fit and bottle closure. Storage does not replace the cleaner's handling instructions." },
    ],
    sections: [
      {
        heading: "Cotton swabs: start with the ones your routine calls for",
        body: [
          "Regular cotton swabs are a sensible starting point when your device maker specifies them. Buy specialty tips only if their shape solves an access problem. A pointed tip and a larger cotton head do different jobs; neither is automatically an upgrade for every chamber.",
          "Keep fresh swabs covered. Q-tips recommends a cool, dry storage location away from dampness. Set aside used swabs for disposal, then empty that space before restocking so sticky ends do not mix with the fresh supply.",
        ],
      },
      {
        heading: "Cleaner: match the device and the part",
        body: [
          "Check the bottle label against the care instructions for your exact model. For example, Puffco specifies 90% or stronger isopropyl alcohol for Proxy cleaning. That is a model-specific instruction, not a reason to prescribe one concentration for every device, finish, or accessory.",
          "The part matters just as much as the cleaner. A Proxy chamber can be removed for soaking, while the electronic base cannot. The New Proxy Core cup also must not be soaked. Keep those distinctions in your routine before you fill a container.",
        ],
      },
      {
        heading: "For deep cleaning, make room to work",
        body: [
          "Use a container compatible with the specified cleaner and large enough for the parts approved for soaking. Keep the electronic base outside it. Leave a clear, stable area for drying so you can account for small parts before putting everything back together.",
          "A brush is optional. Add one only if the component maker permits it and it fits the opening without force. You do not need to buy a brush set, scraper, or second cleaner just to call your supplies a complete kit.",
          "Follow the separate rinse and drying directions for each component. A glass rinse instruction does not automatically apply to a chamber. The end of a soak timer does not mean the device is ready to reassemble.",
        ],
      },
      {
        heading: "A portable kit needs less",
        photo: {
          src: "/dab-pal/model-2026-09/dab-pal-slate-desktop.webp", width: 1536, height: 1024,
          alt: "Closed Slate Dab Pal on a wooden desk beside cotton swabs and a folded cloth",
          caption: "Slate shown in a styled scene. Cloth and swabs are not included with Dab Pal.",
        },
        body: [
          "Pack the supplies for the cleanup you expect to do: fresh swabs, a closed cleaner bottle if needed, and a separate space for used swabs. Keep larger soaking supplies at the cleaning station. Follow the cleaner label's storage and handling directions wherever you keep the kit.",
          "A covered swab container and a separate used-swab container can do this job. Choose an organizer if keeping everything in one place makes the routine easier for you.",
        ],
      },
      {
        heading: "What Dab Pal includes",
        photo: {
          src: "/dab-pal/model-2026-09/dab-pal-slate-open.webp", width: 1254, height: 1254,
          alt: "Open Slate Dab Pal case with cotton swabs beside the capped bottle",
          caption: "Dab Pal shown with swabs loaded. Swabs and alcohol are not included; the included 1 oz bottle ships empty.",
        },
        body: [
          "Dab Pal includes the case, clean/dirty slider, and an empty 1oz bottle. It holds 30 regular Q-tips. Swabs and isopropyl alcohol are purchased separately; specialty-swab fit has not been tested.",
          "Move used swabs behind the slider toward the hinge until you can discard them. Dab Pal is made to order with a 3–5 business day production time before shipping, so keep using your existing supplies while your case is being made.",
        ],
      },
    ],
    guideLinks: [
      { slug: "best-swabs-for-dabs", label: "Regular Q-tips or specialty swabs?", description: "Compare materials, tip shapes, and storage fit." },
      { slug: "how-to-clean-puffco-proxy", label: "Build a Proxy cleaning routine", description: "Separate chamber, glass, base, and Core cup care." },
      { slug: "how-to-clean-puffco-peak-pro-proxy", label: "Find your Puffco model", description: "Choose the care guide that matches your device." },
      { slug: "91-vs-99-isopropyl-alcohol-puffco", label: "91% or 99% ISO?", description: "Match the cleaner to your model's instructions." },
      { slug: "cleaning-brush-for-narrow-glass", label: "Choose a brush that fits", description: "Check the opening, reach, and permitted cleaning method." },
    ],
    faq: [
      { q: "Do I need a preassembled dab cleaning kit?", a: "No. Start with the swabs and cleaner your device requires, plus separate places for fresh and used swabs. Add equipment for deep cleaning only as your care instructions require it." },
      { q: "Should every dab cleaning kit contain 99% alcohol?", a: "Choose the concentration specified for your device and component. For example, Puffco's Proxy guidance calls for 90%+ isopropyl alcohol. Check the actual product label before buying." },
      { q: "Does Dab Pal include swabs or alcohol?", a: "No. It includes the case, clean/dirty slider, and an empty 1oz bottle. Add your own regular Q-tips and the cleaner specified by your device maker." },
    ],
  },
  {
    slug: "how-to-clean-a-quartz-banger",
    title: "How to Clean a Quartz Banger After Every Dab",
    eyebrow: "Quartz banger care",
    description:
      "A simple quartz banger cleaning routine using cotton swabs, isopropyl alcohol, and better swab storage between dabs.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
    readingMinutes: 4,
    keywords: [
      "how to clean a quartz banger",
      "banger cleaning kit",
      "banger swab holder",
      "iso q tips for banger",
      "portable banger cleaner",
    ],
    cover: {
      title: ["A clearer", "routine."],
      subtitle: "Quartz banger cleaning",
    },
    howTo: {
      totalTime: "PT5M",
      supplies: ["Cotton swabs", "Isopropyl alcohol"],
      tools: ["Dab Pal or another swab case"],
      steps: [
        "Let the quartz banger cool until it is warm, not scorching hot.",
        "Use a dry cotton swab to lift leftover residue.",
        "Use a lightly dipped iso swab on spots that need more help.",
        "Move used swabs to the dirty side of your kit.",
      ],
    },
    intro: [
      "Quartz bangers stay nicer when you clean them before residue has a chance to bake on. The routine is small, but timing matters.",
      "You do not need a huge setup. You need swabs, isopropyl alcohol, and a place to put the used swabs when you are done.",
    ],
    sections: [
      {
        heading: "Let it cool enough to swab",
        body: [
          "Do not jam cotton into a surface that is still ripping hot. Let the banger cool enough that the swab can pick up residue without burning or sticking.",
          "The sweet spot is warm enough that residue moves, cool enough that the swab stays intact.",
        ],
      },
      {
        heading: "Start dry",
        body: [
          "Use a dry Q-tip first. A dry swab can pick up a surprising amount of leftover oil before you add anything else.",
          "If the banger still has residue, follow with a lightly dipped iso swab. Do not overdo the alcohol. Controlled contact is the goal.",
        ],
      },
      {
        heading: "Do not reuse dirty swabs",
        body: [
          "Once a swab is dirty, it should stay dirty. Reusing it drags old residue back across the quartz and makes the next clean worse.",
          "That is why a clean/dirty swab divider is useful. It turns cleanup into a repeatable habit instead of a pile of loose cotton.",
        ],
      },
      {
        heading: "Deep cleaning is not daily cleaning",
        body: [
          "Deep soaks have their place, but they are not a replacement for cleaning after each use. If the banger gets wiped regularly, deep cleaning becomes less frequent and less annoying.",
          "A pocket cleaning kit is about prevention. Keep the tools close and the quartz stays easier to manage.",
        ],
      },
      {
        heading: "What to keep in your banger kit",
        body: [
          "A practical banger cleaning kit should include Q-tips, a small iso bottle, clean/dirty swab storage, and a case that does not spill loose swabs into your bag.",
          "Dab Pal holds the basics in one case, so the next clean is ready before the banger cools too far.",
        ],
      },
    ],
    guideLinks: [
      { slug: "how-to-clean-terp-pearls", label: "Clean terp pearls by material", description: "Keep quartz, ruby, and sapphire care separate." },
      { slug: "how-to-clean-a-glass-carb-cap", label: "Clean the glass carb cap", description: "Clear residue from the underside and airflow openings." },
      { slug: "how-to-clean-a-silicone-dab-mat", label: "Wash the dab mat", description: "Start with soap and water, then dry both sides." },
    ],
    faq: [
      {
        q: "Can I clean a quartz banger with Q-tips?",
        a: "Yes. Q-tips or cotton swabs are the everyday tool for wiping residue while the banger is warm, not scorching hot.",
      },
      {
        q: "Should I use iso every time?",
        a: "Not always. Start with a dry swab, then use a lightly dipped iso swab when residue needs extra help.",
      },
      {
        q: "What is a banger swab holder?",
        a: "It is a case or organizer for keeping clean swabs ready and used swabs contained after cleaning.",
      },
    ],
  },
  {
    publishedAt: "2026-07-08",
    updatedAt: "2026-09-24",
    readingMinutes: 4,
    slug: "best-swabs-for-dabs",
    title: "Dab Q-tips & Swabs: Regular vs Specialty Tips",
    eyebrow: "Swab selection",
    description:
      "Compare Q-tips, Glob Mops XL 2.0, and Puffco Dual Tool by tip shape, materials, pack size, and storage fit. Find the swab that suits your cleaning routine.",
    keywords: [
      "best swabs for dabs",
      "dab q tips",
      "q tips for dabs",
      "Glob Mops vs Q-tips",
      "cotton swabs for dabbing",
      "dab swab case",
    ],
    cover: {
      title: ["Choose", "your swab."],
      subtitle: "Regular Q-tips / specialty tips",
      dark: true,
    },
    sources: [
      { label: "Q-tips: cotton and paper-stick materials", url: "https://www.qtips.com/pages/faq" },
      { label: "Glob Mops XL 2.0: maker specifications and tip photos", url: "https://globmops.com/products/xl-2-0" },
      { label: "Puffco Dual Tool: materials and Single Pack option", url: "https://www.puffco.com/products/the-puffco-dual-tool" },
    ],
    affiliateProducts: ["qtips", "globMops"],
    intro: [
      "If regular cotton swabs reach the surfaces your device maker tells you to clean, you may not need specialty dab swabs. Consider a different tip when you have a specific problem to solve, such as reaching an edge with a rounded head.",
      "Regular Q-tips use cotton ends and a paper stick. Glob Mops XL 2.0 use a bamboo stick with pointed and rounded cotton ends. Those are useful design differences; they do not establish which cleans better. This comparison uses manufacturer specifications and product photos, not hands-on absorbency, lint, or durability testing.",
    ],
    comparison: [
      {
        type: "Q-tips Original · 750 count × 3 packs",
        use: "100% cotton tips on a paper stick. A familiar choice when your care guide calls for ordinary cotton swabs. The linked pack is a bulk refill; a smaller local pack is enough to start.",
        check: "Dab Pal holds 30 regular Q-tips. Check your device's cleaning directions before use.",
      },
      {
        type: "Glob Mops XL 2.0 · 300-count tub",
        use: "Bamboo stick with pointed and rounded cotton ends. Consider the tip shapes if a regular swab does not reach the area you need to wipe.",
        check: "Specialty-swab fit in Dab Pal is untested. We have not compared cleaning performance with Q-tips.",
      },
      {
        type: "Puffco Dual Tool · Single Pack",
        use: "A hardwood loading end and a cotton swab in one tool. Consider it if you want a loading tool as well as a swab, rather than two cotton ends.",
        check: "Puffco does not state the swab count for its Single Pack in the product description. Check the pack details before ordering. Dab Pal fit is untested.",
        source: { label: "See Dual Tool at Puffco (not an affiliate link)", url: "https://www.puffco.com/products/the-puffco-dual-tool" },
      },
    ],
    guideLinks: [
      { slug: "what-to-keep-in-a-dab-cleaning-kit", label: "Build a cleaning kit", description: "Separate everyday supplies from deep-cleaning equipment." },
      { slug: "how-to-clean-puffco-proxy", label: "Cleaning a Puffco Proxy", description: "Choose the routine for your Proxy configuration." },
    ],
    sections: [
      {
        heading: "Regular Q-tips: start with the familiar option",
        body: [
          "Q-tips identifies its tips as 100% cotton and its applicator as bonded paper and paperboard. That distinction matters when comparing them with bamboo-shaft swabs: regular Q-tips do not have wooden sticks.",
          "If the swabs already in your kit do the job your care guide describes, keep using that format. A specialty label alone is not a reason to replace them. Check a fresh swab for loose cotton or damage and use the pressure and cleaning method recommended for the component.",
        ],
      },
      {
        heading: "Glob Mops XL 2.0: compare the tip shapes",
        body: [
          "Glob Mops lists bamboo sticks for XL 2.0, and its product photos show one pointed end and one rounded end. The pointed end is a shape to consider for an edge that a rounded tip cannot reach; check access without forcing it into an opening.",
        ],
      },
      {
        heading: "Puffco Dual Tool: a loading end instead of a second swab",
        body: [
          "Puffco describes Dual Tool as a hardwood loading tool with a cotton swab at the other end. It is a different format from the two cotton tips on regular Q-tips and Glob Mops. If you already have a loading tool you like, you may not need that extra function.",
          "The Single Pack listing did not state a swab count and was sold out when checked on September 24, 2026. Check Puffco's page for current pack details and availability. We have not tested its cleaning performance or fit in Dab Pal.",
        ],
      },
      {
        heading: "What to check before buying a pack",
        photo: {
          src: "/dab-pal/guides/cotton-swabs.jpg", width: 6720, height: 4480,
          alt: "White cotton swabs with wooden stems on a pale marble surface",
          caption: "Plain cotton swabs shown for illustration. These wooden-stem swabs are not the paper-stick Q-tips or the other products linked below.",
          credit: {
            label: "Kaboompics / Pexels", url: "https://www.pexels.com/photo/pile-of-cotton-ear-buds-on-marble-table-4202384/",
            license: "Pexels license", licenseUrl: "https://www.pexels.com/license/",
          },
        },
        body: [
          "Look at the tip you will actually use, the overall length, and the pack quantity. Compare cost per swab using the current pack price divided by the number of swabs. That gives you a starting cost, although a real cost-per-clean comparison would also need to count how many you use.",
          "Try a small quantity of an unfamiliar shape before buying several tubs. Keep the swabs you already like as the alternative. A cleaning swab also does not replace the loading tool your device uses to handle concentrate.",
        ],
      },
      {
        heading: "Will specialty dab swabs fit in Dab Pal?",
        body: [
          "Dab Pal holds 30 regular Q-tips beside its included empty 1oz bottle. We have not tested Glob Mops XL 2.0 or other specialty swabs for lid closure, slider movement, or capacity. Larger tips and longer sticks may fit differently.",
          "Check a few swabs before filling the case, and keep both the lid and slider moving freely. The case's outside dimensions do not tell you the usable space inside the swab compartment.",
        ],
      },
      {
        heading: "Keep a place for the used swabs",
        body: [
          "Whichever swab you choose, keep the unused supply separate from sticky ends awaiting disposal. In Dab Pal, the used side is behind the slider toward the hinge. Empty it before restocking.",
          "The case comes with the clean/dirty slider and an empty 1oz bottle. Swabs and isopropyl alcohol are not included. Dab Pal is made to order with a 3–5 business day production time before shipping.",
        ],
      },
    ],
    faq: [
      { q: "Can I use regular Q-tips for dab cleanup?", a: "Regular Q-tips are an option when your device's care instructions call for cotton swabs and the tips reach the intended surface. Follow that component's directions for temperature, cleaner, and pressure." },
      { q: "Are Glob Mops better than regular Q-tips?", a: "We have not run a comparative cleaning test. XL 2.0 has a bamboo stick and pointed/rounded ends; regular Q-tips use a paper stick. The useful difference is whether the tip reaches what you need to clean." },
      { q: "Do Glob Mops XL 2.0 fit in Dab Pal?", a: "Their fit has not been tested. Dab Pal's stated capacity is 30 regular Q-tips; do not assume that capacity or fit carries over to specialty swabs." },
      { q: "Are Q-tips included with Dab Pal?", a: "No. Dab Pal includes the case, slider, and an empty 1oz bottle. Add your own swabs and cleaner." },
    ],
  },
  {
    slug: "clean-vs-dirty-dab-swabs",
    title: "Clean vs Dirty Dab Swabs: Why Separation Matters",
    eyebrow: "Swab storage",
    description:
      "Why clean and dirty dab swabs should stay separate, especially in a travel kit, dab bag, Puffco setup, or banger cleaning kit.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
    readingMinutes: 3,
    keywords: [
      "dirty q tip holder",
      "clean dirty swab holder",
      "dab swab storage",
      "used q tip holder",
      "dab q tip holder",
    ],
    cover: {
      title: ["Fresh here.", "Used there."],
      subtitle: "Keeping swabs separate",
    },
    intro: [
      "The overlooked part of dab cleanup is what happens after the swab is used. A dirty swab is sticky, smelly, and very good at finding the clean side of your bag.",
      "Keeping clean and dirty swabs separate is a small design detail that makes a daily cleaning kit much less annoying.",
    ],
    sections: [
      {
        heading: "Clean swabs need to stay clean",
        body: [
          "Fresh swabs are only useful if they stay fresh. Once residue gets into the storage area, the next swab is already compromised before it touches the bowl or banger.",
          "Loose swabs in a pocket, drawer, or bag pick up lint and dust too. A closed case fixes that.",
        ],
      },
      {
        heading: "Used swabs need a place to go",
        body: [
          "If there is no used side, people improvise. They drop swabs into a cup, shove them in a bag, leave them on a tray, or mix them back into the kit by mistake.",
          "A dirty swab holder does not need to be complicated. It just needs to be separate.",
        ],
      },
      {
        heading: "Why a slider works",
        body: [
          "The Dab Pal slider lets the clean side shrink as the used side grows. You start with fresh swabs, then move used ones to the other side as you clean.",
          "It is a simple mechanical answer to a messy problem. No bags, no loose cotton, no guessing which side is clean.",
        ],
      },
      {
        heading: "Better for travel",
        body: [
          "Clean and dirty separation matters even more when you are not at home. In a dab bag, backpack, or glove box, everything gets moved around.",
          "A closed case with a divider keeps the cleaning kit usable for the whole trip, not just the first session.",
        ],
      },
    ],
    faq: [
      {
        q: "What is a clean dirty swab holder?",
        a: "It is a case that keeps unused swabs separate from swabs that already touched residue.",
      },
      {
        q: "Can I put used swabs back in Dab Pal?",
        a: "Yes. The internal slider is built so used swabs can stay away from the clean side.",
      },
      {
        q: "Is this useful at home too?",
        a: "Yes. Even on a desk or dab station, separation keeps cleanup neater and faster.",
      },
    ],
  },
  {
    slug: "how-to-keep-dab-gear-clean-while-traveling",
    title: "How to Keep Dab Gear Clean When You Travel",
    eyebrow: "Travel cleaning kit",
    description:
      "A small travel setup for Puffco, e-rig, and quartz banger users who want Q-tips, iso, and swabs in one place.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
    readingMinutes: 4,
    keywords: [
      "travel dab cleaning kit",
      "portable dab cleaning kit",
      "dab bag accessories",
      "q tips travel case",
      "iso bottle case",
    ],
    cover: {
      title: ["Pack", "the kit."],
      subtitle: "A compact cleaning setup",
    },
    intro: [
      "Travel is where cleanup gets messy. At home, everything has a spot. In a car, hotel room, backpack, or dab bag, the little stuff starts moving around.",
      "That is why the kit should stay small. Not clever. Not overbuilt. Just swabs, iso, and a place for used cotton.",
    ],
    sections: [
      {
        heading: "Start with the two things you reach for most",
        body: [
          "Pack regular Q-tips and a small iso bottle. That covers most quick cleanup for a Puffco bowl, e-rig chamber, or quartz banger.",
          "Thirty swabs is enough for a short trip without turning your bag into a supply drawer. A 1oz bottle keeps iso close without taking over the case.",
        ],
      },
      {
        heading: "Do not let iso roam loose",
        body: [
          "A tiny bottle is only useful if it stays closed. Fill it carefully, wipe the outside, and make sure the cap is tight before it goes back in your bag.",
          "Dab Pal ships empty, so you can fill the bottle with the isopropyl alcohol you already like using.",
        ],
      },
      {
        heading: "Plan for dirty swabs",
        body: [
          "Clean swabs are easy to pack. Dirty swabs are the problem. They stick to wrappers, trays, pockets, and anything else nearby.",
          "That is why the divider matters. Use a swab, slide it to the dirty side, and keep going. The clean side stays clean.",
        ],
      },
      {
        heading: "Make cleanup a ten second habit",
        body: [
          "Open the case. Grab a swab. Add iso if the spot needs it. Clean the bowl or banger. Move the used swab over. Close the case.",
          "That rhythm is the whole point. If the kit is annoying, you will skip it. If it is right there, you will use it.",
        ],
      },
      {
        heading: "What to pack",
        body: [
          "For travel, keep it boring: Q-tips, a small iso bottle, clean/dirty swab storage, and a case that can handle being tossed in a bag.",
          "Dab Pal was made for that exact job.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I travel with iso in the bottle?",
        a: "Dab Pal ships empty. If you fill it, follow local rules and travel restrictions, and make sure the cap is tight.",
      },
      {
        q: "Is Dab Pal pocket-sized?",
        a: "Yes. It is built as a compact case for a dab bag, backpack, pocket, or glove box.",
      },
      {
        q: "What dab accessories are useful for travel?",
        a: "Swabs, a small iso bottle, and a case that separates clean and dirty swabs.",
      },
    ],
  },
  {
    slug: "how-to-clean-puffco-peak-pro",
    title: "How to Clean a Puffco Peak Pro",
    eyebrow: "Puffco Peak Pro cleaning",
    description:
      "A practical Puffco Peak Pro cleaning routine for the chamber, base, glass, cotton swabs, and 90%+ iso.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
    readingMinutes: 4,
    keywords: [
      "how to clean puffco peak pro",
      "puffco peak pro cleaning kit",
      "puffco peak pro chamber cleaning",
      "puffco peak pro swab holder",
      "90% iso puffco peak pro",
    ],
    cover: {
      title: ["Peak Pro."],
      subtitle: "A guide for your model",
    },
    sourceLabel: "Puffco Peak Pro cleaning guidance",
    sourceUrl:
      "https://puffco.zendesk.com/hc/en-us/articles/360057955453-How-do-I-clean-my-Peak-Pro",
    howTo: {
      totalTime: "PT30M",
      supplies: ["90%+ isopropyl alcohol", "Cotton swabs", "Clean towel"],
      tools: ["Dab Pal or another Puffco cleaning kit"],
      steps: [
        "Let the Peak Pro cool before removing the chamber and glass.",
        "Swab the chamber with a cotton swab dampened with 90%+ iso.",
        "For deeper cleaning, submerge the chamber in 90%+ iso for 20 minutes.",
        "Clean the gold threads and airpath with a controlled iso swab.",
        "Let all parts fully dry before reassembly.",
      ],
    },
    intro: [
      "The Peak Pro is easiest to keep clean when you treat cleanup as part of the session, not a project for later.",
      "Puffco's Peak Pro guidance points to cotton swabs, 90%+ isopropyl alcohol, dry electronics, and fully dried parts before reassembly.",
    ],
    sections: [
      {
        heading: "Let it cool first",
        body: [
          "Do not pull apart a hot Peak Pro. Let the chamber cool enough to handle, then remove the cap and unscrew the chamber from the base.",
          "A warm chamber is easier to clean than a cold, crusted one, but hot parts are not worth rushing.",
        ],
      },
      {
        heading: "Swab the chamber",
        body: [
          "For light cleaning, use a cotton swab with 90%+ iso to gently lift residue from the chamber. Keep the swab damp, not dripping.",
          "For deeper cleaning, Puffco says the chamber can be submerged in 90%+ iso for 20 minutes, then fully dried before use.",
        ],
      },
      {
        heading: "Clean the base carefully",
        body: [
          "Remove the glass and chamber before cleaning the base. Use cotton swabs with 90%+ iso on the gold threads and airpath.",
          "Do not let water or alcohol pool in the base. The base has electronics, so controlled swabs beat flooding every time.",
        ],
      },
      {
        heading: "Soak glass separately",
        body: [
          "The glass can be removed and soaked separately. After soaking, rinse it clean and let it dry completely before it goes back on the base.",
          "Keep water away from the bottom chamber area and any electronics. Dry parts are the rule.",
        ],
      },
      {
        heading: "Keep the kit close",
        body: [
          "A Peak Pro cleaning kit should have cotton swabs, 90%+ iso, a small bottle, and a clean place for used swabs.",
          "Dab Pal keeps those tools together, so the quick clean happens before residue gets stubborn.",
        ],
      },
    ],
    faq: [
      {
        q: "What iso does Puffco recommend for the Peak Pro?",
        a: "Puffco recommends 90%+ isopropyl alcohol for Peak Pro and chamber cleaning.",
      },
      {
        q: "Can I soak the Peak Pro base?",
        a: "No. Do not soak or flood the base. Use a cotton swab with 90%+ iso around threads and contact areas.",
      },
      {
        q: "Does Dab Pal work as a Peak Pro cleaning kit?",
        a: "Yes. Dab Pal holds regular Q-tips and a 1oz bottle for 90%+ iso, with a separate dirty side for used swabs.",
      },
    ],
  },
  {
    slug: "how-to-clean-puffco-peak",
    title: "How to Clean a Puffco Peak",
    eyebrow: "Puffco Peak cleaning",
    description:
      "A simple Puffco Peak cleaning routine for the atomizer, glass, base contacts, cotton swabs, and iso.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
    readingMinutes: 4,
    keywords: [
      "how to clean puffco peak",
      "puffco peak cleaning kit",
      "puffco peak atomizer cleaning",
      "puffco peak swab holder",
      "99% iso puffco peak",
    ],
    cover: {
      title: ["Peak."],
      subtitle: "Start with the right generation",
    },
    sourceLabel: "Puffco Peak cleaning guidance",
    sourceUrl:
      "https://puffco.zendesk.com/hc/en-us/articles/360055108754-How-do-I-clean-my-Peak",
    howTo: {
      totalTime: "PT30M",
      supplies: ["99% isopropyl alcohol", "Cotton swabs", "Clean towel"],
      tools: ["Dab Pal or another Puffco cleaning kit"],
      steps: [
        "Let the Peak cool before removing the glass and atomizer.",
        "Soak the glass and carb cap in isopropyl alcohol, then rinse and dry the glass.",
        "Soak the atomizer in isopropyl alcohol, but do not rinse it with water.",
        "Clean the base connector pin and atomizer bottom with an iso-dipped swab.",
        "Let the atomizer fully dry before reassembly.",
      ],
    },
    intro: [
      "The original Peak needs the same basic discipline as any e-rig: cool it down, clean residue early, keep the base dry, and let parts fully dry before use.",
      "Puffco's Peak guidance says 99% isopropyl alcohol is preferred for the atomizer and glass, with no water rinse on the atomizer.",
    ],
    sections: [
      {
        heading: "Cool before disassembly",
        body: [
          "Let the bowl cool before removing the atomizer from the base. Remove the glass attachment carefully, then unscrew the atomizer.",
          "If the bowl does not come out easily, do not force it. Forcing stuck parts is a good way to turn cleaning into a repair.",
        ],
      },
      {
        heading: "Clean the glass and carb cap",
        body: [
          "Puffco says the glass and carb cap can be soaked in isopropyl alcohol, with 99% preferred. Rinse glass after soaking, then let it dry completely.",
          "Keep the base away from water and alcohol pools while the removable pieces are being cleaned.",
        ],
      },
      {
        heading: "Clean the atomizer",
        body: [
          "The atomizer can be submerged in isopropyl alcohol, with 99% preferred in Puffco's Peak guidance.",
          "Do not rinse the atomizer with water. Puffco warns that water exposure to the ceramic can potentially damage the part.",
        ],
      },
      {
        heading: "Swab the connector points",
        body: [
          "Use an iso-dipped cotton swab to clean the gold connector pin on the base and the bottom of the atomizer.",
          "Connection points are small, so keep the swab controlled. Damp is enough.",
        ],
      },
      {
        heading: "Make daily cleanup easier",
        body: [
          "The Peak is easier to maintain when Q-tips and iso live next to the device. Clean the bowl after use, then do deeper cleaning before buildup gets heavy.",
          "Dab Pal keeps clean swabs, a 1oz iso bottle, and used swab storage in one case.",
        ],
      },
    ],
    faq: [
      {
        q: "What iso does Puffco prefer for the Peak?",
        a: "Puffco's Peak guidance says 99% isopropyl alcohol is preferred, especially because lower percentages contain more water.",
      },
      {
        q: "Can I rinse the Peak atomizer with water?",
        a: "No. Puffco warns not to rinse the atomizer with water because water exposure to ceramic can potentially damage it.",
      },
      {
        q: "How often should I clean my Peak?",
        a: "Puffco suggests a thorough clean about every 20 uses, with light swabbing between sessions as needed.",
      },
    ],
  },
  {
    slug: "how-to-clean-puffco-proxy",
    title: "How to Clean a Puffco Proxy",
    eyebrow: "Puffco Proxy cleaning",
    description:
      "Clean your Puffco Proxy by configuration: chamber, glass, base, and New Proxy Core parts. Know what can soak and why the Core cup needs spot cleaning only.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-09-24",
    readingMinutes: 4,
    keywords: [
      "how to clean puffco proxy",
      "puffco proxy cleaning kit",
      "puffco proxy chamber cleaning",
      "Puffco Proxy Core cleaning",
      "90% iso puffco proxy",
    ],
    cover: {
      title: ["Proxy."],
      subtitle: "Pipe / Core / part-by-part care",
    },
    sourceLabel: "Puffco New Proxy and Core support",
    sourceUrl: "https://www.puffco.com/pages/proxy-support",
    sources: [
      { label: "Puffco New Proxy and Core care guidance", url: "https://www.puffco.com/pages/proxy-support" },
      { label: "Puffco Core manual: cleaning, pages 07–08", url: "https://cdn.shopify.com/s/files/1/0319/5549/files/Puffco_Proxy_Core_Digital-IM_MultiLanguage.pdf?v=1773764503" },
      { label: "Puffco OG Proxy care guidance", url: "https://www.puffco.com/pages/proxy-pipe-support-page" },
    ],
    affiliateProducts: ["qtips"],
    intro: [
      "Identify your Proxy setup before cleaning. The removable chamber, electronic base, glass pipe, and Core cup have different care instructions. In particular, the New Proxy Core cup must never be soaked: remove it and spot-clean with iso.",
      "Below, choose the section for your attachment. These steps follow Puffco's support pages and Core manual; check the linked guide for your exact hardware if you have changed chambers or accessories.",
    ],
    sections: [
      {
        heading: "First, identify your configuration",
        body: [
          "OG Proxy uses the original base. New Proxy is app-enabled and can use the Core attachment or compatible glass. Core's cup is anodized aluminum with a silicone foot, not a glass piece; Core is not compatible with the OG base.",
          "Set out cotton swabs and 90%+ isopropyl alcohol. Before disassembly or alcohol cleaning, let the parts cool completely. Keep the base out of any soaking container.",
        ],
      },
      {
        heading: "After use: a gentle swab",
        body: [
          "Puffco calls for gently wiping the chamber with a cotton swab while the contents are still warm. Use a circular motion without pressing hard. This quick wipe is separate from disassembling cooled parts for an alcohol clean.",
        ],
      },
      {
        heading: "OG or New Proxy with a glass pipe",
        body: [
          "Remove the cooled chamber. For light cleaning, wipe residue with a swab dipped in 90%+ iso. Puffco's general Proxy guidance gives a 20–30 minute chamber soak for a deeper clean, followed by complete air-drying. Do not rinse the chamber with water.",
          "Remove the glass from the base and soak the glass separately in iso. Rinse the glass thoroughly with water, then let it dry fully. Puffco advises against abrasive materials or other cleaning solutions for its glass. For third-party attachments, use the attachment maker's instructions.",
        ],
      },
      {
        heading: "New Proxy Core: separate the cup, chamber, and mouthpiece",
        body: [
          "Remove the cooled chamber from the base, then remove the Core mouthpiece and optional terp pearl. The Core manual specifies a 20-minute iso soak for the chamber and mouthpiece, no water rinse, and complete air-drying before reassembly. Puffco's Core support also permits soaking the removed terp pearl in 90%+ iso.",
          "Keep the Core cup out of the soak. Remove the base from the cup and spot-clean the cup with a cotton swab dipped in 90%+ iso. Let it air-dry before refitting. A removable part is not automatically a soakable part.",
        ],
      },
      {
        heading: "Base and reassembly",
        body: [
          "With the chamber and attachment removed, gently swab the base contacts and airpath with iso. Do not flood, rinse, or soak the base, and keep its USB port dry.",
          "Give cleaned parts time to air-dry completely before reassembly or use. The soak time excludes drying. Refit the chamber without force and check that the attachment is seated correctly.",
        ],
      },
      {
        heading: "Keep the everyday supplies together",
        photo: {
          src: "/dab-pal/model-2026-09/dab-pal-marble-open.webp", width: 1254, height: 1254,
          alt: "Open Marble Dab Pal case with cotton swabs and its capped bottle",
          caption: "Marble color preview. An optional case for everyday supplies, not a case for the Proxy itself. Swabs and alcohol are not included; the bottle ships empty.",
        },
        body: [
          "You do not need a special organizer to follow these steps. Keep fresh cotton swabs covered and a separate place for used ones. Leave your soaking container and drying area at the cleaning station.",
          "For compact storage, Dab Pal includes a case, clean/dirty slider, and empty 1oz bottle, with room for 30 regular Q-tips. Swabs and iso are not included, and specialty-swab fit is untested. Production takes 3–5 business days before shipping.",
        ],
      },
    ],
    guideLinks: [
      { slug: "what-to-keep-in-a-dab-cleaning-kit", label: "Check your cleaning supplies", description: "Everyday essentials and optional deep-cleaning equipment." },
      { slug: "best-swabs-for-dabs", label: "Compare cotton swabs", description: "Regular Q-tips, specialty shapes, and case fit." },
      { slug: "how-to-clean-puffco-peak-pro-proxy", label: "Cleaning a different Puffco?", description: "Choose your device's guide." },
    ],
    faq: [
      { q: "Can I soak the whole Puffco Proxy?", a: "No. The electronic base must stay out of liquid. If you use Core, its cup is also spot-clean only. Identify the removable component before using any soak instructions." },
      { q: "Can I soak the New Proxy Core cup?", a: "No. Puffco directs you to spot-clean the removed cup with iso and let it air-dry. The removable chamber, mouthpiece, and terp pearl have separate cleaning instructions." },
      { q: "Does a 20-minute soak mean I can use it after 20 minutes?", a: "No. All cleaned parts must finish air-drying before reassembly and use. A soak timer does not account for drying." },
    ],
  },
  {
    publishedAt: "2026-07-08",
    updatedAt: "2026-09-16",
    readingMinutes: 3,
    slug: "how-to-clean-puffco-pivot",
    title: "How to Clean a Puffco Pivot: Chamber, Mouthpiece & Base",
    eyebrow: "Pivot cleaning",
    description:
      "Puffco Pivot cleaning steps for the chamber, mouthpiece, and base, with official soak guidance and full drying before reassembly.",
    keywords: [
      "how to clean puffco pivot",
      "puffco pivot cleaning",
      "puffco cleaning kit",
      "dab swab case",
    ],
    sourceLabel: "Puffco Pivot support — care instructions",
    sourceUrl: "https://www.puffco.com/pages/pivot-support",
    cover: {
      title: ["Clean your", "Pivot."],
      subtitle: "Chamber / mouthpiece / base",
    },
    intro: [
      "Remove the Pivot chamber for a 20–30 minute soak in 90%+ iso. Wipe the base connection with an iso-dipped swab; keep the base out of the soak. Let parts dry completely before reassembly. Detailed steps below follow Puffco’s Pivot support guidance.",
    ],
    sections: [
      {
        heading: "After a session",
        body: [
          "Puffco recommends a cotton swab for the bowl while it is still warm, and for the mouthpiece after use.",
        ],
      },
      {
        heading: "Chamber: remove, soak, dry",
        body: [
          "Detach the chamber from the mouthpiece. Soak it in 90% or stronger isopropyl alcohol for 20–30 minutes. Place it upside down and let it dry completely before reattaching.",
        ],
      },
      {
        heading: "Base: wipe the connection",
        body: [
          "Use an iso-dipped cotton swab on the threading and connection points. Keep the electronic base out of the soak.",
        ],
      },
      {
        heading: "Mouthpiece and optional glass adapter",
        body: [
          "Soak the mouthpiece in 90% or stronger iso for 20–30 minutes, rinse with water, then invert and dry. For the glass adapter, first remove the chamber, then soak, rinse, and dry the adapter separately.",
        ],
      },
      {
        heading: "Make time for cleaning",
        body: [
          "Puffco recommends a deep clean whenever the battery is depleted. Follow its current care instructions if they change.",
          "Set the parts somewhere they can dry undisturbed. Plan your next session around complete drying rather than the end of a timer.",
        ],
      },
      {
        heading: "Keep the supplies together",
        body: [
          "Dab Pal is a separate organizer, not a required Pivot accessory. It includes an empty 1oz bottle, swab storage, and a clean/dirty slider. Bring your own regular Q-tips and iso.",
        ],
      },
    ],
    guideLinks: [
      {
        slug: "how-to-clean-puffco-peak-pro-proxy",
        label: "Cleaning a different Puffco?",
        description: "Return to the model chooser.",
      },
      {
        slug: "best-swabs-for-dabs",
        label: "Choose swabs for your kit",
        description: "Compare regular and specialty swab fit.",
      },
    ],
    faq: [
      {
        q: "Does the soak time include drying?",
        a: "No. Drying is a separate step. Do not reassemble or use the device while cleaned parts are wet.",
      },
      {
        q: "Do I need a Dab Pal to clean a Pivot?",
        a: "No. It is an optional organizer. Use the care supplies specified by Puffco.",
      },
    ],
  },
  {
    slug: "how-to-clean-puffco-plus",
    title: "How to Clean a Puffco Plus",
    eyebrow: "Puffco Plus cleaning",
    description:
      "A simple Puffco Plus cleaning routine for the chamber, Dart, mouthpiece, threading, cotton swabs, and iso.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
    readingMinutes: 4,
    keywords: [
      "how to clean puffco plus",
      "puffco plus cleaning kit",
      "puffco plus chamber cleaning",
      "puffco plus dart cleaning",
      "puffco plus swab holder",
    ],
    cover: {
      title: ["Plus."],
      subtitle: "A guide for your model",
    },
    sourceLabel: "Puffco Plus cleaning guidance",
    sourceUrl:
      "https://puffco.zendesk.com/hc/en-us/articles/360056926433-How-do-I-clean-my-Puffco-Plus",
    howTo: {
      totalTime: "PT10M",
      supplies: ["ISO", "Tightly wound cotton swabs"],
      tools: ["Dab Pal or another swab case"],
      steps: [
        "Warm the Plus chamber by running one Sesh Mode cycle.",
        "Unscrew the mouthpiece and swab the chamber and Dart.",
        "Clean threading with a cotton swab dipped in ISO.",
        "Wipe gunmetal parts with an ISO-dipped swab, but do not soak them.",
        "Let cleaned parts dry before use.",
      ],
    },
    intro: [
      "The Puffco Plus is smaller than a Peak or Proxy, but it still benefits from cleaning right after use.",
      "Puffco's Plus guidance focuses on cotton swabs, ISO, threading, the Dart, and one important caution: do not soak gunmetal parts in rubbing alcohol.",
    ],
    sections: [
      {
        heading: "Warm the chamber first",
        body: [
          "For general cleaning, Puffco says to warm the chamber by entering Sesh Mode for one cycle.",
          "Then unscrew the mouthpiece and use a tightly wound cotton swab to remove leftover byproduct from the chamber and Dart.",
        ],
      },
      {
        heading: "Swab, do not scrape",
        body: [
          "Use a tightly wound swab so fibers do not shed into the chamber. Work gently around the Dart and chamber.",
          "It is normal for the bottom of the chamber to darken over time, according to Puffco. That does not automatically mean the chamber is ruined.",
        ],
      },
      {
        heading: "Clean threading",
        body: [
          "Wipe threading with a cotton swab dipped in ISO. Sticky threading makes the pen feel worse and can create connection issues.",
          "Keep the swab controlled and avoid flooding small parts.",
        ],
      },
      {
        heading: "Do not soak gunmetal parts",
        body: [
          "Puffco says the mouthpiece, battery, and threading can be wiped with an ISO-dipped swab.",
          "Do not soak any gunmetal parts of the Plus in rubbing alcohol.",
        ],
      },
      {
        heading: "A Plus-friendly kit",
        body: [
          "For the Plus, a cleaning kit is mostly about having swabs ready and giving used swabs somewhere to go.",
          "Dab Pal keeps regular Q-tips and a 1oz iso bottle together, then stores used swabs behind the slider until you can toss them.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I soak my Puffco Plus?",
        a: "Do not soak gunmetal parts of the Plus in rubbing alcohol. Puffco recommends wiping the mouthpiece, battery, and threading with an ISO-dipped swab.",
      },
      {
        q: "What kind of swab should I use for the Plus?",
        a: "Puffco recommends a tightly wound cotton swab for removing byproduct from the chamber and Dart.",
      },
      {
        q: "Is chamber darkening normal on the Plus?",
        a: "Yes. Puffco says it is normal for the bottom of the Plus chamber to darken over time and that it should not affect performance by itself.",
      },
    ],
  },
]

export const getBlogArticle = (slug: string) =>
  blogArticles.find((article) => article.slug === slug)
