# Order shipping workflow

## Operator flow

1. Open **Bulk Fulfill**, select eligible orders, and get rates. An individual order has the same purchase flow through **Shipping Rates**.
2. Buy labels once. The order moves to **Shipping progress**, including when Shippo is still processing or the response is uncertain.
3. When **Ready to print** appears, print the individual label or available batch PDF and pack the parcel. A label is not proof that the carrier has it.
4. Carrier scans move the parcel to **In transit** and **Delivered**. The shipping email is triggered after carrier possession, using one shared sending policy.
5. For **Needs attention**, use **Refresh from Shippo** to retrieve the existing transaction or batch. Refresh does not purchase a label or send a customer email. If no purchase reference is available, review Shippo before doing anything else.

Both screens use the same progress calculation. Historical `shipped_at` values alone are not treated as carrier scans. Failed, canceled, or refunded individual labels are not offered for printing. A batch PDF can contain other labels from that batch; check individual shipment status before using it.

## Purchase and notification protection

- `dabpal_shipping_attempt` stores one durable reservation per order before the provider starts work. It survives workflow rollback, a process restart, and an unknown Shippo response. The application creates this table idempotently using `DATABASE_URL`; its database role needs table-creation permission on first use.
- Existing fulfillments and reservations keep an order out of the purchase queue. There is deliberately no automatic release or retry purchase. Replacement labels, split shipments, and clearing a failed reservation require a separately reviewed recovery action; do not delete reservations without reconciling Shippo and Medusa first.
- Fulfillment updates and notification dispatch use PostgreSQL advisory locks. Nested updates reuse a connection. A competing webhook gets a retry response instead of overwriting a concurrent update.
- Shipping email attempts use a stable notification idempotency key and a persisted start marker. A lost response is reconciled against Medusa's notification record. Unconfirmed delivery is shown for review in Email Studio and is not blindly resent. A successful provider response is not proof of inbox delivery.
- Older tracking events cannot regress a newer carrier status or invoke the delivery workflow. Failed webhook mutations return a retryable response.
- Shippo refresh can register tracking for an existing transaction; it never creates or purchases one.

## Verification

From `backend`, using the repository's pnpm 9.10.0:

```sh
pnpm test:shipping
pnpm exec tsc --noEmit --incremental false
pnpm exec medusa build
pnpm preview:shipping
```

The preview at `http://localhost:4173` renders the real admin components with local sample responses. It has reset and lost-response scenarios, and no production connections, label charges, or email sends. It is a UI walkthrough, not a full Medusa integration environment.

The shipping suite covers the real reservation SQL with isolated PGlite PostgreSQL, duplicate purchase protection, uncertain outcomes, batch validation, reconciliation, queue visibility, notification idempotency, and webhook ordering. Service tests use doubles for Medusa and Shippo. Advisory-lock connection reuse is tested with a pool double, not a multi-process PostgreSQL deployment.

Before production rollout, verify authenticated admin loading against a staging Medusa database and exercise Shippo test-mode callbacks there. This local change has not bought a live label, sent a live customer email, or validated real carrier delivery. The queue currently pages through order history and polls every five seconds; larger order volumes may need server-side filtering or a slower refresh interval.

Deploy the backend and its bundled admin together. Preserve the reservation table on rollback: the old code does not enforce it, so do not resume purchases through the old version until uncertain attempts have been reviewed.
