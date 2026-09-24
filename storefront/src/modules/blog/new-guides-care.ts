import type { BlogArticle } from "./articles"

export const careGuides: BlogArticle[] = [
  {
    slug: "how-to-clean-puffco-hot-knife",
    title: "How to Clean a Puffco Hot Knife",
    eyebrow: "Tool care",
    description: "Clean the Hot Knife's ceramic tip with a cotton swab, keep liquid away from its electronics, and know when a damaged tip needs support instead.",
    publishedAt: "2026-09-24",
    updatedAt: "2026-09-24",
    readingMinutes: 3,
    keywords: ["how to clean Puffco Hot Knife", "Hot Knife cleaning", "cotton swabs", "dab cleaning kit"],
    cover: { title: ["Clean the", "tip."], subtitle: "Puffco Hot Knife care", dark: true },
    sources: [
      { label: "Puffco: Hot Knife cleaning instructions, updated January 2026", url: "https://puffco.zendesk.com/hc/en-us/articles/45897875194907-How-do-I-clean-my-Hot-Knife" },
    ],
    affiliateProducts: ["qtips", "microfiber"],
    intro: [
      "Let your Hot Knife cool completely, then gently wipe its ceramic tip with a cotton swab dipped in isopropyl alcohol. Keep the liquid away from the body, electrical components and charging port. The body gets a dry microfiber cloth if it needs a wipe.",
      "That is Puffco's current cleaning method. A Hot Knife contains electronics, so the soak you use for a removable glass piece is not the approach here. You usually need only a few swabs, your cleaner and a dry cloth.",
    ],
    sections: [
      { heading: "1. Let the tool cool before cleaning", body: [
        "Set the tool down securely and wait until it has cooled completely. Puffco's January 2026 instructions start with cooling; do not follow a conflicting suggestion to heat the tip and immediately apply alcohol.",
        "While you wait, check the tip. Cleaning is for residue on an intact ceramic surface. If the tip is cracked, chipped or loose, stop and contact Puffco support. Pressing harder with a swab will not repair it.",
      ] },
      { heading: "2. Wipe the ceramic tip gently", body: [
        "Dip a fresh cotton swab in isopropyl alcohol and wipe the ceramic tip with light pressure. Put the cleaner on the swab rather than pouring it onto the tool. Turn to a clean part of the cotton or take another swab when the first one picks up residue.",
        "Keep your movements on the tip. Do not scrape it with another tool or force the swab against it. If residue will not lift with gentle cleaning, ask support before trying a stronger cleaner or more pressure.",
      ] },
      { heading: "3. Keep the body and port dry", body: [
        "Use a dry microfiber cloth for marks on the body. Keep the alcohol-damp swab away from electrical parts and the USB charging port. Do not dip the complete Hot Knife into a jar or rinse it under a tap.",
        "Leave the cleaned tip to dry before putting the tool away or using it again. A quick cleaning pass is not a reason to skip drying.",
      ] },
      { heading: "What supplies are actually worth buying?", body: [
        "Ordinary cotton swabs are enough if they let you wipe the intended surface gently. A pointed specialty swab is not automatically an upgrade. Use the swabs and clean cloth you already own before buying a dedicated set.",
        "The optional Q-tips link below is a bulk pack, and the microfiber listing is a 24-cloth pack. Both are more than this job requires. A smaller local pack or one clean cloth may be a better purchase if you are only restocking for this tool.",
      ] },
    ],
    guideLinks: [
      { slug: "best-swabs-for-dabs", label: "Compare ordinary and specialty swabs", description: "Check tip shapes, materials, and pack sizes." },
      { slug: "what-to-keep-in-a-dab-cleaning-kit", label: "Check your cleaning supplies", description: "See which supplies you already have and which are optional." },
    ],
    faq: [
      { q: "Should I warm the Hot Knife before cleaning it?", a: "Puffco's current instructions say to wait until it has cooled completely before using an alcohol-damp swab on the ceramic tip." },
      { q: "Can I soak a Puffco Hot Knife in alcohol?", a: "Use Puffco's tip-wiping method. Keep cleaner away from electrical components and the charging port; do not immerse the complete tool." },
      { q: "Which alcohol percentage does Puffco specify for the Hot Knife?", a: "The current Hot Knife cleaning article specifies isopropyl alcohol without a numeric concentration. Do not assume another device's soak instructions apply to this tool." },
    ],
  },
  {
    slug: "91-vs-99-isopropyl-alcohol-puffco",
    title: "91% vs 99% Isopropyl Alcohol for Puffco Cleaning",
    eyebrow: "Choosing cleaner",
    description: "See when 91% and 99% ISO meet Puffco's published cleaning instructions, what to check on the bottle, and why the part still determines the method.",
    publishedAt: "2026-09-24",
    updatedAt: "2026-09-24",
    readingMinutes: 4,
    keywords: ["91 vs 99 isopropyl alcohol Puffco", "Puffco cleaning alcohol", "dab cleaning kit", "isopropyl alcohol"],
    cover: { title: ["Read the", "percentage."], subtitle: "91% vs 99% isopropyl alcohol" },
    sources: [
      { label: "Puffco: current Peak cleaning and recommended solution", url: "https://www.puffco.com/pages/new-peak-support" },
      { label: "Puffco: current Proxy care by component", url: "https://www.puffco.com/pages/proxy-support" },
      { label: "Puffco: original Peak cleaning instructions", url: "https://puffco.zendesk.com/hc/en-us/articles/360055108754-How-do-I-clean-my-Peak" },
    ],
    affiliateProducts: ["iso99"],
    intro: [
      "For Puffco instructions that call for 90% or higher isopropyl alcohol, both 91% and 99% meet the stated concentration. Puffco's current Peak support also names 99% as its preferred cleaning solution. If you already have a plain 91% bottle, check your exact model's directions before assuming you need to replace it.",
      "The percentage is only one decision. It does not tell you whether to soak a part, wipe it or keep liquid away entirely. It also does not turn a chamber into something you can rinse like glass.",
    ],
    comparison: [
      { type: "91% isopropyl alcohol", use: "Meets a 90%+ requirement in the cited current Peak and Proxy instructions.", check: "Confirm the label and the directions for your exact component. This is not a claim that every device accepts 91%." },
      { type: "99% isopropyl alcohol", use: "Also meets 90%+ instructions. Puffco identifies 99% as preferred for the Peak.", check: "A higher concentration does not authorize a longer soak, cleaning a hot part or skipping air drying." },
      { type: "70% isopropyl alcohol", use: "Below the 90%+ requirement in those Peak and Proxy instructions.", check: "Do not substitute it for the cited routine just because the label says rubbing alcohol." },
    ],
    sections: [
      { heading: "Start with the model, then the bottle", body: [
        "Find the care page for the model and generation you own. For the current Peak, Puffco gives 90%+ instructions and separately recommends 99%. Current Proxy instructions also call for 90%+. The original Peak's support article prefers 99%. These are model references, not one rule for everything with a Puffco logo.",
        "If an accessory has its own instructions, use those. For example, the current Hot Knife care page calls for an ISO-damp swab but does not give a numeric concentration or prescribe a soak.",
      ] },
      { heading: "Check the name and ingredients as well as the number", body: [
        "The label should identify isopropyl alcohol and its percentage. A high alcohol percentage on a different product is not enough: hand sanitizer, scented rubbing formulations and other solvents are not the same cleaner described in these instructions.",
        "Check the actual bottle and pack you are ordering. Listings can group different strengths or sizes on one page. Keep the labeled container so you can refer back to its directions rather than relying on an unmarked refill bottle.",
      ] },
      { heading: "Keep the cleaning method tied to the part", body: [
        "A detached glass attachment, removable chamber and powered base do different jobs and get different treatment. Where your model permits a chamber soak, that does not include the base. Where it permits rinsing glass with water, that does not imply a water rinse for the chamber.",
        "Use the model guide for disassembly, soak instructions and reassembly. Let the components air-dry completely. Do not warm alcohol or run a heating cycle to rush away leftover cleaner; alcohol is flammable.",
      ] },
      { heading: "Do you need to buy 99%?", body: [
        "If the plain 91% bottle you already own meets your exact care instructions, a switch to 99% is not automatically necessary. If you are buying fresh supplies for a Peak, 99% follows the preference stated on Puffco's support page.",
        "We have not tested cleaning speed or measured how much either concentration uses per clean. Compare the concentration your device requires, the bottle's ingredients, and the quantity you need. The optional Amazon link below is a 16 fl oz 99% product; check the selected listing before ordering.",
      ] },
    ],
    guideLinks: [
      { slug: "how-to-clean-puffco-peak-pro-proxy", label: "Find your Puffco cleaning guide", description: "Choose the model before choosing the cleaning method." },
      { slug: "how-long-puffco-dry-after-cleaning", label: "Separate soaking from drying", description: "Why the soak timer does not tell you when a part is ready to reassemble." },
      { slug: "how-to-clean-puffco-hot-knife", label: "Clean a Hot Knife", description: "Use the ceramic-tip wiping method for this powered tool." },
    ],
    faq: [
      { q: "Can I use 91% ISO instead of 99%?", a: "It meets a 90%+ concentration requirement, including the cited current Peak and Proxy instructions. Confirm the exact model and component; Puffco separately prefers 99% for the Peak." },
      { q: "Does 99% mean I can use the part sooner?", a: "No fixed ready-to-use time follows from the bottle percentage. Follow the component's directions and let it air-dry completely before reassembly or use." },
      { q: "Is alcohol included with Dab Pal?", a: "No. Dab Pal includes its case, slider and an empty 1 oz bottle. Swabs and cleaner are separate supplies." },
    ],
  },
  {
    slug: "how-long-puffco-dry-after-cleaning",
    title: "How Long Should a Puffco Dry After Cleaning?",
    eyebrow: "After the wash",
    description: "Puffco calls for complete air drying, not a universal countdown. Separate the glass, chamber and base rules before you put cleaned parts back together.",
    publishedAt: "2026-09-24",
    updatedAt: "2026-09-24",
    readingMinutes: 3,
    keywords: ["how long Puffco dry after cleaning", "Puffco chamber drying", "Puffco cleaning", "isopropyl alcohol"],
    cover: { title: ["Let it", "dry."], subtitle: "Before you reassemble", dark: true },
    sources: [
      { label: "Puffco: current Proxy manual, cleaning section", url: "https://puffco.zendesk.com/hc/en-us/article_attachments/45365020389275" },
      { label: "Puffco: current Peak care instructions", url: "https://www.puffco.com/pages/new-peak-support" },
    ],
    intro: [
      "Wait until the cleaned parts have air-dried completely. The Puffco instructions linked here do not give one drying time that applies to every glass piece, chamber and room. A 20-minute soak is a cleaning instruction, not a promise that the part is ready to use 20 minutes later.",
      "Keep drying separate from the soak timer. If you are unsure whether a part is dry, leave it out longer. A dry-looking exterior cannot prove that liquid has left every internal recess.",
    ],
    sections: [
      { heading: "Glass and chambers do not finish the same way", body: [
        "For the current Peak, Puffco tells owners to rinse the detached glass after its ISO cleaning and dry it before reattaching. The chamber gets its own instructions, including no water rinse. The current Proxy manual makes the same important distinction: the chamber air-dries after ISO; it does not go under the faucet.",
        "Use the directions for your exact model before removing parts. Keep the powered base away from the glass-rinsing area so a splash cannot reach the contacts or charging port.",
      ] },
      { heading: "Set the parts down where they can stay undisturbed", body: [
        "Choose a clean, stable surface away from the sink edge and give each detached part its own space. Do not balance a tall glass attachment on a narrow mouthpiece or stack glass pieces together. Keep clean parts away from used swabs and cleaning residue.",
        "Air drying does not require a special accessory. A surface you already have may be enough. A rack or mat can help organize the space, but it cannot tell you that an enclosed chamber is dry or shorten the manufacturer's requirement.",
      ] },
      { heading: "Check before putting it back together", body: [
        "Look over the accessible surfaces and recesses. If you can see moisture, the part is not ready. Keep the base's contacts and charging port dry, and do not assemble the device while you still have reason to think cleaner remains inside a component.",
        "No visible droplets and no obvious smell are not a guarantee of complete drying. Do not test readiness by taking a draw or running a heat cycle. If a chamber remains questionable or liquid reached the base, pause and ask the maker for the next step instead of experimenting.",
      ] },
      { heading: "Do not turn drying into a heating step", body: [
        "Puffco calls for air drying. Do not use a microwave, flame, hair dryer or an empty heating cycle as a substitute. Isopropyl alcohol is flammable, and a cleaning shortcut is not worth exposing the device to a method its instructions do not approve.",
        "Plan a clean for a time when the parts can sit undisturbed afterward. That is more useful than choosing an arbitrary online countdown and trying to make the device fit it.",
      ] },
    ],
    guideLinks: [
      { slug: "how-to-clean-puffco-peak-pro-proxy", label: "Check your model's complete routine", description: "Use the correct disassembly, washing and reassembly instructions." },
      { slug: "91-vs-99-isopropyl-alcohol-puffco", label: "Check the alcohol concentration", description: "See what the percentage does—and does not—tell you." },
    ],
    faq: [
      { q: "Is 30 minutes enough for a Puffco chamber to dry?", a: "The cited instructions do not establish 30 minutes as a universal drying time. They require complete air drying. Wait longer if dryness is uncertain." },
      { q: "Can I rinse the chamber to remove the alcohol?", a: "Not under the current Peak and Proxy instructions cited here: their chambers must not be rinsed with water. Their separate glass-rinsing directions do not apply to the chamber." },
      { q: "Do I need to buy a drying stand?", a: "No special stand is required by the cited cleaning instructions. Use a stable place where the parts will not fall or be disturbed; a stand does not prove a part is dry." },
    ],
  },
  {
    slug: "cloudy-glass-after-cleaning",
    title: "Why Glass Stays Cloudy After Cleaning",
    eyebrow: "Glass troubleshooting",
    description: "Remaining film, water spots and damaged glass need different responses. Work through what to check before reaching for a stronger cleaner.",
    publishedAt: "2026-09-24",
    updatedAt: "2026-09-24",
    readingMinutes: 4,
    keywords: ["cloudy glass after cleaning", "Puffco glass water spots", "glass cleaning", "Puffco cleaning"],
    cover: { title: ["Still", "cloudy?"], subtitle: "Film / spots / surface damage" },
    sources: [
      { label: "Puffco: permitted Proxy glass-cleaning method", url: "https://www.puffco.com/pages/proxy-support" },
      { label: "RIEDEL: glass-care and water-spot guidance", url: "https://www.riedel.com/en-int/information-legal/frequently-asked-questions" },
      { label: "Corning: glass inspection and handling guidance", url: "https://www.corning.com/catalog/cls/documents/infographics/CLS-GL-063.pdf" },
    ],
    intro: [
      "A cloudy patch does not automatically mean you need stronger alcohol. Leftover residue, water deposits and changes to the glass surface can look similar. Start by identifying the part, what you used to clean it and whether the mark changed after the approved wash.",
      "This guide is for detached glass. Do not apply its rinse discussion to an electronic chamber or powered base. If the glass is chipped or cracked, stop using it and deal with the damage before trying to improve its appearance.",
    ],
    comparison: [
      { type: "A film that moves or smears", use: "Record whether it appeared before or after cleaning, and which cleaner touched the glass.", check: "Appearance alone does not establish the substance. Repeat only the maker-approved cleaning and rinsing steps." },
      { type: "Spots or rings left after water dries", use: "Water deposits are one possibility. Glassmakers identify mineral content as a contributor to spotting.", check: "A household descaling method is not automatically permitted for your particular glass or its coatings." },
      { type: "Haze that does not change, or visible damage", use: "Persistent haze is a reason to ask the maker whether the surface is damaged rather than keep scrubbing.", check: "Stop using chipped or cracked glass. Do not polish, scrape or grind damage away." },
    ],
    sections: [
      { heading: "1. Check what actually needs cleaning", body: [
        "Remove the glass according to your device's instructions. Look at the inside and outside separately under ordinary good lighting. A fingerprint on the outside and a deposit inside the water path are different jobs.",
        "Write down the cleaner you used and whether you rinsed it as directed. This simple record is useful if you need support: it is more specific than saying the glass is dirty even though you cleaned it.",
      ] },
      { heading: "2. Finish the approved wash and rinse", body: [
        "For Proxy glass, Puffco prescribes an ISO soak, a thorough water rinse and complete drying before reattaching it. It also says not to use other cleaning solutions or abrasive materials on that glass. Stay within those directions instead of adding salt, a scraping tool or another chemical because a mark remains.",
        "If you own a third-party attachment, use its maker's care instructions. Decoration, coatings and attached materials can matter; a rule for a plain drinking glass is not blanket approval for a custom piece.",
      ] },
      { heading: "3. Treat water spots as a different question", body: [
        "RIEDEL recommends low-mineral water to reduce marks on its glassware and permits white vinegar for superficial stains on its own glasses. That helps explain why a water mark may respond differently from sticky residue. It does not make vinegar a Puffco-approved cleaner.",
        "Before trying a descaling product on an attachment, ask its maker whether that exact cleaner is permitted. Do not mix cleaning products. There is no universal stain-remover purchase we can recommend for every piece of glass.",
      ] },
      { heading: "4. Know when to stop", body: [
        "If the approved cleaning routine leaves the same haze, send the maker a clear photo, the product name and your cleaning history. Ask whether it looks like a deposit or whether the surface needs inspection. A photo cannot reliably identify every residue or establish that a piece is safe to use.",
        "Do not keep increasing pressure or moving to harsher cleaners just to chase perfect transparency. Check for chips, cracks and scratches while handling the piece, and replace damaged glass according to the maker's advice.",
      ] },
    ],
    guideLinks: [
      { slug: "how-to-clean-puffco-proxy", label: "Follow the Proxy glass routine", description: "Keep the glass, chamber, base and Core cup instructions separate." },
      { slug: "how-long-puffco-dry-after-cleaning", label: "Check drying before reassembly", description: "Rinsed glass and cleaned chambers need time to air-dry completely." },
    ],
    faq: [
      { q: "Will stronger alcohol remove water spots?", a: "Do not assume so. A mark may be a mineral deposit, remaining residue or a surface change. Follow the glass maker's method and ask before adding a different cleaner." },
      { q: "Can I use vinegar on Puffco Proxy glass?", a: "Puffco's current Proxy glass instructions specify ISO and say to avoid other cleaning solutions. A vinegar recommendation for another manufacturer's glass does not override that." },
      { q: "Does cloudy glass mean mold?", a: "Cloudiness alone cannot identify mold or another substance. Do not diagnose it from color or a photo; ask the maker about persistent marks and stop using damaged glass." },
    ],
  },
  {
    slug: "cleaning-brush-for-narrow-glass",
    title: "How to Choose a Cleaning Brush for Narrow Glass",
    eyebrow: "Cleaning tools",
    description: "Compare bottle, straw and detail brushes by the opening they must fit, the reach you need, and the parts that should never be forced or brushed.",
    publishedAt: "2026-09-24",
    updatedAt: "2026-09-24",
    readingMinutes: 4,
    keywords: ["cleaning brush for narrow glass", "bottle brush", "straw cleaning brush", "glass cleaning", "dab cleaning kit"],
    cover: { title: ["Check the", "reach."], subtitle: "A brush that fits the job", dark: true },
    sources: [
      { label: "OXO: Water Bottle Cleaning Set, SKU 1329080", url: "https://www.oxo.com/water-bottle-cleaning-set.html" },
      { label: "Corning: glassware brush selection and wear guidance", url: "https://www.corning.com/catalog/cls/documents/selection-guides/CLS-GL-001.pdf" },
      { label: "Puffco: Proxy glass care restrictions", url: "https://www.puffco.com/pages/proxy-support" },
    ],
    affiliateProducts: ["bottleBrushes"],
    intro: [
      "Choose a brush for the smallest opening it has to pass through and the surface it needs to reach. A long handle is no help if the head is too wide, and a flexible shaft is not permission to push through a bend you cannot see.",
      "First confirm that the glass maker allows brushing. This is a tool-selection guide for removable glass with an accessible cleaning path, not a recommendation to brush every Puffco attachment. For example, Puffco tells Proxy owners to use its soak-and-rinse method and avoid abrasive materials.",
    ],
    comparison: [
      { type: "Bottle brush", use: "A larger accessible body or opening that has room for the brush head.", check: "Measure the opening and head width. Do not squeeze a head through a narrow neck just because the handle reaches." },
      { type: "Straw brush", use: "A narrow, accessible passage that the maker permits you to brush.", check: "Check head width, usable reach and tip protection. A wire shaft must not scrape the glass." },
      { type: "Detail brush", use: "Accessible edges or crevices outside a narrow tube.", check: "Do not use it to probe an electronic chamber, charging port or enclosed air path." },
    ],
    sections: [
      { heading: "Measure the opening, not just the whole piece", body: [
        "With the empty glass detached and cool, measure the narrowest accessible opening and estimate the reach to the area you want to clean. Keep the brush outside while checking size. Do not use insertion pressure as your measuring tool.",
        "Look for the brush's head diameter or width as well as its usable length. A listing's overall dimensions may include its handle or packaging and may not tell you how wide the bristles are. If that important measurement is missing, ask the seller rather than guessing.",
      ], photo: {
        src: "/dab-pal/guides/bottle-brush.jpg", width: 4000, height: 6000,
        alt: "Hands using a long bottle brush inside a tall drinking glass over a sink",
        caption: "A bottle brush reaching inside ordinary glass. This illustrates brush reach, not a dab-rig cleaning method or the OXO set linked below.",
        credit: { label: "Greta Hoffman / Pexels", url: "https://www.pexels.com/photo/close-up-photo-of-person-cleaning-a-glass-with-brush-9475294/", license: "Pexels License", licenseUrl: "https://www.pexels.com/license/" },
      } },
      { heading: "Check the tip and the exposed parts of the shaft", body: [
        "Inspect the end before it goes near glass. The cleaning surface should cover the parts that could touch the piece; a bare metal tip or worn bristles can leave the spine exposed. Corning specifically warns that a worn brush spine can scratch glass.",
        "Use only the gentle contact your glass maker permits. Stop if the head catches, requires force or cannot be withdrawn easily. A brush is not a tool for prying off hardened residue, and a wire handle should not become a scraper.",
      ] },
      { heading: "Do not chase every internal bend", body: [
        "A brush that fits the first opening may still be wrong for an internal bend, narrow joint or enclosed section. If you cannot see where the head is going or whether it can come back out, do not push farther. Use the approved soaking method or ask the maker how that part is meant to be cleaned.",
        "Keep this task separate from cleaning powered equipment. A straw brush sold for water bottles is not automatically suitable for an e-rig chamber, contact pin or base air path.",
      ] },
      { heading: "One set to compare: OXO's three brush shapes", body: [
        "OXO's Water Bottle Cleaning Set includes a bottle brush, straw brush and detail cleaner with nylon bristles. They serve different access needs, which makes the set a useful example of what to compare. It is not a universal fit recommendation for glass accessories.",
        "We have not tested these brushes in Puffco glass or compared their cleaning performance with other brands. Check the current product dimensions and the actual head before use. If your maker's soak already cleans the piece, you do not need to buy a brush at all.",
      ] },
      { heading: "Clean and inspect the brush afterward", body: [
        "Follow the brush maker's washing instructions, clear away residue and let the brush dry before storing it. Keep tools used for this job separate from brushes used for drinking bottles or food equipment.",
        "Before the next clean, check for flattened or missing bristles, a damaged tip and an exposed shaft. Replace a worn brush instead of compensating with extra pressure.",
      ] },
    ],
    guideLinks: [
      { slug: "cloudy-glass-after-cleaning", label: "Glass still looks cloudy?", description: "Consider the kind of mark before buying a more aggressive cleaning tool." },
      { slug: "best-swabs-for-dabs", label: "When a swab is the right tool", description: "Compare cotton tips for the surfaces your device maker tells you to wipe." },
      { slug: "what-to-keep-in-a-dab-cleaning-kit", label: "Keep the supplies list short", description: "Separate required cleaning supplies from optional extras." },
    ],
    faq: [
      { q: "Can I use a straw brush on Puffco glass?", a: "Do not assume compatibility. Check the exact attachment's instructions. Puffco's current Proxy glass routine uses soaking and rinsing and excludes abrasive materials." },
      { q: "Will the OXO brush set fit every narrow opening?", a: "No. Compare the actual opening with the brush head and usable reach. We have not tested the set in specific glass attachments." },
      { q: "Should I buy the stiffest brush for stubborn residue?", a: "Choose the method your glass maker permits, not the greatest force. A brush that scratches, catches or needs to be forced is the wrong tool for that part." },
    ],
  },
]
