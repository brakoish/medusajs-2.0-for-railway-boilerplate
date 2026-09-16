const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")

const source = fs.readFileSync(path.join(__dirname, "../src/lib/util/product-schema.ts"), "utf8")
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const context = { exports: {} }
vm.runInNewContext(output, context)
const { buildProductSchema } = context.exports
const product = { handle: "black-speck", title: "Black Speck", description: "Case; swabs not included", image: "/dab-pal/product-front.png", sku: "SINGLE" }
const selected = { sku: "SINGLE", manage_inventory: false, calculated_price: { calculated_amount: 25, currency_code: "usd" } }
const schema = (variant = selected) => buildProductSchema(product, { variants: [{ sku: "PACK", calculated_price: { calculated_amount: 65, currency_code: "usd" } }, variant] }, "https://thedabpal.com")

assert.equal(schema().offers.price, 25, "Medusa prices are major units, and the single variant must be selected")
assert.equal(schema().offers.priceCurrency, "USD")
assert.equal(schema().offers.url, "https://thedabpal.com/store/black-speck")
assert.equal(schema().offers.availability, "https://schema.org/InStock")
assert.equal(schema({ ...selected, manage_inventory: true, inventory_quantity: 0 }).offers.availability, "https://schema.org/OutOfStock")
assert.equal(schema({ ...selected, manage_inventory: true, inventory_quantity: 0, allow_backorder: true }).offers.availability, "https://schema.org/BackOrder")
assert.equal(schema({ ...selected, calculated_price: { calculated_amount: 0, currency_code: "usd" } }).offers.price, 0)
assert.equal(schema({ ...selected, calculated_price: undefined }).offers, undefined)
assert.equal(schema({ ...selected, calculated_price: { calculated_amount: -1, currency_code: "usd" } }).offers, undefined)
assert.equal(schema({ ...selected, sku: "OTHER" }).offers, undefined)
console.log("Product schema: 10 assertions passed")
