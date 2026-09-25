# Current-model product photo rollout

## Live result

- Storefront source: `f0e6b45`; Railway deployment `963a81eb-0c45-4c4b-b811-57874f0c86ca`, SUCCESS.
- Backend email/settings source: `ddcb58f`; deployment `9fc4140f-7f62-42e4-8a45-057175ce8b3b`, SUCCESS.
- Homepage hero: approved current-model Slate cutout, tilted over a CSS orange circle. This keeps the user's preferred composition without retaining the old model.
- Homepage finish cards, product main/detail photos, catalog gallery, variant thumbnails, cart/checkout, two article figures, transactional email images and social sharing images use the updated set.
- Closed photos are the primary/catalog images. Open photos show bottle/swab storage. Full square framing is preserved without zooming the lid out of view.

## Assets and accuracy

`storefront/public/dab-pal/model-2026-09/` contains four 1254 × 1254 photographs as WebP/JPEG plus the transparent Slate hero cutout. WebP photographs range from 61–194 KB. Social images are 1200 × 630 JPEGs, approximately 54 KB each.

Masters and generation records remain outside the repository in `../marketing/product-photos-2026-09-25/matched-shallow-logo/`. Slate photos are AI-assisted studio edits of owner-supplied photographs. Marble is a digital color preview, identified at finish selection and in the article/detail captions. No physical Marble-finish match has been verified.

The first generated transparent cutout was rejected because it deepened the logo and introduced fringes. The second passed independent visual review. Its WebP alpha was compared against the PNG: all 1,572,516 alpha values matched exactly. Chrome rendering over orange showed no block artifacts.

## Medusa changes

Persisted `dabpal_settings` advanced from version 1 to 2; only the four finish-image paths changed. Updating defaults alone would not have replaced the saved media overrides.

The native catalog contains updated thumbnails for two products and seven variants, four standard-product gallery images, two custom-product gallery images, and fourteen variant-image links. Image uploads use the existing media bucket. Previous gallery records were soft-deleted, and their files remain available for historical order records.

The catalog change used an image-only database transaction with a pre-change snapshot and assertions that product/variant identity, prices, options, inventory links and promotion records remained unchanged. It did not update order, customer or payment records. Deployment credentials were used in process memory, not saved with the rollout artifacts.

Snapshots, upload URLs, transaction script and verification results are in `../marketing/product-photos-2026-09-25/site-rollout/` and its parent folder. Recovery should restore only the image fields/relationships and settings from the snapshot, not overwrite intervening commerce data.

## Validation

- Storefront production build passed lint/type checks; final Railway build and health check passed.
- Focused email rendering test passed with Slate and Marble JPEG URLs.
- Independent fresh validator passed source/image completeness and the final cutout hero.
- Live browser checks covered desktop, 375px usable width, and 320px usable width. New hero lid/base remained visible; no horizontal overflow was observed.
- Both finishes added successfully. Cart and expanded checkout summary showed the correct new color thumbnails at 320px. Test items were removed; no customer details, payment or order were submitted.
- Public settings/catalog APIs returned the new assets; homepage, store, legacy product route and both affected article routes returned 200 with new photo references.
- Updated Marble article photo loaded at its natural square ratio without cropping.
- Browser viewport overrides were cleared after verification.

## Remaining physical media

The demo video is still earlier-model footage and is now labeled accordingly. Replace it when a new physical demonstration is available. Historical order photographs are intentionally retained. Previously cached third-party social previews may persist until those services refresh.

## Additional reference-based scenes

On the owner's follow-up request, two further images were generated from the approved Slate references. A fresh independent visual reviewer passed both for their intended display sizes, but recommended retaining the existing hero because its geometry was more faithful. The alternate hero is archived in `../marketing/product-photos-2026-09-25/additional-shots/`; it is not deployed.

The accepted desktop scene is deployed as `dab-pal-slate-desktop.webp` (1536 × 1024, 124,744 bytes) in the Slate-only secondary product gallery and the cleaning-kit guide. Both preserve the full 3:2 frame and explain that the cloth and swabs are not included. The main product photos, orange-circle hero, Medusa records and purchase flow are unchanged.

- Source `dd76b2e`; Storefront deployment `9f5bee92-2e3e-406f-8ca3-043febca5e8e` reached SUCCESS.
- Production build, lint and type checks passed; independent image/source reviewer passed.
- Rendered product checks covered narrow phone and desktop widths. Switching to Marble removed the Slate scene.
- Live Slate, Marble and guide routes returned 200 with the image present only in the intended placements. The live guide image loaded at 272 × 181 CSS pixels on a 320px page without horizontal overflow; desktop rendering retained full framing and its caption.
