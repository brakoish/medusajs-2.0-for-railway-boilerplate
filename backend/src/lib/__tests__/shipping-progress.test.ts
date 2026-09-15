import { shippingProgress, carrierHasPossession } from "../shipping-progress"
import { shippingQueue } from "../shipping-queue"
import { shippingAttempts } from "../shipping-attempts"

jest.mock("../shipping-attempts", () => ({
  shippingAttempts: jest.fn().mockResolvedValue([]),
}))

test.each([
  [
    { label_url: "https://labels.test/1", tracking_number: "123" },
    "label_ready",
  ],
  [{ batch_status: { status: "PURCHASING" } }, "processing"],
  [{ batch_status: { status: "INVALID" } }, "needs_attention"],
  [{ batch_status: { status: "TRANSACTION_FAILED" } }, "needs_attention"],
  [{ batch_status: { status: "REVIEW_REQUIRED" } }, "needs_attention"],
  [
    {
      label_url: "https://labels.test/1",
      batch_status: { status: "PURCHASING" },
    },
    "label_ready",
  ],
  [
    {
      label_url: "https://labels.test/1",
      tracking_status: { status: "PRE_TRANSIT" },
    },
    "label_ready",
  ],
  [{ tracking_status: { status: "TRANSIT" } }, "in_transit"],
  [{ tracking_status: { status: "DELIVERED" } }, "delivered"],
  [{ tracking_status: { status: "FAILURE" } }, "needs_attention"],
])("shipping progress follows actual evidence: %j", (data, stage) => {
  expect(
    shippingProgress({ id: "ful_1", data, shipped_at: "2026-01-01" }).stage,
  ).toBe(stage)
})

test("a refunded label cannot be printed", () => {
  const progress = shippingProgress({
    id: "ful_1",
    data: {
      label_url: "https://label.test",
      transaction_status: { status: "REFUNDED" },
    },
  })
  expect(progress.stage).toBe("needs_attention")
  expect(progress.label_url).toBeNull()
})

test("label creation and an ambiguous failure do not prove carrier possession", () => {
  expect(carrierHasPossession("PRE_TRANSIT")).toBe(false)
  expect(carrierHasPossession("FAILURE")).toBe(false)
  expect(carrierHasPossession("TRANSIT")).toBe(true)
})

test("an old pending purchase becomes actionable instead of spinning forever", () => {
  expect(
    shippingProgress({
      id: "ful_1",
      created_at: "2020-01-01",
      data: { batch_status: { status: "PURCHASING" } },
    }).stage,
  ).toBe("needs_attention")
})

test("queue retains failed and pending fulfillments but never offers to repurchase them", async () => {
  const ready = { id: "order_ready", items: [{ id: "item_1", quantity: 1 }] }
  const scope = {
    resolve: () => ({
      graph: async () => ({
        data: [
          ready,
          {
            id: "order_pending",
            items: [
              { id: "i2", quantity: 1, detail: { fulfilled_quantity: 1 } },
            ],
            fulfillments: [
              { id: "ful_2", data: { batch_status: { status: "PURCHASING" } } },
            ],
          },
          {
            id: "order_failed",
            fulfillments: [
              { id: "ful_3", data: { batch_status: { status: "INVALID" } } },
            ],
          },
        ],
      }),
    }),
  }
  const result = await shippingQueue(scope as any)
  expect(result.orders.map((o) => o.id)).toEqual(["order_ready"])
  expect(result.progress.map((p) => p.stage)).toEqual([
    "processing",
    "needs_attention",
  ])
})

test("a purchase survives workflow rollback and remains blocked after reload", async () => {
  jest
    .mocked(shippingAttempts)
    .mockResolvedValueOnce([
      {
        order_id: "order_1",
        fulfillment_id: "ful_missing",
        state: "needs_attention",
        details: { error: "Response lost" },
        updated_at: new Date(),
      },
    ])
  const scope = {
    resolve: () => ({
      graph: async () => ({
        data: [{ id: "order_1", items: [{ id: "i", quantity: 1 }] }],
      }),
    }),
  }
  const result = await shippingQueue(scope as any)
  expect(result.orders).toEqual([])
  expect(result.progress[0]).toMatchObject({
    stage: "needs_attention",
    message: "Response lost",
  })
})

test("queue includes unfinished work beyond the first page", async () => {
  const graph = jest
    .fn()
    .mockResolvedValueOnce({
      data: Array.from({ length: 100 }, (_, i) => ({
        id: `order_${i}`,
        status: "canceled",
      })),
    })
    .mockResolvedValueOnce({
      data: [
        {
          id: "order_old",
          fulfillments: [
            { id: "ful_old", data: { batch_status: { status: "INVALID" } } },
          ],
        },
      ],
    })
  const result = await shippingQueue({ resolve: () => ({ graph }) } as any)
  expect(graph).toHaveBeenCalledTimes(2)
  expect(result.progress[0].order_id).toBe("order_old")
})
