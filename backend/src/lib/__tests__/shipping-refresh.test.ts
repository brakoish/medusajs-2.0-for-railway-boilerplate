const mockQueue = jest.fn()
const mockGetBatch = jest.fn()
const mockGetTransaction = jest.fn()
const mockBatchSync = jest.fn()
const mockTransactionSync = jest.fn()
const mockPurchase = jest.fn()
jest.mock("../shipping-queue", () => ({
  shippingQueue: (...args: unknown[]) => mockQueue(...args),
}))
jest.mock("../shippo-sync", () => ({
  updateFromBatchShipment: (...args: unknown[]) => mockBatchSync(...args),
  updateFulfillmentFromTransaction: (...args: unknown[]) =>
    mockTransactionSync(...args),
}))
jest.mock("../../modules/shippo/client", () => ({
  ShippoClient: jest
    .fn()
    .mockImplementation(() => ({
      getBatch: mockGetBatch,
      getTransaction: mockGetTransaction,
      purchaseBatch: mockPurchase,
      createTransaction: mockPurchase,
    })),
}))
import { POST } from "../../api/admin/orders/[id]/shipping/refresh/route"

const request: any = { params: { id: "order_1" }, scope: {} }
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() })
beforeEach(() => {
  jest.clearAllMocks()
  process.env.SHIPPO_API_TOKEN = "test-only"
})

test("refresh pages through a batch and updates only this order's fulfillment", async () => {
  mockQueue.mockResolvedValue({
    orders: [],
    progress: [{ fulfillment_id: "ful_1", batch_id: "batch_1" }],
  })
  mockGetBatch
    .mockResolvedValueOnce({
      batch_shipments: { results: [{ metadata: "ful_other" }], next: "page-2" },
    })
    .mockResolvedValueOnce({
      label_url: ["sample-label"],
      batch_shipments: { results: [{ metadata: "ful_1" }], next: null },
    })
  await POST(request, response() as any)
  expect(mockGetBatch).toHaveBeenNthCalledWith(2, "batch_1", {
    results: 100,
    page: 2,
  })
  expect(mockBatchSync).toHaveBeenCalledTimes(1)
  expect(mockBatchSync.mock.calls[0][3].metadata).toBe("ful_1")
  expect(mockPurchase).not.toHaveBeenCalled()
})

test("refresh reconciles an existing individual transaction without a purchase", async () => {
  mockQueue.mockResolvedValue({
    orders: [],
    progress: [{ fulfillment_id: "ful_1", transaction_id: "tx_1" }],
  })
  mockGetTransaction.mockResolvedValue({ object_id: "tx_1", status: "SUCCESS" })
  await POST(request, response() as any)
  expect(mockTransactionSync).toHaveBeenCalledWith(request, {
    object_id: "tx_1",
    status: "SUCCESS",
    metadata: "ful_1",
  })
  expect(mockPurchase).not.toHaveBeenCalled()
})

test("refresh failures remain explicit and never fall back to buying", async () => {
  mockQueue.mockResolvedValue({
    orders: [],
    progress: [{ fulfillment_id: "ful_1", transaction_id: "tx_1" }],
  })
  mockGetTransaction.mockRejectedValueOnce(new Error("Shippo unavailable"))
  const res = response()
  await POST(request, res as any)
  expect(res.status).toHaveBeenCalledWith(502)
  expect(res.json.mock.calls[0][0].error).toContain(
    "No new label was purchased",
  )
  expect(mockPurchase).not.toHaveBeenCalled()
})
