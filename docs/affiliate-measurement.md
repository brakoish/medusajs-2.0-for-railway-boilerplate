# Affiliate pilot: measurement and demonstration check

Checked September 24, 2026 against the current storefront source. Read-only source review and isolated Node checks only: no production events, orders, deployment, database tests, or browser activity were performed for this check.

## Measurement that exists now

- `src/app/posthog-provider.tsx` explicitly requests `$pageview` when the public pathname changes and when analytics is allowed. Checkout, account, order and password-reset routes are excluded. The SEO plan's earlier statement that no explicit pageview was found is superseded by current source.
- `src/lib/util/analytics.ts` loads PostHog only on `thedabpal.com` with the stored `analytics` choice. It checks consent again after loading and in `before_send`. Essential-only, missing choice, other hostnames and inaccessible browser storage suppress new capture attempts at those gates. Automatic pageviews/pageleave, click autocapture, Web vitals/performance capture, exception capture and session replay are explicitly disabled; persistence is memory-only and Do Not Track is configured. This is not a claim that every possible SDK automatic event type is disabled. Revocation blocks subsequent capture through the hook; it does not retract events already queued or delivered.
- `src/lib/util/analytics-properties.ts` applies a final outgoing-property allowlist. Article slug, product ID, placement and own-product destination survive. Queries, fragments, full referrers, nested properties and unexpected identity/contact properties are removed from that outgoing payload. Order/account/checkout paths are reduced to their route family. Referrers are reduced to `referrer_host`. This filter does not control PostHog's server enrichment: the parent's September 25 live inspection found IP/GeoIP properties on a received pageview. Do not describe the resulting stored event as free of all personal information.
- Installed PostHog 1.373.3 defaults `save_referrer` to true, and its capture path updates referrer information before computing event properties. Thus source supports the sanitizer receiving SDK referrer data. Actual receipt and referrer coverage have not been verified. Empty/malformed referrers are omitted; host alone does not reliably classify every visit as organic, paid or direct.
- `src/modules/blog/affiliate-link.tsx` requests one `affiliate_click` per click handler invocation with `article_slug`, public ASIN as `product_id`, and `placement: article_supplies`. The link is a normal new-tab anchor qualified with `sponsored noopener`; tracking cannot block navigation. It uses the shared consent gate.
- Existing `guide_product_click` records article slug, destination and placement for the relevant own-product links. These events measure consented interest, not all article readers.

## Isolated checks: 36 passed

Run `node scripts/check-affiliate-analytics.cjs` from the storefront directory. The retained script transpiles the current TypeScript modules in memory and executes them with a fake SDK, browser storage/location, and React effects. No network requests are made. The original 21 assertions cover these behaviors:

1. Affiliate identifiers survive the allowlist.
2. Private/nested/unapproved SDK properties are removed.
3. Referrer is reduced to hostname.
4. Path queries and fragments are removed.
5. Order IDs in paths are redacted.
6. Missing choice blocks SDK initialization and capture.
7. Essential-only blocks capture.
8. Nonproduction hostname blocks capture.
9. One consented affiliate call reaches fake capture once.
10. Automatic pageviews, click autocapture, performance capture, exception capture and replay are disabled in configuration; DNT is configured.
11. Revocation blocks subsequent calls.
12. Affiliate anchor preserves its qualification and new-tab behavior.
13. One click-handler invocation requests one event.
14. A public-route effect requests a pageview.
15. Checkout suppresses pageviews.
16. Account, order and reset routes suppress pageviews (three separate assertions).
17. Inaccessible browser storage fails closed.
18. A new analytics grant requests a pageview.
19. Reselecting an existing analytics grant does not request a duplicate pageview.

September 25 repair adds nine assertions: unpaid, authorized, captured and refunded confirmation fixtures all request `order_confirmation_viewed` without financial props; confirmation tracking sends no financial data or order ID and suppresses repeat attempts in the same tab; fresh session storage can count another view; checkout retains its amount/currency; denied consent suppresses confirmation tracking; and unavailable session storage does not interrupt confirmation or send an event.

The September 25 ingestion investigation adds three assertions through the installed SDK's real enrichment, capture, configured `before_send`, request batching and JSON serialization. The final allowlist had removed SDK-added `token` and `$process_person_profile`, losing project routing and the explicit no-profile flag. Those two protocol fields now survive. The checks cover pageview, guide click and affiliate click, preserving the required token and `false` profile-processing flag while continuing to remove private properties, queries and full referrers. They use an offline fixture token and in-memory storage/queue with network transport forbidden; the SDK is never initialized. The token-retention regression failed before the two-field fix and passes afterward. See `measurement-repair-audit.md` for installed SDK and upstream evidence.

The live parent check subsequently received a pageview and an unexpected Web vitals event. The follow-up sets `capture_performance: false` and `capture_exceptions: false` explicitly: leaving these undefined lets remote configuration enable their respective automatic collectors independently of `autocapture: false`. Three additional checks prove the installed Web vitals and exception configuration code respects explicit false even when the server enables them, and the actual `before_send` hook returns null after consent revocation. These do not test removal of already queued events. Exception capture was identified in source, not observed in production.

These checks validate application behavior with mocks and installed SDK serialization, not PostHog networking, ingestion, browser hydration, real route transitions, keyboard/middle-click coverage, or receipt in a dashboard. DNT behavior was checked as configuration, not executed inside the real SDK.

## Important limits and next verification

- **Pageview deduplication:** the confirmed preference-reselection duplicate was fixed in this pilot. `choose()` now checks the previous consent before requesting a pageview, and the retained isolated check passes for both new grants and repeated selections. Browser route transitions, repeated mounts and production dedup still require checking.
- **Paid orders:** the September 25 source repair changes the misleading `purchase` event to `order_confirmation_viewed` and removes its amount/currency. `CommerceEvent` suppresses repeated attempts in the current tab's sessionStorage and does not send an order ID. Another tab/session can count again; a failed send can still leave an attempt marker. This is a consented confirmation-view attempt, not verified, globally unique paid orders. Historical `purchase` has the same view-based limitation and must not be used as paid-order or revenue proof. Use Medusa captured/refunded payment records as the revenue source of truth and reconcile with processor records. Existing admin Reports groups captured payments, refunds and net payments by currency, including shipping/tax. Deployment cutoff and real ingestion must be verified separately; see `measurement-repair-audit.md`.
- **Attribution/coverage:** memory persistence does not establish a durable visitor identity across full reloads. SDK session identifiers are removed by the allowlist. Do not assume standard PostHog sessions, landing-page funnels, or cross-visit paid-order attribution are complete. Consent choices, DNT, blockers and failed requests limit coverage.
- **Commercial outcome:** Amazon reports are the source for qualifying orders and shipped commission earnings. `affiliate_click` is intent only. The dedicated ID is shared across the pilot, so it does not independently establish which article generated an Amazon order.
- **Ratios:** consented clicks divided by consented pageviews can describe observed click-through after duplication checks. Amazon's all-reported earnings divided by only consented site clicks/views has mismatched coverage; label that limitation rather than presenting it as true earnings per all clicks/visits. GSC clicks are not sessions or all article visits.

Before judging the pilot, verify a consented pageview and affiliate click in actual PostHog receipt, essential-only suppression, a public-route transition, referrer-host availability, and preference-reselection dedup. Then report consented reach/click counts separately from GSC search clicks and Amazon's qualifying earnings. Do not place a live order just to satisfy this check.

## Existing demonstration: retain provisionally

The homepage mounts `StudioStory` after its product picker. Its existing real MP4 has controls, muted inline playback, `preload="none"`, a local product poster, a slider-specific accessible label, and adjacent text explaining the 30 regular swabs, empty bottle, separator, exclusions and untested specialty fit. Preserve this useful placement and loading behavior.

There is no caption track or full operation transcript in this component. The adjacent copy is a short product explanation, not a verified transcript. This source-only check did not watch the video, assess speech/audio, confirm all four operations (loading, use, moving used swabs, emptying), inspect the poster on mobile, or prove media delivery. The parent's visual review should decide whether the existing footage sufficiently demonstrates the operation. Reuse it if clear; add an accurate text sequence/captions where needed after viewing. Do not fabricate a transcript or commission replacement footage based only on source markup. No homepage title, broad copy, or placement change is justified by this check alone.

Root browser follow-up: the existing player loaded and played through its 15-second clip at narrow mobile width. The inspected frames show actual hands loading regular swabs into the real case; the final frame shows the loaded case and bottle area. Retain it for product/loading context. These sampled frames do not establish the full use → used-side → emptying sequence or an audio transcript. A future original demonstration should explicitly show those steps and receive an accurate text alternative; this pilot does not claim that media assignment complete.

