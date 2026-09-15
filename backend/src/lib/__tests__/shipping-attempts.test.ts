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
