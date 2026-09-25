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
- A controlled consented visit and one affiliate-link click were performed from a separate QA tab; no purchase or cart action. Receipt is still under investigation. These QA actions must not be counted as customer demand.
- The confirmation-view event is being corrected separately; actual paid/refunded records remain the financial source of truth.

## Original evidence and distribution

The companion files in `marketing/growth-2026-09-25/` contain a practical filming brief, blank fit-results sheet, and five source-backed prospect records. No outreach was sent. Actual specialty-swab fit, demonstration filming, and measured results still require physical work by the owner.
