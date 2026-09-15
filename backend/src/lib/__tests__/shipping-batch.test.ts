const mockCreateBatch = jest.fn()
const mockGetBatch = jest.fn()
const mockPurchaseBatch = jest.fn()
const mockRun = jest.fn()
jest.mock("@medusajs/framework/utils", () => ({
  Modules: { FULFILLMENT: "fulfillment" },
}))
jest.mock("@medusajs/medusa/core-flows", () => ({
  createOrderFulfillmentWorkflow: () => ({ run: mockRun }),
}))
jest.mock("../../modules/shippo/client", () => ({
  ShippoClient: jest
    .fn()
    .mockImplementation(() => ({
      createBatch: mockCreateBatch,
      getBatch: mockGetBatch,
      purchaseBatch: mockPurchaseBatch,
    })),
}))
jest.mock("../shipping-attempts", () => ({
  recordShippingAttempt: jest.fn(),
  withShippingLock: async (_key: string, work: () => Promise<unknown>) =>
    work(),
}))
import { POST } from "../../api/admin/bulk-fulfill/execute/route"

function setup() {
  let fulfillment: any = {
    id: "ful_1",
    data: { order_id: "order_1" },
    created_at: "2026-09-15",
  }
  const order = {
    id: "order_1",
    display_id: 1,
    status: "pending",
    items: [{ id: "item_1", quantity: 1, variant: { weight: 30 } }],
    shipping_address: {
      address_1: "1 Test St",
      city: "Test",
      province: "NY",
      postal_code: "10001",
    },
  }
  const graph = jest.fn(async ({ fields }) => ({
    data: fields.includes("fulfillments.data")
      ? [{ id: "order_1", fulfillments: [fulfillment] }]
      : fields.includes("fulfillments.id") ? [{ id: "order_1", fulfillments: [] }] : [order],
  }))
  const service = {
    retrieveFulfillment: async () => fulfillment,
    updateFulfillment: jest.fn(async (_id, update) => {
      fulfillment = { ...fulfillment, ...update }
    }),
  }
  const req: any = {
    body: {
      items: [
        {
          order_id: "order_1",
          rate_object_id: "rate_1",
          carrier_account: "ca_1",
          servicelevel_token: "usps_ground",
        },
      ],
    },
    scope: {
      resolve: (key: string) => (key === "query" ? { graph } : service),
    },
  }
  const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() }
  return { req, res, service, order, get: () => fulfillment }
}
beforeEach(() => {
  process.env.SHIPPO_API_TOKEN = "test"
  mockCreateBatch
    .mockReset()
    .mockResolvedValue({ object_id: "batch_1", status: "VALIDATING" })
  mockGetBatch
    .mockReset()
    .mockResolvedValue({ object_id: "batch_1", status: "VALID" })
  mockPurchaseBatch
    .mockReset()
    .mockResolvedValue({ object_id: "batch_1", status: "PURCHASING" })
  mockRun.mockReset().mockResolvedValue({})
})

test("invalid batches are red/actionable, never reported successful or purchased", async () => {
  const ctx = setup()
  mockGetBatch.mockResolvedValue({ object_id: "batch_1", status: "INVALID" })
  await POST(ctx.req, ctx.res)
  expect(mockPurchaseBatch).not.toHaveBeenCalled()
  expect(ctx.res.status).toHaveBeenCalledWith(422)
  expect(ctx.res.json.mock.calls[0][0].results[0]).toMatchObject({
    success: false,
    status: "INVALID",
  })
  expect(ctx.get().data.batch_status.status).toBe("INVALID")
})

test("slow validation is distinguished from invalid data and never auto-repurchased", async () => {
  jest.useFakeTimers()
  try {
    const ctx = setup()
    mockGetBatch.mockResolvedValue({
      object_id: "batch_1",
      status: "VALIDATING",
    })
    const request = POST(ctx.req, ctx.res)
    await jest.runAllTimersAsync()
    await request
    expect(mockPurchaseBatch).not.toHaveBeenCalled()
    expect(ctx.get().data.batch_status.status).toBe("VALIDATION_PENDING")
    expect(ctx.res.json.mock.calls[0][0].results[0].success).toBe(false)
  } finally {
    jest.useRealTimers()
  }
})

test("a lost batch purchase response preserves the batch reference and requires review", async () => {
  const ctx = setup()
  mockPurchaseBatch.mockRejectedValue(new Error("Response lost"))
  await POST(ctx.req, ctx.res)
  expect(mockPurchaseBatch).toHaveBeenCalledTimes(1)
  expect(ctx.res.status).toHaveBeenCalledWith(502)
  expect(ctx.get().data).toMatchObject({
    batch_id: "batch_1",
    batch_status: { status: "REVIEW_REQUIRED" },
  })
})

test("purchasing remains pending until label data arrives", async () => {
  const ctx = setup()
  await POST(ctx.req, ctx.res)
  expect(ctx.res.status).toHaveBeenCalledWith(202)
  expect(ctx.get().data.batch_status.status).toBe("PURCHASING")
  expect(ctx.get().shipped_at).toBeUndefined()
})

test("duplicate orders and incomplete addresses never create paid work", async () => {
  const duplicate = setup()
  duplicate.req.body.items.push(duplicate.req.body.items[0])
  await POST(duplicate.req, duplicate.res)
  expect(duplicate.res.status).toHaveBeenCalledWith(400)
  const missing = setup()
  missing.order.shipping_address.address_1 = ""
  await POST(missing.req, missing.res)
  expect(mockRun).not.toHaveBeenCalled()
  expect(mockCreateBatch).not.toHaveBeenCalled()
})
