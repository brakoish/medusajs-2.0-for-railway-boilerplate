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

export type BlogImage = {
  src: string
  alt: string
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
  image?: BlogImage
  howTo?: BlogHowTo
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
    slug: "how-to-clean-puffco-pivot",
    title: "How to Clean a Puffco Pivot",
    eyebrow: "Puffco Pivot cleaning",
    description:
      "A Puffco Pivot cleaning routine for the chamber, mouthpiece, base connection, glass adapter, cotton swabs, and 90%+ iso.",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
    readingMinutes: 4,
    keywords: [
      "how to clean puffco pivot",
      "puffco pivot cleaning kit",
      "puffco pivot chamber cleaning",
      "puffco pivot swab holder",
      "90% iso puffco pivot",
    ],
    sourceLabel: "Puffco Pivot cleaning guidance",
    sourceUrl:
      "https://puffco.zendesk.com/hc/en-us/articles/45237725674779-How-do-I-clean-the-Pivot",
    howTo: {
      totalTime: "PT30M",
      supplies: ["90%+ isopropyl alcohol", "Cotton swabs", "Clean towel"],
      tools: ["Dab Pal or another Puffco cleaning kit"],
      steps: [
        "Remove the chamber from the Pivot mouthpiece.",
        "Submerge the chamber in 90%+ iso for 20 to 30 minutes.",
        "Clean the base threading and connection area with an iso-dipped swab.",
        "Soak the mouthpiece or glass adapter separately when needed.",
        "Let all parts fully dry before use.",
      ],
    },
    intro: [
      "The Pivot has small parts, so cleaning works best when you keep chamber, mouthpiece, base, and adapter steps separate.",
      "Puffco's Pivot guidance uses 90%+ isopropyl alcohol for chamber and mouthpiece cleaning, plus cotton swabs for the base threading and connection.",
    ],
    sections: [
      {
        heading: "Remove the chamber",
        body: [
          "Remove the chamber from the mouthpiece before cleaning. Small parts are easier to clean when they are separated.",
          "If residue is heavy, do not force it with sharp tools. Let iso do the work.",
        ],
      },
      {
        heading: "Soak the chamber",
        body: [
          "Puffco says the Pivot chamber can be submerged in 90%+ iso for 20 to 30 minutes.",
          "After soaking, set it upside down and allow time to fully dry before using it again.",
        ],
      },
      {
        heading: "Clean the base connection",
        body: [
          "Use a cotton swab dipped in 90%+ iso to wipe threading and the connection area on the base.",
          "This matters because sticky residue can interfere with the chamber connection and trigger errors.",
        ],
      },
      {
        heading: "Mouthpiece and glass adapter",
        body: [
          "The mouthpiece can be submerged in 90%+ iso for 20 to 30 minutes, then rinsed and fully dried.",
          "For the glass adapter, remove the chamber first, soak the adapter, rinse it, and let it dry completely.",
        ],
      },
      {
        heading: "What to keep in the kit",
        body: [
          "A Pivot cleaning kit should have cotton swabs, 90%+ iso, and a small case that keeps clean and used swabs apart.",
          "Dab Pal works well for this because it keeps the bottle and swabs together without loose cotton floating around.",
        ],
      },
    ],
    faq: [
      {
        q: "What iso does Puffco recommend for the Pivot?",
        a: "Puffco recommends 90%+ isopropyl alcohol for Pivot cleaning.",
      },
      {
        q: "How long should I soak the Pivot chamber?",
        a: "Puffco says to submerge the chamber in 90%+ iso for 20 to 30 minutes, then let it fully dry.",
      },
      {
        q: "Can a dirty Pivot connection cause errors?",
        a: "Yes. Puffco notes that residue between the chamber and base can interfere with the connection.",
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
