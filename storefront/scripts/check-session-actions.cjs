// Isolated regression checks: no backend, cookies, payments, or accounts are changed.
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")

const calls = []
let savedToken = null
let loginResult = "test-token"
const capture = (name, result) => async (...args) => {
  calls.push({ name, args })
  return result
}
const sdk = {
  auth: { login: async () => loginResult, register: async () => "registered", logout: async () => {} },
  store: {
    customer: Object.fromEntries(["retrieve", "update", "create", "createAddress", "deleteAddress", "updateAddress"].map(name => [name, capture(name, { customer: { id: "customer-test" } })])),
    order: { retrieve: capture("order", { order: {} }), list: capture("orders", { orders: [] }) },
    cart: { deleteLineItem: capture("deleteLineItem", {}) },
  },
}
const mocks = {
  "@lib/config": { sdk },
  "@lib/util/medusa-error": { default: e => { throw e }, __esModule: true },
  "next/cache": { revalidateTag: () => {} },
  "next/navigation": { redirect: () => {} },
  react: { cache: fn => fn },
  "./cookies": {
    getAuthHeaders: async () => ({ authorization: "Bearer test-token" }),
    getCartId: async () => "cart-test",
    setAuthToken: async token => { await new Promise(resolve => setTimeout(resolve, 10)); savedToken = token },
    removeAuthToken: async () => { await new Promise(resolve => setTimeout(resolve, 10)); savedToken = null },
  },
  lodash: {}, "./products": {}, "./regions": {}, "@lib/util/promotion-codes": {},
}
function load(relative, extra = {}) {
  const filename = path.join(__dirname, "../src", relative)
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(code, { exports: module.exports, module, require: name => {
    if (name in extra) return extra[name]
    if (name in mocks) return mocks[name]
    throw new Error(`Unmocked import: ${name}`)
  } }, { filename })
  return module.exports
}

async function main() {
  const customer = load("lib/data/customer.ts")
  const form = new FormData()
  form.set("email", "local-test@example.invalid")
  form.set("password", "local-only")
  await customer.getCustomer()
  await customer.updateCustomer({ first_name: "Test" })
  await customer.addCustomerAddress(null, form)
  await customer.deleteCustomerAddress("address-test")
  await customer.updateCustomerAddress({ addressId: "address-test" }, form)
  const orders = load("lib/data/orders.ts")
  await orders.retrieveOrder("order-test")
  await orders.listOrders()
  await load("lib/data/cart.ts").deleteLineItem("line-test")
  for (const { name, args } of calls) assert.equal(args.at(-1).authorization, "Bearer test-token", `${name} must await auth headers`)
  const deletion = calls.find(c => c.name === "deleteLineItem")
  assert.equal(deletion.args.length, 4, "cart deletion headers must use the fourth SDK argument")
  await customer.login(null, form)
  assert.equal(savedToken, "test-token", "login must finish saving its cookie before returning")
  await customer.signout("us")
  assert.equal(savedToken, null, "signout must finish removing its cookie before returning")
  await customer.signup(null, form)
  assert.equal(savedToken, "test-token", "signup must await the login cookie")
  loginResult = { location: "https://example.invalid/verify" }
  assert.match(await customer.login(null, form), /verification is required/)
  assert.equal(savedToken, "test-token", "a redirect response must never be stored as a bearer token")

  let cookieRead = false
  const templateMocks = {
    "react/jsx-runtime": { jsx: () => null, jsxs: () => null },
    "next/headers": { cookies: async () => ({ get: () => { cookieRead = true; return undefined } }) },
    "@medusajs/ui": {},
  }
  for (const name of ["@modules/common/components/cart-totals", ...["help", "items", "onboarding-cta", "order-details", "shipping-details", "payment-details"].map(x => `@modules/order/components/${x}`)]) templateMocks[name] = {}
  await load("modules/order/templates/order-completed-template.tsx", templateMocks).default({ order: { id: "order-test" } })
  assert.ok(cookieRead, "order confirmation must await cookies before reading")
  console.log("PASS: authenticated customer/order calls, cart deletion, login/signup/signout timing, verification response, and order-confirmation cookie read")
}
main().catch(error => { console.error(error); process.exitCode = 1 })
