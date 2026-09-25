# Purchase measurement repair audit

Checked September 25, 2026 against local source and installed Medusa types. The initial audit was read-only; the minimal correction below was subsequently approved and implemented locally. No live orders, payment mutations, or database calls were made.

## Recommended smallest correction

Rename the browser `purchase` event to `order_confirmation_viewed` and stop attaching `value` and `currency` to that event. Keep `begin_checkout` and its amounts unchanged. Treat the new event as a consented confirmation-view attempt, suppressed on repeated renders in the same tab. It is not a paid-order count or revenue metric.

Keep Medusa payment records as the source for captured payments, refunds, and net payments, reconciled with processor records. Existing admin Reports already sums actual captures/refunds by currency. Do not add a speculative server purchase pipeline to this correction.

## Evidence from the pre-repair source

- `storefront/src/modules/order/templates/order-completed-template.tsx:25` mounts `CommerceEvent` with `purchase` and `order.total` whenever a retrieved order is rendered, without checking payment status.
- `storefront/src/modules/common/components/commerce-event/index.tsx:13` gates analytics by consent, deduplicates using event plus order/cart ID in tab session storage, writes `sent` before requesting tracking, and sends only value/currency. A fresh tab/session can request another event; a blocked or failed request can still leave the local marker.
- `storefront/src/lib/util/analytics.ts:23` returns no delivery receipt. Consent is rechecked after loading the SDK and failures are swallowed. Moving the local marker after `await track()` would not prove ingestion.
- `storefront/src/lib/util/analytics-properties.ts:14` preserves value/currency but removes order IDs and session IDs. Preserving this privacy boundary means current events cannot be reconciled to unique paid orders in PostHog.
- `storefront/src/lib/data/orders.ts:12` explicitly requests `+payment_status` and payment collections/payments. This information is available to the confirmation template; the defect is not an absence of a typed status.
- Installed `@medusajs/types` `dist/http/order/store/entities.d.ts:6` makes `StoreOrder` inherit `BaseOrder`; `dist/http/order/common.d.ts:746` declares `payment_status`. Installed `dist/order/common.d.ts:1710` defines `not_paid`, `awaiting`, `authorized`, `partially_authorized`, `captured`, `partially_captured`, `partially_refunded`, `refunded`, `canceled`, and `requires_action`.
- Installed payment types expose collection/payment captured and refunded amounts. `backend/src/lib/dabpal-operations.ts:19` already uses collection amounts and handles partial capture, refund, and no-payment-due states. Its summary sums captured and refunded payments by currency. `backend/src/admin/routes/analytics/page.tsx:18` labels these all-time amounts including shipping/tax, not profit.

A `payment_status === "captured"` guard would avoid some unpaid confirmations, but still miss later capture without another view, recount across sessions, miss consent/blocker traffic, and require refund handling. It cannot justify retaining the label `purchase` as globally unique paid-order measurement. Order status and order total are also not substitutes for captured payment records.

## Approved implementation scope

1. Replace `purchase` with `order_confirmation_viewed` in the shared event type and confirmation template.
2. Make value/currency optional for the view-only case, and pass no financial properties to `track` for confirmation views. Preserve checkout event values and local ID-only suppression.
3. Correct the local marker wording from successful delivery to attempted tracking; do not introduce a retry/delivery state machine.
4. Add focused isolated coverage to the existing analytics check script, and update `docs/affiliate-measurement.md` to describe the repaired event and its limits.
5. Exclude historical `purchase` from paid-order/revenue dashboards. Preserve historical data and label its legacy meaning; record the actual deployment cutoff separately after deployment.

No change is needed to payment handling, order retrieval, customer-visible confirmation copy, privacy settings, or backend subscribers for this correction.

## Verification

Baseline run: `node scripts/check-affiliate-analytics.cjs` from `storefront` passed all 21 retained assertions. A separate in-memory mock execution of the current CommerceEvent reproduced the misleading event name and verified same-tab suppression, fresh-session recount, and consent suppression. No network requests occurred.

The repair added these regression checks using fake orders/effects/storage/SDK:

- Render the real confirmation template with unpaid/authorized/captured/refunded fixture statuses: its analytics child always means confirmation viewed, never purchase, and has no amount/currency props.
- Execute the real event component: confirmation calls tracking without financial data or order ID; checkout still calls `begin_checkout` with value/currency.
- Repeat the same effect/session and assert one attempt; reset session storage and assert a second view attempt, explicitly documenting the metric's scope.
- Deny consent or make session storage unavailable and assert no attempt/no thrown error.
- Keep the existing consent, privacy, route-redaction, and affiliate assertions passing.

These tests prove the source contract and privacy boundary. They do not prove real SDK ingestion, paid-order uniqueness, or production deployment. Public-route pageview/affiliate receipt can be checked independently in PostHog without placing a live order.

Initial purchase-label repair result: all 30 retained assertions passed. The subsequent ingestion correction below brings the suite to 33. Deployment cutoff is pending the parent task's release verification; no PostHog settings or historical events were changed.

Read-only PostHog UI handoff was attempted, but the browser automation tool refused to bind the existing analytics tab because it belongs to the parent task's browser session. No account/project or actual receipt claim is made from this subtask; the parent task retains that verification.

## Ingestion correction: required SDK protocol fields

The parent task subsequently reported that the matching PostHog project had no events in the unfiltered seven-day Activity view, including after controlled public storefront navigation and an affiliate click. That observation alone does not establish a cause. An offline reproduction establishes a concrete defect in the current sanitizer:

1. Installed `posthog-js` version `1.373.3`, `lib/src/posthog-core.js:1084`, adds the public project routing token as `properties.token` in `calculateEventProperties`. At line 1170 it adds `$process_person_profile`, which is false under the existing `person_profiles: "never"` configuration.
2. `capture` applies `before_send` at line 1034, then queues that returned payload at lines 1042-1055. Our final property allowlist removed both fields.
3. `lib/src/request-queue.js:103` batches the already-filtered event objects. `lib/src/request.js:118` serializes request data without restoring those fields. `_send_request` in `posthog-core.js:747` adds request parameters/headers but does not restore a project token.
4. PostHog's [upstream fix discussion](https://github.com/PostHog/posthog-js/pull/3756) documents this exact mechanism: removing `properties.token` in `before_send` produces a payload ingestion rejects for lacking its project API key. The installed version has no required-token check in `_runBeforeSend`; its check only warns when all properties are absent.
5. The missing profile flag is a separate privacy defect, not the identified ingestion rejection. PostHog's [person-processing documentation](https://github.com/PostHog/posthog/blob/master/docs/published/handbook/engineering/person-processing.md) explains that explicit false bypasses person-profile processing; absent/true takes the person-processing branch. Preserving the existing SDK-generated false value maintains the intended behavior.

Smallest repair: add only `token` and `$process_person_profile` to the final allowlist. No SDK upgrade, new identifier, consent change, profile enablement, session tracking, or server ingestion path is required. Private application tokens such as password-reset tokens remain excluded; this exact `token` field is assigned by the SDK from its public project configuration before the filter runs.

Verification now executes the installed SDK's real `calculateEventProperties` and `capture`, the application's actual configured `before_send`, the SDK queue formatter and JSON serializer. The SDK is not initialized; persistence and queue are in-memory test doubles, a nonproduction fixture token is used, and transport throws if called. The retained regression initially failed because the serialized project token was undefined, then passed with the two-field repair. All **33 checks pass**, including false profile processing and continued private-property removal for pageview, guide-click and affiliate-click events. This is source/serialization proof; deployment and actual PostHog receipt remain a separate parent-task verification. No raw event API sends were used.
