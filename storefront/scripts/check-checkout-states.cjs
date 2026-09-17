// Execute checkout render/handler logic with inert component and provider mocks.
// This is not browser or visual validation, and cannot contact a payment provider.
const assert = require("node:assert/strict")
const fs = require("node:fs")
const vm = require("node:vm")
const path = require("node:path")
const ts = require("typescript")
const effects = []
const react = {
  useState: initial => [typeof initial === "function" ? initial() : initial, () => {}],
  useEffect: fn => effects.push(fn), useCallback: fn => fn, useContext: () => true,
}
const jsx = (type, props) => ({ type, props })
const mocks = {
  react, "react/jsx-runtime": { jsx, jsxs: jsx },
  "next/navigation": { usePathname: () => "/checkout", useSearchParams: () => new URLSearchParams("step=payment"), useRouter: () => ({ push: () => {}, refresh: () => {} }) },
  "@medusajs/ui": { Button: "button", Heading: "h2", Text: "p", Container: "div", Tooltip: "div", clx: () => "" },
  "@medusajs/icons": {}, "@headlessui/react": { RadioGroup: "radio-group" },
  "@stripe/react-stripe-js": { PaymentElement: "card-entry", useStripe: () => { throw new Error("Authorized payments must not access Stripe") }, useElements: () => { throw new Error("Authorized payments must not access Elements") } },
  "@stripe/stripe-js": { loadStripe: () => null }, "@paypal/react-paypal-js": {},
  "@lib/constants": { isStripe: id => id === "pp_stripe_stripe", isPaypal: () => false, isManual: () => false, paymentInfoMap: {} },
  "@lib/data/enrich-pi": {}, "@lib/util/build-pi-data": {},
  "@modules/checkout/components/payment-wrapper": { StripeContext: {} },
}
function load(relative, extra = {}) {
  const filename = path.join(__dirname, "../src", relative)
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
  } }).outputText
  vm.runInNewContext(code, { module, exports: module.exports, process: { env: {} }, URLSearchParams, require: name => {
    if (name in extra) return extra[name]
    if (name in mocks) return mocks[name]
    if (name.startsWith("@modules/") || name === "../error-message") return { __esModule: true, default: name }
    throw new Error(`Unmocked import ${name}`)
  } }, { filename })
  return module.exports.default
}
function nodes(tree) {
  if (!tree || typeof tree !== "object") return []
  if (Array.isArray(tree)) return tree.flatMap(nodes)
  if (typeof tree.type === "function") return nodes(tree.type(tree.props))
  return [tree, ...nodes(tree.props?.children)]
}
async function main() {
  let initiated = 0, completed = 0
  const actions = { initiatePaymentSession: async () => { initiated++ }, placeOrder: async () => { completed++ } }
  const PaymentButton = load("modules/checkout/components/payment-button/index.tsx", { "@lib/data/cart": actions })
  const Payment = load("modules/checkout/components/payment/index.tsx", { "@lib/data/cart": actions,
    "@modules/checkout/components/payment-button": { __esModule: true, default: PaymentButton } })
  const cart = { id: "cart-fixture", email: "test@example.invalid", shipping_address: {}, billing_address: {}, shipping_methods: [{ id: "ship" }], payment_collection: { payment_sessions: [{ status: "authorized", provider_id: "pp_stripe_stripe", data: {} }] } }
  const output = nodes(Payment({ cart, availablePaymentMethods: [{ id: "pp_stripe_stripe" }] }))
  for (const effect of effects.splice(0)) effect()
  assert.equal(initiated, 0, "authorized sessions must not initiate another payment")
  assert.equal(output.filter(n => n.type === "card-entry").length, 0)
  const confirmation = output.find(n => n.type === "button" && n.props.children === "Confirm existing payment")
  assert.ok(confirmation, "authorized session has a completion-only CTA")
  await confirmation.props.onClick()
  assert.equal(completed, 1)
  assert.equal(initiated, 0)
  const noProviders = nodes(Payment({ cart: { ...cart, payment_collection: {} }, availablePaymentMethods: [] }))
  assert.ok(noProviders.some(n => String(n.props?.message).includes("Payment options are unavailable")))

  for (const failing of ["shipping", "payment"]) {
    const Form = load("modules/checkout/templates/checkout-form/index.tsx", {
      "@lib/data/fulfillment": { listCartShippingMethods: async () => failing === "shipping" ? null : [] },
      "@lib/data/payment": { listCartPaymentMethods: async () => failing === "payment" ? null : [] },
    })
    const form = nodes(await Form({ cart: { ...cart, region: { id: "region" } }, customer: null }))
    assert.ok(form.some(n => n.type === "@modules/checkout/components/addresses"), "address form survives provider failure")
    assert.ok(form.some(n => n.type === "@modules/checkout/components/recovery-panel"), "service failure has actionable recovery")
  }
  console.log("PASS: authorized payment only completes existing order; no new session/card entry; provider failures retain address entry and recovery")
}
main().catch(error => { console.error(error); process.exitCode = 1 })
