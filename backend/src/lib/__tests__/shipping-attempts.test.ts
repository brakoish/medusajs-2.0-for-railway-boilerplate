jest.mock("pg", () => {
  const { PGlite } = require("@electric-sql/pglite")
  const database = new PGlite()
  return {
    closeTestDatabase: () => database.close(),
    Pool: class {
      async query(sql: string, params?: unknown[]) {
        const result = await database.query(sql, params)
        return { rows: result.rows, rowCount: result.affectedRows }
      }
      async end() {
        /* Keep the database alive to simulate a process restart. */
      }
    },
  }
})

import {
  claimShippingAttempt,
  recordShippingAttempt,
  shippingAttempts,
  closeShippingAttempts,
  allowFailedShippingRetry,
} from "../shipping-attempts"

beforeAll(() => {
  process.env.DATABASE_URL = "postgres://unused-isolated-test"
})
afterAll(async () => {
  await closeShippingAttempts()
  await (require("pg") as any).closeTestDatabase()
})

test("PostgreSQL allows exactly one reservation for concurrent purchase attempts", async () => {
  const outcomes = await Promise.allSettled(
    Array.from({ length: 8 }, () =>
      claimShippingAttempt("order_race", "ful_race"),
    ),
  )
  expect(
    outcomes.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(1)
  expect(
    outcomes.filter((result) => result.status === "rejected"),
  ).toHaveLength(7)
})

test("unknown purchase outcome stays blocked across a connection restart", async () => {
  await claimShippingAttempt("order_unknown", "ful_unknown")
  await recordShippingAttempt("order_unknown", "needs_attention", {
    error: "Response lost",
    transaction_id: "tx_1",
  })
  await closeShippingAttempts()
  await expect(
    claimShippingAttempt("order_unknown", "ful_retry"),
  ).rejects.toThrow("already exists")
  const [attempt] = await shippingAttempts(["order_unknown"])
  expect(attempt).toMatchObject({
    state: "needs_attention",
    fulfillment_id: "ful_unknown",
    details: { transaction_id: "tx_1" },
  })
})

test("updating batch progress retains the original transaction evidence", async () => {
  await recordShippingAttempt("order_unknown", "processing", {
    batch_id: "batch_1",
  })
  const [attempt] = await shippingAttempts(["order_unknown"])
  expect(attempt.details).toMatchObject({
    batch_id: "batch_1",
    transaction_id: "tx_1",
    error: "Response lost",
  })
})

test("a verified failed purchase can be retried once and retains its history", async () => {
  await claimShippingAttempt("order_retry", "ful_failed")
  await recordShippingAttempt("order_retry", "needs_attention", {
    transaction_id: "tx_failed", error: "UPS account not registered",
  })
  expect(await allowFailedShippingRetry("order_retry", {
    object_id: "tx_failed", metadata: "ful_failed", status: "ERROR", rate: "rate_old",
  })).toBe(true)
  const results = await Promise.allSettled(Array.from({ length: 8 }, () =>
    claimShippingAttempt("order_retry", "ful_new"),
  ))
  expect(results.filter(r => r.status === "fulfilled")).toHaveLength(1)
  const [attempt] = await shippingAttempts(["order_retry"])
  expect(attempt).toMatchObject({
    state: "processing", fulfillment_id: "ful_new",
    details: { previous_attempts: [{ transaction_id: "tx_failed", error: "UPS account not registered" }] },
  })
  expect(attempt.details.transaction_id).toBeUndefined()
  expect(await allowFailedShippingRetry("order_retry", {
    object_id: "tx_failed", metadata: "ful_failed", status: "ERROR", rate: "rate_old",
  })).toBe(false)
})

test.each([
  { status: "SUCCESS" }, { status: "WAITING" }, { status: "QUEUED" },
  { status: "REFUNDED" }, { label_url: "https://label.test" },
  { tracking_number: "123" }, { object_id: "unrelated" },
  { metadata: "unrelated" }, { metadata: undefined },
])("keeps unsafe or unrelated transaction outcomes blocked: %j", async (override) => {
  const orderId = `order_unsafe_${JSON.stringify(override)}`
  await claimShippingAttempt(orderId, "ful_unsafe")
  await recordShippingAttempt(orderId, "needs_attention", { transaction_id: "tx_unsafe" })
  expect(await allowFailedShippingRetry(orderId, {
    object_id: "tx_unsafe", metadata: "ful_unsafe", status: "ERROR", rate: "rate_1",
    ...override,
  } as any)).toBe(false)
})

test("a batch reservation cannot be released as a single-label failure", async () => {
  expect(await allowFailedShippingRetry("order_unknown", {
    object_id: "tx_1", metadata: "ful_unknown", status: "ERROR", rate: "rate_1",
  })).toBe(false)
})
