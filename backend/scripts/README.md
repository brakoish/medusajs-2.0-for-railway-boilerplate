# Dab Pal catalog consolidation

These scripts are manual maintenance tools. They do not run during build, startup or deployment.

The migration keeps the existing Slate product as `dab-pal-standard`, gives it Finish and Pack Size options, and moves the six current variants under it. Variant IDs, SKUs, prices, inventory associations and promotion associations remain unchanged. The old Marble product becomes a retained draft. Historical orders are never rewritten.

## Verification and release order

1. Set `DATABASE_URL` securely for the intended database. Never print or commit its value.
2. Take a catalog-only snapshot with `node scripts/run-catalog-migration.cjs snapshot <new-backup-directory>`.
3. Run `node scripts/check-catalog-migration.cjs <new-backup-directory>/catalog-snapshot.json`. This uses isolated PGlite, including the catalog's unique indexes and internal foreign keys, and verifies migration, transaction rollback, idempotence and post-commit restore. Foreign keys to tables outside the catalog clone are not simulated.
4. Deploy the compatible backend and storefront first. The storefront must resolve `dab-pal-standard` and redirect its generic product URL to `/store` before migration.
5. Run `node scripts/run-catalog-migration.cjs apply <another-new-backup-directory>` against the intended database. The transaction writes `before.json` and `after.json` and verifies protected associations before committing. A failure rolls back. Use a fresh directory for every attempt.
6. Verify the live catalog has one standard product with six priced, purchasable variants; old finish links still select the correct finish; each variant adds/removes in a test cart; admin order history and fulfillment remain readable. Do not submit a payment or order as part of this check.

## Recovery

For a just-applied migration, `node scripts/run-catalog-migration.cjs restore <apply-backup-directory>` restores only changed fields and option links in a transaction. It rejects subsequent edits to the affected fields instead of overwriting them. Investigate a conflict rather than forcing restore. Retain both snapshot files privately as operational backups.

The custom-product setup job must remain disabled after initial setup (`SETUP_CUSTOM_DAB_PAL_PRODUCT=0`). Availability and printable color choices are managed in Product Studio. Standard prices and stock remain in the native Medusa catalog.

## Isolated admin review

From the repository root, generate fixture styles:

```
node storefront/node_modules/tailwindcss/lib/cli.js -c backend/dev/operations-preview/tailwind.config.cjs -i backend/dev/operations-preview/input.css -o backend/dev/operations-preview/styles.css
```

From `backend`, start `node node_modules/vite/bin/vite.js --config dev/operations-preview/vite.config.ts` and open `http://127.0.0.1:4182/app/dab-pal`. These sample records are in memory and never connect to production services. Native catalog/order/shipping/email destinations and upload storage are not simulated.

The safe backend suite is `node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.shipping.config.cjs --runInBand`. Do not use the general integration harness against a production database.
