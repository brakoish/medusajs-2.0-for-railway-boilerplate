# Pocket Studio storefront — design and release QA

## Visual truth and evidence

- Source: `../marketing/redesign-2026-09-17/round-4/01-soft-geometry.png` (1536 × 1024).
- Implementation: production-built Next.js storefront at `http://localhost:8000/`.
- Desktop evidence: `../marketing/redesign-2026-09-17/qa/independent-fixed-home-desktop.png`.
- Combined comparison: `../marketing/redesign-2026-09-17/qa/reference-vs-final.jpg`.
- Full page: `../marketing/redesign-2026-09-17/qa/home-desktop-full-final.png`.
- Additional evidence: `home-mobile.png`, `home-320.png`, `product-mobile.png`, `cart-desktop.png`, `cart-mobile.png`, `checkout-desktop.png`, `checkout-mobile.png`, `blog-mobile.png`, `guide-mobile.png` in the same QA directory.
- CSS viewport: desktop 1536 × 1024; phones 390 × 844 and 320 × 740. Desktop content screenshot is 1521 px wide excluding its 15 px scrollbar; no material density scaling. Reference is a flat generated desktop mockup, not a screenshot of a functioning store.
- State: light theme, signed out, Black selected, empty cart for source comparison. Functional tests use reversible test cart items.
- Focused comparisons: hero type/image and finish chooser. Evidence: `qa/compare-hero-final.jpg` and `qa/compare-picker-final.jpg` under the marketing review directory; mobile screenshots separately validate wrapping, button size, and product framing.

## Required fidelity surfaces

1. **Typography:** locally served Coiny display and DM Sans text; original supplied Dab Pal vector mark. Rounded, heavy headline character follows the reference. Generated mock lettering is not an exact distributable font; Coiny is an intentional practical interpretation. Increased desktop headline, picker headline, price, and descriptive copy after initial comparison.
2. **Layout:** matching wide split hero, cream canvas, hairline section borders, left purchase information, two finish cards, selected ring/check, full-width dark purchase button. Mobile stacks hero and purchase information while retaining two side-by-side finishes. Fixed an inherited overflow rule that prevented sticky navigation.
3. **Color:** cream `#f1eadf`, ink `#20211e`, orange `#ec6239`; darker orange for small text contrast. Original logo preserved rather than redrawn from generated lettering.
4. **Images:** optimized WebP hero and finish tiles generated from the selected product direction. Wide tiles replace initial pillarboxed tiles; complete lids and bases stay visible. Original product video and supplementary photos remain available. Generated imagery is art direction, not physical product-fit proof.
5. **Content:** chooser retained; user explicitly changed the hero to “Keep the session clean” during final review. Real catalog prices, inventory and variants drive purchase controls. Case/slider/empty bottle included; no swabs or iso; 80 × 80 × 25 mm; made to order with 3–5 business days handling and 14-day returns. Blog covers remain text only.

## Iteration history

- Initial P2: tight/uneven finish framing and sidebars → regenerated wide matching tiles and adjusted crop.
- Initial P2: desktop cart repeated twice → corrected responsive visibility.
- Initial P2: hero and purchase typography too small → adjusted sizes against source.
- Initial P2: mobile product buying controls appeared after all media/details → primary image followed by purchase controls; supporting media and details below.
- Initial P2: cart lacked readable finish identification → display Black Speck / White Speck with pack size.
- Initial P2: checkout input labels were not programmatically connected → matched input IDs and label targets; mobile address uses full row.
- Independent P1: account help linked to missing `/customer-service` → changed to existing FAQ.
- Independent P2: unreleased custom preview promoted from Shop → replaced teaser with useful guide navigation.
- Independent P2: product imagery undersized → enlarged desktop hero 18% and finish images 15%; reviewer accepted image weight on recheck.
- Independent P2: pack options lacked selected state → added `aria-pressed`.
- Independent P2: product-page add feedback weak → added visible status and cart link.
- Independent P3: thumbnail destination/name, duplicate review attribution, and narrow cart rows → finish-specific links and alt text, corrected attribution, stacked rows at 320 px.
- Independent P2: account visual system and outdated 404 copy → cream account layout, readable display heading, correct recovery copy. Removed dangling template consent links to nonexistent policies rather than inventing legal documents.

## Functional evidence

- White Speck Single: selected and added at $25; quantity changed to 2 and total updated to $50; checkout retained finish and quantity.
- Black Speck 3-Pack: price $65 and matching cart variant verified.
- Independent reviewer also verified Black 6-Pack at $120.
- Created test cart items removed; no payment or order submitted.
- Checkout entry and required-field validation checked; no personal address/payment data entered.
- Guide listing and article navigation, text covers, responsive layout and image loading checked.
- Production build passed. Changed-file lint and separate TypeScript comparison run; pre-existing type debt tracked separately from release regressions.
- `node scripts/check-session-actions.cjs`: isolated account headers, cookie timing, cart-deletion SDK signature, and confirmation-cookie regression checks pass.
- `node scripts/check-product-schema.cjs`: 10 product schema assertions pass.
- Production Stripe live public-key and address-autocomplete configuration presence verified without exposing values. Local preview does not exercise live payment completion.

## Remaining review gate

Fresh independent reviewer returned PASS after observing every required and minor correction in the rebuilt preview. Full report: `../marketing/redesign-2026-09-17/qa/independent-review.md`.

Post-fix evidence includes `independent-fixed-home-desktop.png`, `independent-fixed-home-mobile.png`, `independent-fixed-home-320.png`, `independent-fixed-account-mobile.png`, `independent-fixed-store-tablet.png`, `independent-fixed-pdp-success-320.png`, and the additional screenshots linked from the independent report. The final headline was also checked at 768 px. The fresh post-build browser session reported zero console errors or warnings; an older restart-related request error was excluded and documented separately.

All actionable P0/P1/P2 findings are resolved. All listed P3 corrections were also applied. Remaining limits are payment completion, real account credentials, email delivery, shipping-label purchase, and physical fulfillment; no claim of those tests is made. Production deployment is a separate final release check.

Final build passed. Changed-file lint has zero errors and one existing shipping-address dependency warning. Separate TypeScript checking has no new diagnostics and resolves six baseline diagnostic categories; unrelated legacy type debt remains.

final result: passed
