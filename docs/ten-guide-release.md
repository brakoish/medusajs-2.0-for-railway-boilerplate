# Ten-guide expansion and article photos

September 24, 2026.

## Scope

Ten new guides expand the library from 12 to 22 articles:

- Puffco Hot Knife cleaning
- 91% versus 99% isopropyl alcohol for Puffco
- Drying after Puffco cleaning
- Cloudy glass after cleaning
- Choosing a brush for narrow glass
- Silicone dab mat cleaning
- Terp pearls by material
- Glass carb cap cleaning
- Dr. Dabber Switch 2 cleaning
- Dr. Dabber Boost Evo cleaning

Research and source checks are in `ten-guide-research.md`, `accessory-guide-sources.md`, and `ten-guide-products.md`. Existing model, kit, and banger guides link into relevant new guides. The index introduces the broader library and links directly to both Dr. Dabber model guides.

Three additional verified Amazon supplies join the existing swab options: 99% ISO, a microfiber cloth pack, and the OXO three-brush set. Products appear only where relevant; drying and cloudy-glass guides have no affiliate shopping list. The Boost Evo guide deliberately excludes the 99% product because its printed manual sets different concentration limits.

The independent review caught and corrected unsupported cached-source claims, a missing Switch 2 insert-cleaning sequence, and missing links from existing articles. Its rendered review also led to a 760px reading-column limit at intermediate desktop sizes and one shared case promotion at the end of each guide, replacing the early and duplicate sidebar promotions.

## Photos

Five article placements use two existing owned Dab Pal photos and three licensed Pexels photographs. The kit and Proxy photos state that swabs and alcohol are not included and the supplied bottle is empty. The swab, cloth, and brush figures state that they are illustrations, not images of the linked Amazon products. Credits and license links appear beside each licensed figure. Provenance is recorded in `article-photo-sources.md`.

Exact Amazon SKU photography remains unavailable through an authorized account image source. These illustrations are not represented as completion of branded product photography. No Amazon image scraping, generated product pack shots, API credential creation, purchase, or account security change was performed.

## Local checks

- Production build passed with lint and TypeScript validation enabled; 22 article paths generated.
- Read-only HTTP crawl: 31 sitemap pages, 39 total paths including redirects and a real 404; no failures.
- All ten new pages have unique descriptions, Article/BreadcrumbList data, and qualified `dabpal-20` affiliate links where present. All affiliate pages contain the Amazon disclosure.
- Existing affiliate/consent checks: 21 passed. These use a mocked analytics capture and do not prove actual PostHog ingestion.
- The three new responsive photo requests returned HTTP 200 as WebP at 640px: swabs 8,326 bytes; cloth 10,126 bytes; brush 26,818 bytes. Source files are not the article's responsive payload.

## Independent review and deployment

The fresh validator accepted the revised local production build for publication after the source, mobile, desktop, link, and photo reviews. See `ten-guide-validator.md` for the evidence and acceptance boundary.

- Source commit: `ff9b42f`, pushed to the production `master` branch.
- Railway Storefront deployment: `b24f5671-4ae9-461d-8a3d-2a47df696d0d`, status `SUCCESS`.
- Live site: https://thedabpal.com/blog . The library visibly contains the new guides.
- Live read-only HTTP crawl: 31 sitemap pages, 39 total paths, zero failures.
- All five live responsive photo requests returned HTTP 200/WebP at 640px. Owned Slate and Marble photos were 18,706 and 16,654 bytes respectively; new licensed photo sizes matched local checks.
- Independent production browser spot-check results are recorded in the validator report.

This release does not establish physical product compatibility, firsthand cleaning performance, search indexing, ranking, affiliate earnings, or sales results.
