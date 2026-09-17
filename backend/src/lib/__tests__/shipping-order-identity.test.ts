import { orderLineDescription } from "../order-line-description"

test.each([
  ["DABPAL-WHT-SINGLE", "Single", "Marble"],
  ["DABPAL-BLK-3PACK", "3-Pack", "Slate"],
  ["DABPAL-WHT-6PACK", "6-Pack", "Marble"],
])("email identity uses immutable SKU %s", (variant_sku, variant_title, finish) => {
  expect(orderLineDescription({ variant_sku, variant_title })).toEqual({
    title: `Dab Pal — ${finish}`, finish, pack: variant_title, colors: "",
  })
})

test("legacy white orders and custom metadata remain meaningful", () => {
  expect(orderLineDescription({ title: "White Speck Dab Pal", variant_title: "Single" }).finish).toBe("Marble")
  expect(orderLineDescription({ variant_sku: "DABPAL-CUSTOM-SINGLE", metadata: { custom_color_summary: "Cream / Slate / Orange" } }).colors).toBe("Cream / Slate / Orange")
})
