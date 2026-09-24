# Independent ten-guide review

Review date: September 24, 2026. Reviewer: fresh independent SEO, editorial, and ecommerce UX review. No implementation changes made by this reviewer. This report records direct checks, not acceptance inherited from another review.

## Current decision

**Accepted and production spot check passed: the ten new guides and five truthful photo placements.** All six findings below are closed after source/code corrections and a fresh review of the rebuilt production preview. This accepts the reviewed editorial/photo fallback; exact Amazon SKU photography remains unavailable and is not counted as completed.

## Findings raised and closed

1. **Remove or re-source unsupported Honeybee cleaning claims.** The fresh current Honey Hive product page does not prescribe the asserted 15–30-minute soak. The refreshed Dream Bubble page does not specify 91%+, 20–30 minutes, or a salt prohibition. The current silicone-mat page gives warm water/dish soap/drying, without the asserted alcohol spot-wipe permission. These are factual attributions, not harmless editorial phrasing. Remove them or provide current exact manufacturer evidence. The clearly scoped original Peak glass-cap example can support that guide without an invented timer. Oil Slick separately supports its own brief mat wipe followed by rinsing and drying. Sources: [Honey Hive](https://honeybeeherb.com/products/honey-hive-carb-cap), [Dream Bubble](https://honeybeeherb.com/products/dream-bubble-carb-cap), [Dabbing Mat](https://honeybeeherb.com/products/dabbing-mat), [Oil Slick](https://oilslickpad.com/blogs/news/how-to-clean-dab-tools-rigs-pads-safely).
2. **Complete the Switch 2 insert-cleaning sequence.** The initial copy says to swab after a session but does not explain removing residue from the insert; its detailed step then covers the chamber, pathway, crown, glass, and shell. State the maker's dry-swab sequence followed by an ISO-damp swab while the insert remains warm, without active heating or removal of a hot insert. The main component promised by the title deserves an actual instruction. Source: [Switch 2 knowledge base, Keeping it Clean](https://drdabber.helpscoutdocs.com/article/126-switch2-knowledge-base).
3. **Add intentional links from relevant existing guides into the new set.** At initial review `articles.ts` had no contextual existing-to-new guide links. New-to-existing links and automatic keyword-related links are useful but do not fulfill the research document's planned integration. Add a small, useful selection from the model hub, cleaning-kit guide, and banger guide; verify every target exists. Do not add ten links to every article.
4. **Finish rendered checks after the final build.** Check all ten new pages at 320px and desktop for text wrapping, table/card width, working section jumps, disclosure and purchase-link placement. Check the three updated existing photo placements for truthful captions, legibility, loading, and responsive sizing. Verify final metadata/canonicals/schema and sitemap against the built pages.
5. **Cap the prose width before the large-screen grid breakpoint.** On the first production preview at 1280px, every new article's body text measured 1217px wide, producing long, difficult-to-scan lines. Apply the existing approximately 760px reading-column intention to the single-column layout too; retain the sidebar at the wider breakpoint.
6. **Put the non-affiliate pages' inline case promotion after the answer.** The drying and cloudy-glass pages inserted the case sales block ahead of their actual steps. Move that same block to the article end rather than adding another. Their readers need troubleshooting first.

## First production-preview browser checks

- Opened all ten new pages at 320 × 800 and 1280 × 900. Each had one H1, all section targets existed, and no horizontal overflow was found (305px content viewport at 320px; 1265px at 1280px with the scrollbar).
- Directly exercised section jumps; heading targets remain visible beneath the fixed header after scrolling settles. At 320px, titles, paragraphs, comparison cards, supply descriptions and credits wrap legibly.
- All rendered Amazon links match the intended ASINs and `dabpal-20` tag and carry `sponsored noopener`. The two non-affiliate pages contain no Amazon recommendation.
- Inspected the index and its 22 article links; its heading now includes the broader device scope and its topic navigation includes both Dr. Dabber models.
- Inspected the five photographs in their article contexts. Generic swab, cloth and brush images are clearly labeled; the case photos do not claim to show a Proxy. Images load through the responsive Next image route rather than serving the multi-megabyte originals directly. Their measured display width was 257px on mobile and 576px on desktop. The tall brush photo preserves the brush and glass instead of cropping away their relationship.
- Found the two layout/placement findings above. Both were corrected and rechecked below. No additional factual or product-identity blocker was found.

## Final rebuilt-preview recheck

- Reopened all ten pages at 320 × 800: one H1 each, no horizontal overflow, no missing section targets, and exactly one article-end case CTA per page.
- At 1280 × 900, the drying and cloudy-glass prose is now 760px wide. Their case CTA follows the actual instructions, sources and quick answers; the earlier inline promotion is gone.
- At 1536 × 900, the drying page retains a 760px reading column and a separate More guides sidebar. The sidebar no longer duplicates the case sales card. The full page stays within the viewport.
- Visually inspected the final desktop cloth and brush photographs, the mobile Proxy photograph/caption, and the mobile cloudy-glass end CTA. Earlier screenshots covered the kit, swab, and mobile cloth/brush placements. The photos load, remain recognizable, and have readable truthful captions. The mobile CTA wraps legibly without overflow.
- Route/schema code was independently reviewed. The implementation agent additionally reports successful final build, lint/types, 21 affiliate tests, and HTTP checks of 31 sitemap pages/39 paths, including ten distinct descriptions, Article/Breadcrumb data and qualified paid links. These reported checks supplement, rather than replace, this review's independent content and browser checks.
- Temporary viewport override was reset. No remaining publication-blocking issue was found within this scope.

## What passed the independent source/code audit

Correction recheck: unsupported Honeybee timers, concentration and alcohol-mat attribution were removed; original Peak remains the explicitly named cap example. Switch 2 now gives the dry-swab/ISO-damp-swab sequence with active heating stopped and no hot insert removal. The existing Puffco hub, kit guide and banger guide now contain contextual links to relevant new pages. The two self-commentary phrases were also simplified. These are closed findings, including the subsequent rendered verification.

- Exactly ten new article objects are integrated before twelve existing guides. The intents are distinct: Hot Knife care; alcohol concentration choice; drying readiness; cloudy-glass triage; brush fit; silicone-mat washing; pearls by material; glass carb caps; Switch 2; Boost Evo. Drying and concentration pages complement complete model routines rather than duplicating their disassembly instructions.
- Titles state a reader task and descriptions summarize it without keyword repetition. Each new page has its own title, description, intro, steps, FAQs and source list. No invented ranking, measured performance, or firsthand testing claim was found.
- The route supplies a self-canonical, Article and BreadcrumbList structured data, organization author, date fields, and social image. The shared sitemap uses the integrated article list. No FAQ or HowTo rich-result promise is made. Rendered values remain a separate check.
- Affiliate products are optional, named precisely, placed after the instructions, and disclosed near the introduction and the actual links. Links use `sponsored noopener`, open a new tab, and say paid link. No prices, stars, delivery promises, or sale countdowns are copied into the articles. Guides that do not require a purchase have no affiliate list.
- Hot Knife copy matches the current January 26, 2026 [Puffco article](https://puffco.zendesk.com/hc/en-us/articles/45897875194907-How-do-I-clean-my-Hot-Knife): cooling first, gentle alcohol-swab tip cleaning, dry body cloth, and no liquid at ports/electrical parts. That source specifies no numeric alcohol strength.
- The concentration article correctly separates the current Peak's 90%+ routine from its 99% preference; Proxy guidance uses 90%+. Neither concentration grants a soak to every part. Sources: [current Peak](https://www.puffco.com/pages/new-peak-support), [Proxy](https://www.puffco.com/pages/proxy-support).
- The drying page avoids an unsupported universal countdown and preserves the glass/chamber rinse distinction. Cloudiness is presented as uncertainty, not a diagnosis or an excuse to sell stronger chemicals. RIEDEL guidance is explicitly scoped to RIEDEL glass rather than presented as Puffco permission.
- Boost Evo's no-soak rule was checked against the current June 29, 2026 [knowledge base](https://drdabber.helpscoutdocs.com/article/119-boost-evo-knowledge-base). The actual [printed manual image linked by the maker](https://drdabber.helpscoutdocs.com/article/112-boost-evo-user-manual) was downloaded and visually read: glass/atomizer up to 91%; base/adapter up to 75%; no submersion of atomizer, adapter, or base. Copy reflects these limits and excludes the 99% affiliate product from this article.
- Brush claims match [OXO's exact product](https://www.oxo.com/water-bottle-cleaning-set.html): bottle, straw and detail brushes with nylon bristles, SKU 1329080. It does not claim tested rig fit. The guide distinguishes overall dimensions from head size and warns against forcing the tool.
- Mat soap/water and hanging-to-dry guidance matches [Dulytek](https://dulytek.com/products/dulytek-rosin-silicone-pad). Pearl material/temperature distinctions match [Ruby Pearl Co](https://www.rubypearlco.com/products/6mm-ruby-pearls), [ATGI](https://rubiesareforever.com/pages/insert-care-guide), and [Ritual](https://ritual-co.com/pages/ritual-ruby-shop). Those sources do not justify a universal heated-liquid or torch method.

## Independent product verification

Opened each destination directly in the signed-in US Amazon browser, without cart or purchase actions:

| ASIN | Verified selected identity | Editorial suitability |
| --- | --- | --- |
| B07NFSFBXQ | Amazon Basics 99% ISO for technical use, 16 fl oz, one bottle; ingredient states 99% by volume | Relevant only to parts permitting that concentration; correctly excluded from Boost Evo |
| B009FUF6DM | Amazon Basics microfiber, 24 pack, 16 × 12 inches, blue/white/yellow; wash before first use | Optional cloth pack; bulk quantity is made explicit |
| B008HMF9LS | OXO Good Grips Water Bottle Cleaning Set, bottle/straw/detail brushes, nylon bristles | A selection example, not a guaranteed rig-fit recommendation |
| B0BPLQ9XZH | Q-tips cotton swabs, 750 count × 3 packs | Relevant ordinary swabs; unusually large pack is disclosed |

These checks verify listing identity and described use, not firsthand performance, every seller offer, or permanent availability. Existing Glob Mops is outside the new ten articles' recommendations.

## Writing and photos

The writing leads with an answer and keeps instructions specific. Two instances of editorial self-commentary identified during review were simplified. Repeated reminders to use existing supplies are defensible here because the affiliate packs are large.

The current implementation contains two owned Dab Pal photos and three licensed Pexels illustrations (plain wooden-stem swabs, a cloth wiping a surface, and a bottle brush in ordinary drinking glass). I independently checked the [Pexels license](https://www.pexels.com/license/) and photo source pages; the license permits ecommerce/blog use and changes, with no implied endorsement. Captions identify these as illustrations. They are **not exact photos of the Amazon-linked Q-tips, Glob Mops, cloth, alcohol, or brush SKUs**, and cannot be counted as delivery of that branded-media enhancement. No generated branded-product photo or fake before/after result should substitute for missing authorized media. The five current placements passed visual review.

## Acceptance boundary

All six findings are closed. Acceptance covers the ten publishable guides and the five reviewed photo placements only. It does not certify exact Amazon product photography, physical product fit, firsthand cleaning tests, legal compliance, indexing, rankings, or revenue. Material content, product or layout changes after this review require a targeted recheck.

## Production spot check

After the implementation agent reported Railway deployment `b24f5671-4ae9-461d-8a3d-2a47df696d0d` successful for source `ff9b42f`, independently opened the live pages at [thedabpal.com](https://thedabpal.com/blog).

- At 1280px, the live Hot Knife page has the correct production canonical, 760px reading column, and the reviewed cool-completely-first instructions. Its swab and cloth links retain the verified ASINs, `dabpal-20` tag, paid-link wording and `sponsored noopener` attributes.
- The live Boost Evo page preserves the no-soak rule, up-to-91% glass/atomizer limit and up-to-75% base/adapter limit. Its sole Amazon recommendation is the verified swab product; no 99% ISO affiliate recommendation appears.
- The live brush page loads the final 576px illustration, keeps the ordinary-glass/non-OXO caption, and links to the verified OXO ASIN. The live mat page loads the final cloth illustration at 257px on a 320px viewport, with its non-Amazon-pack caption legible.
- The live cloudy-glass page at 320px has no overflow, no Amazon recommendation, and one case CTA after its instructions, sources and quick answers. The CTA and button render legibly.
- The live index exposes all 22 distinct guide destinations, including all ten new guides, and has no horizontal overflow at 320px.
- No purchases, cart changes or consent changes were performed. Temporary viewport override was reset. No release-blocking discrepancy from the accepted preview was found.
