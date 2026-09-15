jest.mock("@medusajs/framework/utils", () => ({
  AbstractFulfillmentProviderService: class {},
  MedusaError: class extends Error {
    static Types = { INVALID_DATA: "invalid", UNEXPECTED_STATE: "unexpected" }
    constructor(_type: string, message: string) {
      super(message)
    }
  },
}))
jest.mock("../shipping-attempts", () => ({
  claimShippingAttempt: jest.fn(),
  recordShippingAttempt: jest.fn(),
}))
import ShippoProvider from "../../modules/shippo/service"
import { preSelectedRates } from "../../modules/shippo/pre-selected-rates"
import {
  claimShippingAttempt,
  recordShippingAttempt,
} from "../shipping-attempts"

function setup() {
  const provider = new ShippoProvider(
    { logger: { warn: jest.fn() } as any },
    { api_token: "test" },
  )
  const client = { createTransaction: jest.fn(), registerTracking: jest.fn() }
  ;(provider as any).client = client
  preSelectedRates.set("order_1", "rate_1")
  return { provider, client }
}
beforeEach(() => {
  jest.mocked(claimShippingAttempt).mockReset()
  preSelectedRates.clear()
})

test("a duplicate request never reaches label purchase", async () => {
  const { provider, client } = setup()
  jest
    .mocked(claimShippingAttempt)
    .mockRejectedValueOnce(new Error("Purchase already exists"))
  await expect(
    provider.createFulfillment({}, [], { id: "order_1" }, { id: "ful_1" }),
  ).rejects.toThrow("already exists")
  expect(client.createTransaction).not.toHaveBeenCalled()
})

test("a lost purchase response becomes needs-attention and is not retried", async () => {
  const { provider, client } = setup()
  client.createTransaction.mockRejectedValue(new Error("Response lost"))
  await expect(
    provider.createFulfillment({}, [], { id: "order_1" }, { id: "ful_1" }),
  ).rejects.toThrow("Response lost")
  expect(client.createTransaction).toHaveBeenCalledTimes(1)
  expect(recordShippingAttempt).toHaveBeenCalledWith(
    "order_1",
    "needs_attention",
    { error: "Response lost" },
  )
})

test("successful labels retain order identity and purchase evidence", async () => {
  const { provider, client } = setup()
  client.createTransaction.mockResolvedValue({
    object_id: "tx_1",
    status: "SUCCESS",
    label_url: "https://labels.test/1",
    tracking_number: "123",
  })
  const result = await provider.createFulfillment(
    {},
    [],
    { id: "order_1" },
    { id: "ful_1" },
  )
  expect(result.data).toMatchObject({
    order_id: "order_1",
    transaction_id: "tx_1",
  })
  expect(recordShippingAttempt).toHaveBeenCalledWith(
    "order_1",
    "label_ready",
    expect.objectContaining({ transaction_id: "tx_1" }),
  )
})

test("batch reservations create pending fulfillments without purchasing individually", async () => {
  const { provider, client } = setup()
  preSelectedRates.set("order_1", {
    mode: "batch_pending",
    rate_object_id: "rate_1",
    carrier_account: "ca_1",
    servicelevel_token: "usps_ground",
  })
  const result = await provider.createFulfillment(
    {},
    [],
    { id: "order_1" },
    { id: "ful_1" },
  )
  expect(client.createTransaction).not.toHaveBeenCalled()
  expect(result.data.batch_status).toMatchObject({ status: "PENDING" })
})
