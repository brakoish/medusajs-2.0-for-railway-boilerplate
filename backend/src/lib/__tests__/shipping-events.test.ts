jest.mock("@medusajs/framework/utils", () => ({
  Modules: {
    FULFILLMENT: "fulfillment",
    ORDER: "order",
    NOTIFICATION: "notification",
  },
}))
const mockDeliver = jest.fn()
jest.mock("@medusajs/medusa/core-flows", () => ({
  markFulfillmentAsDeliveredWorkflow: () => ({ run: mockDeliver }),
}))
jest.mock("../shipping-attempts", () => ({
  withShippingLock: async (_key: string, work: () => Promise<unknown>) =>
    work(),
}))
jest.mock("../email-config", () => ({
  getEmailConfig: async () => ({ subject: "Shipped", preview: "On its way" }),
}))
jest.mock("../../modules/email-notifications/templates", () => ({
  EmailTemplates: { ORDER_SHIPPED: "order-shipped" },
}))
jest.mock("../../modules/shippo/client", () => ({
  ShippoClient: jest
    .fn()
    .mockImplementation(() => ({ registerTracking: jest.fn() })),
}))

import { updateFulfillmentFromTransaction } from "../shippo-sync"
import { sendTrackingEmailForFulfillment } from "../tracking-email"
import { POST } from "../../api/hooks/shippo/[secret]/route"

function setup(initial: Record<string, any> = {}) {
  let fulfillment: any = {
    id: "ful_1",
    data: { order_id: "order_1", tracking_number: "123", ...initial },
  }
  const updateFulfillment = jest.fn(async (_id, update) => {
    fulfillment = { ...fulfillment, ...update }
    return fulfillment
  })
  const createNotifications = jest.fn().mockResolvedValue({ status: "success" })
  const listNotifications = jest.fn().mockResolvedValue([])
  const services: any = {
    fulfillment: {
      retrieveFulfillment: async () => fulfillment,
      updateFulfillment,
    },
    notification: { createNotifications, listNotifications },
    order: {
      retrieveOrder: async () => ({
        id: "order_1",
        email: "test@example.com",
        shipping_address: { id: "addr_1" },
      }),
      orderAddressService_: { retrieve: async () => ({ id: "addr_1" }) },
    },
    logger: { info: jest.fn(), warn: jest.fn() },
  }
  const scope: any = { resolve: (key: string) => services[key] }
  const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() }
  const req = (body: any) =>
    ({ scope, body, params: { secret: "test-secret" } }) as any
  return {
    scope,
    req,
    res,
    updateFulfillment,
    createNotifications,
    listNotifications,
    get: () => fulfillment,
  }
}

beforeEach(() => {
  mockDeliver.mockReset()
  process.env.SHIPPO_WEBHOOK_SECRET = "test-secret"
  process.env.SHIPPO_API_TOKEN = "test-only"
})

test("label purchase attaches the label without marking shipped or emailing", async () => {
  const ctx = setup()
  await updateFulfillmentFromTransaction(ctx.req({}), {
    object_id: "tx_1",
    status: "SUCCESS",
    metadata: "ful_1",
    tracking_number: "123",
    label_url: "https://label.test",
  })
  expect(ctx.get().data.label_url).toBe("https://label.test")
  expect(ctx.get().shipped_at).toBeUndefined()
  expect(ctx.createNotifications).not.toHaveBeenCalled()
})

test("pre-transit never sends the out-the-door email", async () => {
  const ctx = setup({ tracking_status: { status: "PRE_TRANSIT" } })
  expect(await sendTrackingEmailForFulfillment(ctx.scope, "ful_1")).toBe(
    "waiting_for_carrier",
  )
  expect(ctx.createNotifications).not.toHaveBeenCalled()
})

test("carrier possession marks shipped and duplicate scans send one notification", async () => {
  const ctx = setup()
  const body = {
    event: "track_updated",
    data: {
      metadata: "ful_1",
      carrier: "usps",
      tracking_number: "123",
      tracking_status: {
        status: "TRANSIT",
        status_date: "2026-09-15T12:00:00Z",
      },
    },
  }
  await POST(ctx.req(body), ctx.res)
  await POST(ctx.req(body), ctx.res)
  expect(ctx.get().shipped_at).toBeInstanceOf(Date)
  expect(ctx.createNotifications).toHaveBeenCalledTimes(1)
  expect(ctx.createNotifications.mock.calls[0][0]).toMatchObject({
    idempotency_key: "dabpal-shipped:ful_1",
    resource_id: "ful_1",
  })
  expect(ctx.get().data.tracking_email_sent_at).toBeTruthy()
})

test("late pre-transit updates cannot move a shipment backward", async () => {
  const ctx = setup({
    tracking_email_sent_at: "2026-09-15T12:00:00Z",
    tracking_status: { status: "TRANSIT", status_date: "2026-09-15T12:00:00Z" },
  })
  await POST(
    ctx.req({
      event: "track_updated",
      data: {
        metadata: "ful_1",
        tracking_status: {
          status: "PRE_TRANSIT",
          status_date: "2026-09-14T12:00:00Z",
        },
      },
    }),
    ctx.res,
  )
  expect(ctx.get().data.tracking_status.status).toBe("TRANSIT")
})

test("an uncertain email response is surfaced and never blindly sent again", async () => {
  const ctx = setup({ tracking_status: { status: "TRANSIT" } })
  ctx.createNotifications.mockRejectedValueOnce(new Error("Response lost"))
  await expect(
    sendTrackingEmailForFulfillment(ctx.scope, "ful_1"),
  ).rejects.toThrow("Response lost")
  expect(await sendTrackingEmailForFulfillment(ctx.scope, "ful_1")).toBe(
    "needs_attention",
  )
  expect(ctx.createNotifications).toHaveBeenCalledTimes(1)
  expect(ctx.get().data.tracking_email_error).toContain("Email Studio")
})

test("notification reconciliation recovers a successful send after metadata-write loss", async () => {
  const ctx = setup({
    tracking_status: { status: "TRANSIT" },
    tracking_email_started_at: "2026-09-15",
  })
  ctx.listNotifications.mockResolvedValue([{ status: "success" }])
  expect(await sendTrackingEmailForFulfillment(ctx.scope, "ful_1")).toBe(
    "already_sent",
  )
  expect(ctx.createNotifications).not.toHaveBeenCalled()
})

test("sample webhooks never alter orders or send notifications", async () => {
  const ctx = setup()
  await POST(
    ctx.req({
      event: "track_updated",
      test: true,
      data: { metadata: "ful_1", tracking_status: { status: "TRANSIT" } },
    }),
    ctx.res,
  )
  expect(ctx.updateFulfillment).not.toHaveBeenCalled()
  expect(ctx.createNotifications).not.toHaveBeenCalled()
})

test("pending notifications are not stamped as sent", async () => {
  const ctx = setup({ tracking_status: { status: "TRANSIT" } })
  ctx.createNotifications.mockResolvedValue(undefined)
  expect(await sendTrackingEmailForFulfillment(ctx.scope, "ful_1")).toBe(
    "needs_attention",
  )
  expect(ctx.get().data.tracking_email_sent_at).toBeUndefined()
  expect(await sendTrackingEmailForFulfillment(ctx.scope, "ful_1")).toBe(
    "needs_attention",
  )
  expect(ctx.createNotifications).toHaveBeenCalledTimes(1)
})

test("an old delivery event cannot overwrite a newer return", async () => {
  const ctx = setup({
    tracking_status: {
      status: "RETURNED",
      status_date: "2026-09-15T12:00:00Z",
    },
  })
  await POST(
    ctx.req({
      event: "track_updated",
      data: {
        metadata: "ful_1",
        tracking_status: {
          status: "DELIVERED",
          status_date: "2026-09-14T12:00:00Z",
        },
      },
    }),
    ctx.res,
  )
  expect(ctx.get().data.tracking_status.status).toBe("RETURNED")
  expect(mockDeliver).not.toHaveBeenCalled()
  expect(ctx.createNotifications).not.toHaveBeenCalled()
})

test("delivery workflow failures request a webhook retry", async () => {
  const ctx = setup({ tracking_email_sent_at: "2026-09-15" })
  mockDeliver.mockRejectedValueOnce(new Error("Database unavailable"))
  await POST(
    ctx.req({
      event: "track_updated",
      data: { metadata: "ful_1", tracking_status: { status: "DELIVERED" } },
    }),
    ctx.res,
  )
  expect(ctx.res.status).toHaveBeenCalledWith(503)
})
