# Traffic and measurement sprint — September 25, 2026

## Scope

Check Google discovery and query-to-page evidence, verify real analytics receipt, correct misleading commerce measurement, and prepare original product evidence and a small relevant distribution list. No new article batch, purchases, customer messages, paid tools, or fabricated product tests.

## Search Console: direct account observations

Property: `sc-domain:thedabpal.com`. The Page indexing report is dated September 20, so its counts predate the September 24 article release.

- 22 indexed URLs and five excluded URLs in the report. These are whole-site URLs, not the 22 current blog articles.
- Exclusions: three redirects, one 404, one robots exclusion. The 404 example is the invalid `https://thedabpal.com/$`; the robots example is `/account`, last crawled May 9. Neither identifies a missing public sales guide.
- Submitted sitemap reports Success, last read September 24, with 21 discovered pages. The current live sitemap has 31 public URLs, including 22 guides. Discovery of the latest ten is not established by the older report.
- No Core Web Vitals field data shown in the overview. This is not a performance pass or failure.

| Inspected URL | Google status | Last crawl shown | Google-selected canonical |
| --- | --- | --- | --- |
| `/` | Indexed | September 22, 2026, 2:56 PM | Inspected URL |
| `/store` | Indexed | August 30, 2026, 1:41 PM | Inspected URL |
| `/blog/best-swabs-for-dabs` | Indexed | September 19, 2026, 1:50 PM | Inspected URL |
| `/blog/how-to-clean-puffco-peak-pro-proxy` | Indexed | September 19, 2026, 2:23 PM | Inspected URL |
| `/blog/how-to-clean-puffco-hot-knife` | Unknown to Google before request | None | None |

The older store and swab snapshots show no user-declared canonical, while their current live HTML declares one. Do not remove or change current canonical markup based on the historical snapshot.

### Actions

- Requested indexing for the updated swab guide once. Google confirmed it was added to a priority crawl queue. This is a request, not proof of a fresh crawl or ranking change.
- Requested indexing for the new Hot Knife guide once; Google confirmed the same priority-queue acceptance.
- Requested a fresh crawl for the updated store once; Google confirmed priority-queue acceptance. Its indexed snapshot had still been from August 30.
- Resubmitted the existing sitemap once. Google confirmed success and updated its September 25 read to **31 discovered pages**, resolving the earlier 21-page discovery gap. Discovered does not mean indexed.

### Query-to-page evidence and decision

Live Performance, Web (text), three-month selection covering July 7–September 23, 2026: 48 clicks, 9.12K impressions, 0.5% CTR, average position 10.2. Query reporting omits some data; page and property impression totals are not additive or interchangeable.

| Exact query | Clicks / impressions | Average position | Observed landing pages: clicks / impressions |
| --- | --- | --- | --- |
| `puffco cleaning kit` | 2 / 193 | 9.2 | Homepage 2 / 143; Puffco overview guide 0 / 44; legacy Marble URL 0 / 4; store 0 / 2; legacy Slate URL 0 / 1; Pivot guide 0 / 1 |
| `dab q tips` | 1 / 240 | 9.0 | Swab guide 1 / 239; cleaning-kit contents guide 0 / 1 |

Unfiltered page evidence identifies existing assets worth strengthening: swab guide 12 clicks / 1,566 impressions; Puffco overview guide 6 / 3,042; Pivot guide 4 / 1,737; Proxy guide 4 / 623. These are acquisition observations, not evidence of sales or affiliate commissions.

Decision: preserve the homepage's buyer intent for cleaning-kit searches and the swab guide's comparison intent. Keep model-specific cleaning instructions distinct. The latest content release is only a day old; avoid another broad title rewrite or duplicate keyword pages before its crawl and performance can be measured. The next substantive addition should be the original loading/use demonstration and measured swab-fit comparison in the companion brief, after actual recording/testing.

## Analytics verification

- Signed into the existing US PostHog account and matched project 421092's public token to the storefront source. No new key or permission was created.
- Unfiltered Activity showed no matching events in the last seven days at the initial check.
- Initial pre-repair consented navigation and affiliate-click checks produced no observed receipt. The installed SDK regression then isolated the sanitizer's removal of its required public routing token and no-profile flag.
- Source `09e64bf` deployed successfully as Railway release `d18dca37-8a8b-4d8c-990b-c4d1e27bac6c`; health check passed. After reloading the public guide, its first real pageview was timestamped September 25, 16:15:22 UTC in PostHog. An actual affiliate click and guide-to-store click were subsequently received, followed by store and privacy route pageviews. The affiliate event retained the correct article slug, public product ASIN and placement; the pageview retained the sanitized path and profile-processing flag `false`.
- Re-selecting Allow analytics on Privacy did not add another pageview in the observed interval. This is a narrow browser check, not a universal exactly-once guarantee.
- The same live run exposed unexpected automatic Web vitals events. Installed SDK inspection confirmed that omitted `capture_performance` inherits remote settings despite `autocapture: false`. The validator identified the same remote fallback for exception capture. The follow-up explicitly disables both and rechecks consent in the final hook.
- PostHog's received event includes server-side IP/GeoIP enrichment. The outgoing property allowlist is not proof that the analytics service stores no network or derived location data. No raw IP or location values are recorded here.
- All these checks were controlled QA visits; no purchase or cart action. Exclude this window from customer-demand claims. No raw event ingestion API was used.
- The misleading browser `purchase` event is now named `order_confirmation_viewed`, without value/currency. The first release above is the source cutoff, but already-open old tabs may run the previous bundle. Actual captured/refunded payment records remain the financial source of truth. No real order confirmation event was triggered or claimed verified.

### Final release and verification

Source `7c265d8`, Railway release `09717db0-003a-4a73-9cbe-89e5d9705e37`: SUCCESS observed September 25 at 16:23:55 UTC. Both local and Railway builds passed; the live health endpoint returned 200 / status ok. All 36 focused application/installed-SDK checks passed independently.

The final browser run began with Essential only selected and a full page reload. Blog and privacy navigation added no observed events to the seven-event baseline. Granting analytics on Privacy produced one received pageview; reselecting the existing grant added none. A separate ordinary Privacy-details navigation deliberately reloaded the page and produced another expected pageview; its received `referrer_host` was exactly `thedabpal.com` and the person-profile processing flag was false. This verifies one same-site referrer, not Google-origin coverage or complete acquisition attribution.

The saved Activity table then reconciled to **15 total QA events: seven from the first release plus eight from the final release**. The latter were six expected pageviews (grant, intentional reload, blog, Hot Knife, store, return to privacy), one affiliate click and one guide-to-store click. The inspected guide click had the correct article slug, `destination: /store`, `placement: article_end`, hostname-only referrer and false profile flag. No final-release Web vitals or exception event appeared.

After returning to Privacy, selected Essential only and followed the blog → Hot Knife → Amazon-link path again. No subsequent pageview or affiliate event appeared during the observed interval; the expected eight-event final-run count remained unchanged. Browser error/warning log was empty. These checks cover regular clicks and this browser session; they do not prove all browser/DNT combinations, cancellation of events captured before revocation, keyboard/middle-click completeness or globally exactly-once delivery. Event-table visibility lagged the live feed briefly, so verification used the reconciled persisted table, not only an immediate empty snapshot.

The bounded QA window was **September 25, 2026, 16:15–16:28 UTC**. The final refreshed table still showed 15 entries at 16:28 UTC. These observed events were controlled QA, not new customer demand. The test browser was left on Essential only. Historical records were not deleted or rewritten, and no order/payment/commission was fabricated.

## Original evidence and distribution

The companion files in `marketing/growth-2026-09-25/` contain a practical filming brief, blank fit-results sheet, and five source-backed prospect records. No outreach was sent. Actual specialty-swab fit, demonstration filming, and measured results still require physical work by the owner.

## Next measurement decisions

- First confirm the September 24 guides have been crawled/indexed; do not treat their first few days of zero clicks as failure. Check individual URLs that remain excluded and act on their actual reason.
- After a full 28-day post-release window, compare the same GSC page/query filters with the preceding 28 days. Report clicks, impressions, CTR and average position separately; small totals and a changing query mix limit conclusions. Keep July–September figures above as context, not a directly comparable 28-day baseline.
- Prioritize the swab guide and Puffco overview/Pivot pages using their existing impressions and observed query ownership. Add original evidence to the existing relevant page rather than multiplying near-duplicate articles.
- Use consented pageviews, guide-to-product clicks and affiliate clicks to find where readers stop. Exclude this sprint's QA window from any customer-growth claim. Memory-only identity and consent coverage prevent treating this as a complete customer journey.
- Report Medusa captured payments/refunds and Amazon qualifying earnings separately. Neither article clicks nor confirmation views prove revenue or article-level order attribution.
- Begin only the first two relevant outreach conversations after the demonstration exists and sending is authorized. Record responses and referral visits before widening the list; do not buy links or require favorable reviews.

These are manual follow-up decision points, not an installed monitoring automation or a promise of ranking growth.
