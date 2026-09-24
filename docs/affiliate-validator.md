# Independent affiliate pilot validation

Reviewed September 24, 2026 against the current source and local storefront at `http://localhost:8000`.

## Verdict

**PASS — bounded local pilot is ready for production release verification.** No remaining must-fix finding in the three articles, affiliate presentation, consent-gated click implementation, or About title after the corrections below. This is not a declaration that the wider SEO sprint, production deployment, analytics ingestion, physical fit tests, or commercial outcome is complete.

The scope is three existing URLs, not 30 new articles. No ranking or commission result is guaranteed.

## Review findings and corrections

1. **Missing exact third product — fixed.** The initial swab comparison used “Other specialty swabs” as its third entry, although SEO-PLAN.md explicitly required three exact products. The revised comparison identifies Q-tips Original, 750 count × 3 packs; Glob Mops XL 2.0, 300-count tub; and Puffco Dual Tool, Single Pack. Dual Tool now has a direct manufacturer link, its distinct loading-end use, unknown pack count, dated sold-out observation, and untested-fit limitation. Another affiliate product was not necessary.
2. **Primary comparison buried on mobile — fixed.** Initially the comparison started about 2,230 pixels down at a 320-pixel viewport, after the contents and related-guide cards. It now comes immediately after the answer and disclosure, before both navigation blocks. The final screenshot and DOM confirm this order and legible stacked cards.
3. **Search-title changes lacked the plan's query-to-page prerequisite — fixed.** The original article titles are retained pending that evidence. The unavailable query/page check is recorded in the pilot notes. The About duplication fix remains appropriate and renders exactly “About Dab Pal.”

## Independently verified

- All three articles and About return HTTP 200 in the local build; checked output has no `noindex`. Article routes and their canonical construction remain intact. Local canonicals correctly use the local base URL; production must resolve to the public host.
- Swab/Proxy/checklist pages contain two/one/one Amazon paid anchors respectively. Their ASINs and dedicated public tag match the recorded listing evidence. Links are standard anchors, open in a new tab, and carry `rel="sponsored noopener"`; they do not depend on tracking to navigate.
- Commission language appears after the introduction and beside the shopping block. Paid destination labeling, pack quantities, bulk-pack caveat, smaller local alternative, and specialty-fit limitations are visible. No copied ratings, Amazon prices, listing images, or invented hands-on performance results were found.
- Independently read the current Q-tips FAQ, Glob Mops XL 2.0 page, Puffco Dual Tool page, New/OG Proxy support, and Core manual. Material, pack, part-identification, soaking, rinsing, cooling, and drying claims are consistent with those primary references. Core cup spot-clean-only guidance appears before soak instructions. The Core manual's chamber/mouthpiece instructions are distinct from glass instructions.
- At 320 × 760, the swab page has `scrollWidth === clientWidth === 305` (the scrollbar consumes the other 15 pixels). Inspected Proxy header/Core section and swab shopping block screenshots: normal wrapping, readable links/disclosures, no observed horizontal clipping. The checklist's rendered headings and content retain the routine/deep-clean/storage distinction. This is responsive-browser inspection, not a physical-phone test.
- The About byline destination identifies Dab Pal's editorial role without fabricated credentials. Article/Breadcrumb metadata remain descriptive; no false product-review ratings were introduced.
- Ran `node scripts/check-affiliate-analytics.cjs`: 21 assertions passed. Source checks show analytics is gated by production hostname and stored opt-in, checked again before capture, and strips unapproved properties. The click carries only the intended public article/product/placement identifiers. This is mocked application validation, not real PostHog receipt.

## Editorial assessment

The pages answer different useful questions: choosing swab formats, caring for a specific device configuration, and assembling supplies. The product links serve those answers. The comparison does not invent a “best” winner from seller copy, and the checklist does not imply Dab Pal includes consumables.

Some repetition remains between comparison cards, body, shopping notes, and quick answers, especially around unknown specialty fit and included contents. It is not a release blocker: readers can enter at different sections, and buying decisions need those qualifications. A later edit can shorten repeated explanations if supported by reading behavior. Avoid adding more generic caution paragraphs or expanding this pilot into near-duplicate pages.

## Release and measurement boundaries

- Root's recorded browser evidence, not a separate validator Amazon session, establishes that both paid links opened the exact live Amazon packs and retained the tag. The validator independently checked rendered anchor identity and the manufacturer's underlying product facts. Seller/stock/shipping can change; no seller endorsement is implied.
- Verify the deployed versions of all three pages and About, their public canonicals, disclosure/links, and narrow layout after release.
- Do not call analytics measurement complete until actual consented pageview/affiliate receipt, route transitions, essential-only suppression, and deduplication have been checked in production. The retained mock checks are useful but narrower.
- The existing purchase-event limitations, incomplete attribution, GSC query/page evidence, performance tests, and original demonstration review remain separately recorded work. Do not present this pilot pass as completion of every SEO-PLAN.md investigation.
- Physical specialty-swab fit, cleaning superiority, Amazon account final review, rankings, qualifying purchases, and commissions remain unproved. Keep the explicit limitations in the public copy and use Amazon reports for qualifying earnings.

## Primary references checked

- [Q-tips materials and storage FAQ](https://www.qtips.com/pages/faq)
- [Glob Mops XL 2.0 specifications](https://globmops.com/products/xl-2-0)
- [Puffco Dual Tool](https://www.puffco.com/products/the-puffco-dual-tool)
- [Puffco New Proxy and Core support](https://www.puffco.com/pages/proxy-support)
- [Puffco OG Proxy support](https://www.puffco.com/pages/proxy-pipe-support-page)
- [Core manual, printed cleaning pages 07–08](https://cdn.shopify.com/s/files/1/0319/5549/files/Puffco_Proxy_Core_Digital-IM_MultiLanguage.pdf?v=1773764503)
- [Amazon simple text-link documentation](https://affiliate-program.amazon.com/help/node/topic/GP38PJ6EUR6PFBEC)

No source files were edited or deployed by this validator. The browser viewport override was reset after inspection.
