export type BlogSection = {
  heading: string
  body: string[]
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
  cover: BlogCover
  howTo?: BlogHowTo
  guideLinks?: { slug: string; label: string; description: string }[]
  comparison?: { type: string; use: string; check: string }[]
  intro: string[]
  sections: BlogSection[]
  faq: BlogFAQ[]
}

export const blogArticles: BlogArticle[] = [
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
      "A practical dab cleaning kit checklist covering Q-tips, iso, swab storage, banger care, e-rig cleanup, and travel organization.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
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
    intro: [
      "A good dab cleaning kit is not complicated. It just needs to make the clean thing easy to do every time.",
      "The basics are cotton swabs, isopropyl alcohol, a small bottle, and a way to keep clean swabs separate from the ones you already used.",
    ],
    sections: [
      {
        heading: "The essentials",
        body: [
          "Start with regular Q-tips or cotton swabs. They are the workhorse for Puffco bowls, e-rig chambers, and quartz bangers. Keep enough on hand that you are not trying to stretch one swab too far.",
          "Add a small bottle of isopropyl alcohol. A 1oz bottle is enough for regular cleanup and small enough to fit in a pocket case or dab bag.",
        ],
      },
      {
        heading: "Clean and dirty storage",
        body: [
          "Most kits forget the dirty side. Used swabs are sticky, messy, and not something you want floating around next to clean ones.",
          "A divider or slider keeps the kit usable after the first clean. Dab Pal was built around that exact problem, clean swabs on one side, used swabs on the other.",
        ],
      },
      {
        heading: "For quartz bangers",
        body: [
          "For a quartz banger, swabs and iso are the daily tools. Clean after each session while residue is still manageable. Let the surface cool enough that you are not scorching cotton into the banger.",
          "A cleaning kit will not save a banger that gets abused for weeks, but it makes the right habit easier.",
        ],
      },
      {
        heading: "For Puffco and e-rigs",
        body: [
          "For Puffco and e-rig users, keep swabs nearby for the bowl and contact areas. Use isopropyl alcohol carefully, and do not flood the base or ports.",
          "A compact kit is better than a drawer full of supplies because it is there when you need it.",
        ],
      },
      {
        heading: "The simple checklist",
        body: [
          "Your dab cleaning kit should have Q-tips, a small iso bottle, clean/dirty swab separation, a pocketable case, and a shape that fits into a dab bag or glove box.",
          "That is the Dab Pal formula: storage for 30 Q-tips, an empty 1oz bottle, and a built-in slider in a made-to-order case. Swabs and iso are not included.",
        ],
      },
    ],
    faq: [
      {
        q: "What is the most important item in a dab cleaning kit?",
        a: "Swabs. Q-tips or cotton swabs do most of the daily cleaning work for Puffco bowls, e-rigs, and quartz bangers.",
      },
      {
        q: "Should my kit include iso?",
        a: "Yes, but store it safely. Dab Pal ships with an empty 1oz bottle so you can fill it with your preferred isopropyl alcohol.",
      },
      {
        q: "Why separate clean and dirty swabs?",
        a: "It keeps residue off the clean side of your kit and makes cleanup less gross when you are away from home.",
      },
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
    updatedAt: "2026-09-16",
    readingMinutes: 3,
    slug: "best-swabs-for-dabs",
    title: "Dab Q-tips & Swabs: Regular vs Specialty Tips",
    eyebrow: "Swab selection",
    description:
      "Compare regular Q-tips, pointed cotton swabs, and specialty dab swabs by tip shape, access, and case fit. A practical selection guide, without brand rankings.",
    keywords: [
      "best swabs for dabs",
      "dab q tips",
      "q tips for dabs",
      "cotton swabs for dabbing",
      "dab swab case",
      "heady swabs",
    ],
    cover: {
      title: ["Choose", "your swab."],
      subtitle: "Q-tips / cotton / specialty swabs",
      dark: true,
    },
    intro: [
      "Dab swabs are cotton swabs used to wipe residue during clean-up. Regular Q-tips are one option; pointed and larger specialty tips serve different shapes. Compare tip shape, shaft length, price per swab, and storage fit.",
      "This is a selection guide, not a hands-on brand test. We have not ranked brands for absorbency, lint, or durability. Dab Pal is sized for regular Q-tips; we do not claim universal specialty-swab compatibility.",
    ],
    comparison: [
      {
        type: "Regular Q-tips",
        use: "A starting point for a kit built around regular cotton swabs.",
        check:
          "Dab Pal holds 30 regular Q-tips. Swabs are purchased separately.",
      },
      {
        type: "Pointed cotton swabs",
        use: "An option when a rounded tip cannot reach an area described in your care guide.",
        check:
          "Check the tip, shaft length, and care instructions. Do not force the tip into an opening.",
      },
      {
        type: "Specialty / heady swabs",
        use: "Compare the specific product rather than relying on the “dab swab” label.",
        check:
          "Tip sizes and shafts vary. Check measurements and case fit before buying a large pack.",
      },
    ],
    guideLinks: [
      {
        slug: "what-to-keep-in-a-dab-cleaning-kit",
        label: "Build a cleaning kit",
        description: "Organize the supplies you already use.",
      },
      {
        slug: "how-to-clean-puffco-peak-pro-proxy",
        label: "Find your Puffco guide",
        description: "Choose the routine for your device.",
      },
    ],
    sections: [
      {
        heading: "What to compare before buying",
        body: [
          "Look at the actual tip shape, shaft length, pack quantity, and cost per swab. Those are more useful shopping details than an unsupported “best for dabs” badge.",
          "Check a new swab for loose cotton or damage before use. Follow the device maker’s cleaning method, and avoid scraping or forcing a swab into small openings.",
        ],
      },
      {
        heading: "Check fit before filling your case",
        body: [
          "Dab Pal is designed to hold 30 regular Q-tips beside an empty 1oz bottle. Larger tips or longer shafts may change capacity or prevent the lid from closing. We have not verified every specialty swab.",
          "The closed case measures 80 × 80 × 25 mm. These are exterior dimensions, not the available space inside the swab compartment. Keep the lid and slider moving freely.",
        ],
      },
      {
        heading: "Keep fresh and used swabs separate",
        body: [
          "Load fresh swabs on the clean side. Move used swabs behind the divider toward the hinge until you can discard them. Empty the used side before restocking.",
          "The kit includes the case, slider, and empty bottle. Q-tips and iso are not included.",
        ],
      },
    ],
    faq: [
      {
        q: "Are Q-tips included with Dab Pal?",
        a: "No. Add your own Q-tips and iso.",
      },
      {
        q: "Do all heady swabs fit?",
        a: "We have not verified universal fit. Dab Pal holds 30 regular Q-tips; specialty swab dimensions and capacity vary.",
      },
      {
        q: "Which swab brand is best?",
        a: "We do not have comparative hands-on results to name a winner. Compare fit, tip shape, quantity, and your device’s care requirements.",
      },
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
      "How to clean a Puffco Proxy chamber, base, glass, and contact points with cotton swabs and 90%+ iso.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
    readingMinutes: 4,
    keywords: [
      "how to clean puffco proxy",
      "puffco proxy cleaning kit",
      "puffco proxy chamber cleaning",
      "puffco proxy swab holder",
      "90% iso puffco proxy",
    ],
    cover: {
      title: ["Proxy."],
      subtitle: "A guide for your model",
    },
    sourceLabel: "Puffco Proxy cleaning guidance",
    sourceUrl:
      "https://puffco.zendesk.com/hc/en-us/articles/6771963837211-How-do-I-clean-my-Puffco-Proxy",
    howTo: {
      totalTime: "PT30M",
      supplies: ["90%+ isopropyl alcohol", "Cotton swabs", "Clean towel"],
      tools: ["Dab Pal or another Puffco cleaning kit"],
      steps: [
        "Let the Proxy cool before removing the glass and chamber.",
        "Swab the chamber and gold contact points with 90%+ iso.",
        "For deeper cleaning, submerge the chamber in 90%+ iso for 20 to 30 minutes.",
        "Clean the base contact points and airpath with an iso-dipped swab.",
        "Let the chamber and glass fully dry before reassembly.",
      ],
    },
    intro: [
      "The Proxy is modular, which makes cleaning straightforward as long as you separate chamber, base, and glass care.",
      "Puffco's Proxy guidance calls for 90%+ isopropyl alcohol for chamber cleaning, careful swabbing around contact points, and a fully dry chamber before use.",
    ],
    sections: [
      {
        heading: "Start cool",
        body: [
          "Let the Proxy cool before taking it apart. Do not handle the base, chamber, or glass while they are still hot.",
          "Once it is cool, remove the glass and chamber so each part can be cleaned the right way.",
        ],
      },
      {
        heading: "Light clean the chamber",
        body: [
          "For light cleaning, use a cotton swab dipped in 90%+ iso to remove residue from the chamber.",
          "Gently swab the gold contact points too. Keeping those points clean helps avoid connection issues.",
        ],
      },
      {
        heading: "Deep clean the chamber",
        body: [
          "For deeper cleaning, Puffco says the Proxy chamber can be submerged in 90%+ iso for 20 to 30 minutes.",
          "Let the chamber fully dry before use. Iso is flammable, and wet parts do not belong near electronics.",
        ],
      },
      {
        heading: "Base and glass",
        body: [
          "Clean the base contact points and airpath with an iso-dipped swab. Do not flood or soak the base, and keep the USB port dry.",
          "The glass can be soaked separately in iso, rinsed, and dried completely before reattaching.",
        ],
      },
      {
        heading: "Proxy travel cleaning",
        body: [
          "Proxy users often travel with the device, so loose swabs get annoying fast. Keep clean swabs separate from used swabs.",
          "Dab Pal keeps 30 Q-tips and a 1oz bottle together, with the dirty side behind the slider toward the hinge.",
        ],
      },
    ],
    faq: [
      {
        q: "What iso does Puffco recommend for Proxy cleaning?",
        a: "Puffco recommends 90%+ isopropyl alcohol for Proxy chamber cleaning.",
      },
      {
        q: "Can I soak the Proxy base?",
        a: "No. Do not soak or flood the base. Use a cotton swab around contact points and keep the USB port dry.",
      },
      {
        q: "Can I soak the Proxy chamber?",
        a: "Yes, Puffco's guidance says the chamber can be submerged in 90%+ iso for 20 to 30 minutes, then fully dried.",
      },
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
