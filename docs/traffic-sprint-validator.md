# Independent traffic sprint validation

Reviewer: fresh independent agent, September 25, 2026. This review separates local source/tests, parent-reported browser evidence, and physical/commercial outcomes. The reviewer has not operated the parent's Search Console or PostHog browser sessions, placed an order, changed account settings, or watched the product video firsthand.

## Status: accepted within the completed scope

Both analytics repairs, the Search Console investigation/report, and the original-proof/distribution preparation are accepted. No unresolved source-code must-fix remains. This is acceptance of the completed investigation, repair and preparation, not of filmed product proof, outreach, ranking growth, revenue measurement or sales outcomes. The live account/deployment observations below were supplied by the parent reviewer; the source, SDK mechanics, retained tests and cited prospect sources were independently checked.

## Findings established independently

### Required analytics correction

Installed `posthog-js` 1.373.3 calculates `properties.token` and `properties.$process_person_profile` before invoking `before_send`. Its capture path then queues the hook's returned payload without restoring those fields. The pre-repair application property allowlist removes both. This is a concrete SDK integration defect, not merely a missing dashboard filter. Preserve the public project-routing token and the SDK's no-person-profile flag while retaining the existing restrictive privacy filter. A regression must exercise the installed SDK path and outgoing payload, because mocked `capture` tests did not expose this defect.

**Resolved in the reviewed local patch:** the allowlist now retains exactly those two protocol fields. Independently ran `node scripts/check-affiliate-analytics.cjs` from `storefront`: all 33 assertions pass. The added regression executes the installed SDK's actual property calculation, capture hook, batch formatter, and JSON serializer with in-memory storage/queue doubles and forbidden transport. Independently removed the two entries only from the source loaded in memory: the regression fails on the missing token, confirming it detects the original defect. No files were altered by that negative check. `git diff --check` passes. This verifies the serialization contract, not full SDK initialization, networking, DNT execution, browser behavior, or ingestion.

The actual SDK overwrites caller-supplied `token` with its configured public routing token and computes the profile flag from `person_profiles: "never"` before the hook. The application wrapper does not expose capture options carrying top-level person updates; with current configuration the SDK does not add initial person updates. No new transmission of order IDs, email, full referrers, queries, nested properties, or session IDs was introduced by the allowlist repair. PostHog's [upstream defect report](https://github.com/PostHog/posthog-js/pull/3756) independently corroborates the missing-token ingestion mechanism. This is an outgoing browser-payload review; it does not promise that the analytics server adds no IP-derived metadata.

### Automatic collection follow-up

The parent observed unexpected Web vitals events after the first successful release. SDK source confirms that undefined `capture_performance` can inherit remote configuration even with normal autocapture disabled. Independently found the same pattern in `extensions/exception-autocapture/index.js`: undefined `capture_exceptions` can inherit `_remoteEnabled`. No live exception capture was observed by this reviewer or reported by the parent. Both settings should explicitly be false to preserve the intended limited event collection; tests should exercise the real SDK decision with the server-side setting enabled. The parent accepted this finding. The follow-up also rechecks current consent in `before_send`, protecting SDK-originated capture after revocation. This does not establish cancellation of events already queued while consent was granted.

**Resolved in the reviewed follow-up patch:** both settings are explicitly false, and `before_send` rechecks `analyticsAllowed()`. Independently reran the final 36 assertions and `git diff --check`, both passing. The actual Web vitals enabled getter and exception observer configuration method are exercised with remote enablement true: omitted settings enable collection, explicit false disables it. The actual configured application hook returns null after revocation. This resolves the identified source-level findings without enabling profiles or restoring private properties.

### Commerce measurement scope is appropriate

The confirmation template renders for payment states beyond captured. Renaming its browser event to `order_confirmation_viewed`, omitting amount/currency, and preserving `begin_checkout` amounts is a narrowly scoped correction. The discriminated component props prevent ordinary typed callers from attaching financial properties to confirmation views. Session storage marks an attempted request, not delivery; another session may count again. Neither the new event nor historical `purchase` supports unique paid-order counts or revenue. Existing captured/refunded payment records remain the financial source.

### Original proof and distribution package

`../marketing/growth-2026-09-25/ORIGINAL-PROOF-AND-DISTRIBUTION.md` clearly identifies its script as future recording instructions and its product specifications as listed, not newly measured. It keeps specialty fit unknown, requires raw physical observations, and separates a dry rehearsal from actual use. `swab-fit-results.csv` contains only its header; no fabricated test results were found. Filming, fit testing, final captions/text alternative, publishing, outreach, and commercial outcomes are not complete.

Public primary pages independently checked in this review support the five prospect relevance angles and the listed contact routes. In particular:

- [To The Cloud's Pivot review](https://www.tothecloudvaporstore.com/puffco-pivot-review-the-most-portable-3d-chamber-dabs/) describes the inconvenience of carrying Q-tips and supplies.
- [420 VapeZone's Proxy review](https://420vapezone.com/new-puffco-proxy-review/) describes using multiple Q-tips on the go.
- [VGoodiEZ's business contact page](https://vgoodiez.com/pages/wholesale) publishes the stated business email; the brief correctly avoids calling its buyer-side wholesale application verified supplier intake.
- [Zee Vapor's Travel Case listing](https://www.zeevapor.com/product/puffco-travel-case/) already includes covered trash storage; the brief correctly avoids claiming that capability is absent from alternatives.
- [Vaporizer Wizard's Boost EVO review](https://www.vaporizerwizard.com/reviews/vaporizers/dab-rigs/dr-dabber-boost-evo/) covers portability and cleaning.

These establish relevance, not acceptance, deliverability, audience size, demand, or likely sales. No must-fix was found in the physical-proof brief or blank log.

## Completion gates

1. **Passed locally:** final source diff inspected; 36 application/SDK assertions and whitespace check pass. Denied-consent/nonproduction suppression and existing privacy exclusions remain; serialized events retain the routing token and false profile-processing flag. Automatic performance/exception settings and hook-level consent recheck are covered.
2. **Passed as an account-evidence report:** Search Console report now distinguishes old snapshots, discovery, indexing, accepted requests, and pending ranking outcomes. It includes two dated exact-query/page mappings and a restrained decision to strengthen existing relevant pages with original proof. These live account facts are parent-observed, not independently accessed by this reviewer.
3. **Passed as a release/receipt report:** final source `7c265d8`, Railway release `09717db0-003a-4a73-9cbe-89e5d9705e37`, SUCCESS observed at 16:23:55 UTC September 25; parent reports local/Railway build success and live health 200. The parent reconciled the persisted PostHog table to 15 QA events: seven from the first release and eight from the final release. Final events comprised six expected pageviews, one affiliate click and one guide click. Initial Essential-only browsing, repeated consent grant, and later revocation produced no extra events in the observed session. Final Web vitals/exception events were absent. Same-site hostname-only referrer and false profile flag were observed; external/Google referrer coverage remains unverified. The report correctly distinguishes this evidence from independent offline checks and from customer demand.
4. **Passed with explicit limits:** source `09e64bf` / first Railway release `d18dca37-8a8b-4d8c-990b-c4d1e27bac6c` identifies the confirmation-event deployment cutoff, with old-tab limitations. Historical records remain intact. No real confirmation event, paid order, refund or commission was fabricated or represented as verified by browser QA.
5. **Passed as a bounded handoff:** physical filming/fit tests, final media accessibility work, outreach, future indexing/ranking results and commercial lift remain explicitly pending. No monitoring automation was claimed installed.

## Final review limits

This reviewer did not repeat the parent-owned browser sessions or independently inspect Railway/PostHog accounts. Final live acceptance is based on the parent's direct observations recorded in `traffic-sprint-2026-09-25.md`, critically checked for internal consistency and overclaims. Browser checks cover one session and ordinary clicks; they do not establish every DNT/browser case, keyboard/middle-click coverage, queue retraction, universal exactly-once delivery, Google attribution, or financial outcomes. The parent confirmed the stable 15-event count at 16:28 UTC and recorded the QA exclusion window as September 25, 16:15–16:28 UTC. This resolves the final reporting cleanup; the browser was left on Essential only.
