const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")

const source = fs.readFileSync(path.join(__dirname, "../src/lib/util/product-schema.ts"), "utf8")
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const context = { exports: {} }
vm.runInNewContext(output, context)
const { buildProductSchema, buildProductGroupSchema } = context.exports
const product = { handle: "black-speck", title: "Black Speck", description: "Case; swabs not included", image: "/dab-pal/product-front.png", sku: "SINGLE" }
const selected = { sku: "SINGLE", manage_inventory: false, calculated_price: { calculated_amount: 25, currency_code: "usd" } }
const schema = (variant = selected) => buildProductSchema(product, { variants: [{ sku: "PACK", calculated_price: { calculated_amount: 65, currency_code: "usd" } }, variant] }, "https://thedabpal.com")

assert.equal(schema().offers.price, 25, "Medusa prices are major units, and the single variant must be selected")
assert.equal(schema().offers.priceCurrency, "USD")
assert.equal(schema().offers.url, "https://thedabpal.com/store?finish=slate&pack=1")
assert.equal(schema().offers.availability, "https://schema.org/InStock")
assert.equal(schema({ ...selected, manage_inventory: true, inventory_quantity: 0 }).offers.availability, "https://schema.org/OutOfStock")
assert.equal(schema({ ...selected, manage_inventory: true, inventory_quantity: 0, allow_backorder: true }).offers.availability, "https://schema.org/BackOrder")
assert.equal(schema({ ...selected, calculated_price: { calculated_amount: 0, currency_code: "usd" } }).offers.price, 0)
assert.equal(schema({ ...selected, calculated_price: undefined }).offers, undefined)
assert.equal(schema({ ...selected, calculated_price: { calculated_amount: -1, currency_code: "usd" } }).offers, undefined)
assert.equal(schema({ ...selected, sku: "OTHER" }).offers, undefined)
assert.equal(schema().offers.hasMerchantReturnPolicy.returnFees, "https://schema.org/ReturnFeesCustomerResponsibility")
assert.equal(schema().offers.hasMerchantReturnPolicy.merchantReturnDays, 14)
assert.equal(schema().offers.hasMerchantReturnPolicy.merchantReturnLink, "https://thedabpal.com/shipping-returns")
const group = buildProductGroupSchema(["black-speck", "white-speck"].map(handle => ({
  product: { ...product, handle, title: handle === "white-speck" ? "Marble" : "Slate" },
  catalog: { variants: ["SINGLE", "3", "6"].map((pack, index) => ({ ...selected, sku: `DABPAL-${handle === "white-speck" ? "WHT" : "BLK"}-${pack}`, calculated_price: { calculated_amount: [25, 65, 120][index], currency_code: "usd" } })) },
})), "https://thedabpal.com")
assert.equal(group["@type"], "ProductGroup")
assert.equal(group.hasVariant.length, 6)
assert.equal(new Set(group.hasVariant.map(v => v.sku)).size, 6)
assert.equal(new Set(group.hasVariant.map(v => v.url)).size, 6)
assert.deepEqual(JSON.parse(JSON.stringify(group.hasVariant.map(v => v.offers.price))), [25, 65, 120, 25, 65, 120])
assert.equal(group.hasVariant[4].url, "https://thedabpal.com/store?finish=marble&pack=3")
assert.equal(group.hasVariant[4].size, "3-pack")
assert.equal(group.hasVariant[4].color, "White")
console.log("Product schema: 21 assertions passed")
const edited = buildProductGroupSchema([{ product: { ...product, title: "Slate" }, catalog: { variants: [{ ...selected, sku: "DABPAL-BLK-SINGLE" }] } }], "https://thedabpal.com", { title: "Edited name", capacity: "Edited capacity" })
assert.equal(edited.name, "Edited name")
assert.equal(edited.hasVariant[0].name, "Edited name — Slate · Single")
assert.equal(edited.hasVariant[0].additionalProperty[0].value, "Edited capacity")
console.log("Editable product schema: 3 assertions passed")
