const mockQuery = jest.fn().mockResolvedValue({ rows: [{ locked: true }] })
const mockRelease = jest.fn()
const mockConnect = jest.fn(async () => ({
  query: mockQuery,
  release: mockRelease,
}))
jest.mock("pg", () => ({
  Pool: jest
    .fn()
    .mockImplementation(() => ({
      query: mockQuery,
      connect: mockConnect,
      end: jest.fn(),
    })),
}))
import {
  withShippingLock,
  recordShippingAttempt,
  closeShippingAttempts,
} from "../shipping-attempts"

beforeEach(() => {
  jest.clearAllMocks()
  process.env.DATABASE_URL = "postgres://test"
})
afterEach(closeShippingAttempts)

test("nested email and fulfillment locks reuse one connection instead of exhausting the pool", async () => {
  await withShippingLock("email:ful_1", () =>
    withShippingLock("fulfillment:ful_1", () =>
      recordShippingAttempt("order_1", "processing", {}),
    ),
  )
  expect(mockConnect).toHaveBeenCalledTimes(1)
  expect(mockRelease).toHaveBeenCalledTimes(1)
  expect(
    mockQuery.mock.calls.filter(([sql]) => sql.includes("pg_advisory_unlock")),
  ).toHaveLength(2)
})

test("a failed protected update still releases its lock and connection", async () => {
  await expect(
    withShippingLock("fulfillment:ful_1", async () => {
      throw new Error("Update failed")
    }),
  ).rejects.toThrow("Update failed")
  expect(mockQuery).toHaveBeenCalledWith(
    expect.stringContaining("pg_advisory_unlock"),
    ["fulfillment:ful_1"],
  )
  expect(mockRelease).toHaveBeenCalledTimes(1)
})
