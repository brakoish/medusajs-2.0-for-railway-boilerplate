export type BlogSection = {
  heading: string
  body: string[]
}

export type BlogFAQ = {
  q: string
  a: string
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
  intro: string[]
  sections: BlogSection[]
  faq: BlogFAQ[]
}

export const blogArticles: BlogArticle[] = [
  {
    slug: "how-to-clean-puffco-peak-pro-proxy",
    title: "How to Clean a Puffco Peak, Peak Pro, or Proxy",
    eyebrow: "Puffco cleaning",
    description:
      "A simple Puffco cleaning routine for Peak, Peak Pro, and Proxy users, including swabs, isopropyl alcohol, chamber care, and travel kit tips.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
    readingMinutes: 5,
    keywords: [
      "puffco cleaning kit",
      "how to clean puffco peak",
      "puffco peak pro cleaning kit",
      "puffco proxy cleaning kit",
      "puffco swab holder",
    ],
    sourceLabel: "Puffco Proxy cleaning guidance",
    sourceUrl:
      "https://puffco.zendesk.com/hc/en-us/articles/45364120003227-How-do-I-clean-my-Puffco-Proxy",
    intro: [
      "A Puffco is easier to keep clean when the tools live in one place. You need cotton swabs, isopropyl alcohol, a little patience, and a way to keep fresh swabs away from used ones.",
      "This routine is for everyday cleanup, not repair work. Always let the device cool before cleaning, keep electronics dry, and follow Puffco's device-specific support guidance when in doubt.",
    ],
    sections: [
      {
        heading: "What to keep nearby",
        body: [
          "Keep regular Q-tips or tightly wound cotton swabs, 90%+ isopropyl alcohol, a small iso bottle, and a clean towel nearby. A pocket case helps because the tools are ready before the chamber cools too much.",
          "Dab Pal keeps 30 Q-tips and a 1oz iso bottle together, with a slider that separates clean and used swabs. That matters when you are cleaning away from your desk or dab station.",
        ],
      },
      {
        heading: "Quick clean after a session",
        body: [
          "Once the bowl is warm, not hot, use a dry swab to lift leftover residue. If a spot needs more help, lightly dip the swab in isopropyl alcohol and clean the surface gently.",
          "Do not flood the chamber. A swab should be damp, not dripping. The goal is controlled cleaning, not soaking the entire device.",
        ],
      },
      {
        heading: "Contacts and connection points",
        body: [
          "Puffco support recommends cleaning gold contact points with a cotton swab dipped in isopropyl alcohol. This helps prevent connection issues caused by residue between the chamber and base.",
          "Never soak the base. Keep USB ports and electronics dry, and let any cleaned parts fully dry before using the device again.",
        ],
      },
      {
        heading: "Deep cleaning",
        body: [
          "For supported removable chambers, Puffco guidance calls for 90%+ isopropyl alcohol and full drying before reuse. Glass pieces can usually be soaked separately, then rinsed and dried completely.",
          "Do not rush the drying step. Isopropyl alcohol is flammable, and trapped liquid around electronics is never worth the risk.",
        ],
      },
      {
        heading: "A better habit",
        body: [
          "The easiest Puffco cleaning routine is the one you actually repeat. Keep swabs and iso together, clean while residue is still easy to remove, and separate used swabs before they touch the clean side of your kit.",
          "That is the whole point of Dab Pal: swabs, iso, and dirty-swab separation in one pocket-sized case.",
        ],
      },
    ],
    faq: [
      {
        q: "What iso should I use for Puffco cleaning?",
        a: "Puffco support guidance commonly references 90%+ isopropyl alcohol for chamber cleaning. Use a damp swab for light cleaning and let parts fully dry.",
      },
      {
        q: "Can I soak the Puffco base?",
        a: "No. Do not soak the base or flood electronics. Clean contact points carefully with a lightly dipped cotton swab.",
      },
      {
        q: "Does Dab Pal fit Puffco cleaning supplies?",
        a: "Yes. Dab Pal holds 30 regular Q-tips and a 1oz iso bottle, which covers the core Puffco cleaning routine.",
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
          "That is the Dab Pal formula: 30 Q-tips, 1oz iso bottle storage, and a built-in slider in a made-to-order case.",
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
    slug: "best-swabs-for-dabs",
    title: "Best Swabs for Dabs: Q-tips, Cotton Swabs, and Heady Swabs",
    eyebrow: "Swab guide",
    description:
      "A plain-English guide to dab swabs, Q-tips, cotton swabs, heady swabs, and how to store clean and dirty swabs.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
    readingMinutes: 4,
    keywords: [
      "best swabs for dabs",
      "dab swab case",
      "heady swabs",
      "q tip holder for dabs",
      "cotton swabs for dabs",
    ],
    intro: [
      "People use a lot of names for the same job: Q-tips, cotton swabs, dab swabs, heady swabs. The point is simple. You need something clean, absorbent, and easy to grab right after a session.",
      "The best swab is the one you actually have nearby when it is time to clean.",
    ],
    sections: [
      {
        heading: "Regular Q-tips work",
        body: [
          "For most people, regular Q-tips are the easiest choice. They are cheap, easy to find, and fit inside small cleaning kits.",
          "Dab Pal is sized around regular Q-tips because that is what most Puffco, e-rig, and banger users already keep around.",
        ],
      },
      {
        heading: "Tightly wound swabs are cleaner",
        body: [
          "A tighter cotton tip is less likely to leave loose fibers behind. That matters around hot quartz, ceramic bowls, and small chamber areas.",
          "If you are buying swabs specifically for dabs, look for a firm tip that does not shed easily.",
        ],
      },
      {
        heading: "Pointed swabs can help",
        body: [
          "Pointed or detail swabs can help with corners, seams, and contact areas. They are useful, but they are not mandatory for a basic cleaning kit.",
          "For daily use, regular swabs plus iso cover most jobs. Detail swabs are a nice extra if your setup has tight spots.",
        ],
      },
      {
        heading: "Storage matters more than the label",
        body: [
          "The real problem is not what you call the swab. It is where the clean ones go and where the dirty ones end up.",
          "A dab swab case should keep fresh swabs clean, keep used swabs contained, and keep iso close enough that cleanup does not become a scavenger hunt.",
        ],
      },
      {
        heading: "The Dab Pal setup",
        body: [
          "Dab Pal holds 30 regular Q-tips and a 1oz iso bottle. The internal slider gives used swabs their own side after cleaning.",
          "That makes it less of a display piece and more of a daily-use tool, which is exactly what a cleaning kit should be.",
        ],
      },
    ],
    faq: [
      {
        q: "Are heady swabs different from Q-tips?",
        a: "Sometimes the term just means swabs used for dab cleanup. Some brands sell specialty swabs, but regular Q-tips work for most daily cleaning.",
      },
      {
        q: "How many swabs does Dab Pal hold?",
        a: "Dab Pal holds 30 regular Q-tips plus a 1oz iso bottle.",
      },
      {
        q: "Why use a dab swab case?",
        a: "It keeps clean swabs ready and used swabs contained, especially when you are cleaning away from home.",
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
]

export const getBlogArticle = (slug: string) =>
  blogArticles.find((article) => article.slug === slug)
