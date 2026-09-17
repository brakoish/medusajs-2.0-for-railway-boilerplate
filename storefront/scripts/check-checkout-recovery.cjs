// Isolated payment/shipping/auth regression tests. Never contacts a live service.
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")

function load(file, mocks) {
  const filename = path.join(__dirname, "../src", file)
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(code, { module, exports: module.exports, console, URL, window: mocks.window, localStorage: mocks.localStorage, require: name => {
    if (!(name in mocks)) throw new Error(`Unmocked dependency: ${name}`)
    return mocks[name]
  } }, { filename })
  return module.exports
}

async function main() {
  const mutations = []
  let returnCart = "cart-wallet"
  let result = { type: "cart", cart: {} }
  let regularCleared = false
  const sdk = { store: { cart: {
    update: async (...args) => { mutations.push(["update", ...args]); return {} },
    addShippingMethod: async (...args) => { mutations.push(["shipping", ...args]); return {} },
    retrieve: async () => ({ cart: { item_subtotal: 25, item_discount_total: 5, shipping_subtotal: 7, tax_total: 2, total: 29 } }),
    complete: async (id) => { mutations.push(["complete", id]); return result },
  } } }
  sdk.client = { fetch: async (url, options) => {
    assert.equal(options.cache, "no-store", "cart reads must bypass stale response caching")
    assert.equal(options.headers.authorization, "test")
    return sdk.store.cart.retrieve()
  } }
  const cart = load("lib/data/cart.ts", {
    "@lib/config": { sdk }, "@lib/util/medusa-error": { __esModule: true, default: e => { throw e } },
    "next/cache": { revalidateTag: () => {} }, "next/navigation": { redirect: url => { throw new Error(`REDIRECT:${url}`) } },
    "./cookies": {
      getAuthHeaders: async () => ({ authorization: "test" }), getCartId: async () => "cart-regular",
      getPaymentReturnCartId: async () => returnCart,
      setPaymentReturnCartId: async id => { returnCart = id },
      removePaymentReturnCartId: async () => { returnCart = null },
      removeCartId: async () => { regularCleared = true },
    },
    lodash: {}, "./products": {}, "./regions": {}, "@lib/util/promotion-codes": {},
  })
  const totals = await cart.previewWalletTotals({ cartId: "cart-wallet", shippingAddress: {}, shippingMethodId: "ship-1" })
  assert.equal(mutations.filter(c => c[0] === "update").length, 0, "rate-only changes must not erase the address")
  assert.equal(totals.item_subtotal + totals.shipping_subtotal + totals.tax_total, totals.total, "wallet items must include discounts")
  await cart.previewWalletTotals({ cartId: "cart-wallet", shippingAddress: { postal_code: "10001", country_code: "US" } })
  const address = mutations.find(c => c[0] === "update")[2].shipping_address
  assert.equal(address.country_code, "us")
  assert.equal(address.postal_code, "10001")
  assert.ok(!("first_name" in address), "preview must not replace the customer's name")
  const addressForm = new FormData()
  addressForm.set("shipping_address.address_2", "Apartment 4B")
  addressForm.set("billing_address.address_2", "Suite 7")
  await assert.rejects(cart.setAddresses(null, addressForm), /REDIRECT:/)
  const regularAddress = mutations.filter(c => c[0] === "update").at(-1)[2]
  assert.equal(regularAddress.shipping_address.address_2, "Apartment 4B")
  assert.equal(regularAddress.billing_address.address_2, "Suite 7")
  await assert.rejects(cart.completePaymentReturn(), /not confirmed yet/, "incomplete carts must not be shown as paid orders")
  assert.equal(regularCleared, false)
  result = { type: "order", order: { id: "order-confirmed" } }
  await assert.rejects(cart.completePaymentReturn(), /REDIRECT:\/order\/confirmed\/order-confirmed/)
  assert.equal(returnCart, null)
  assert.equal(regularCleared, false, "Buy Now completion must preserve the regular cart")
  await assert.rejects(cart.completePaymentReturn(), /expired/)
  await cart.preparePaymentReturn()
  assert.equal(returnCart, "cart-regular")
  await assert.rejects(cart.completePaymentReturn(), /REDIRECT:/)
  assert.equal(regularCleared, true)

  let priced = 0
  const fulfillment = load("lib/data/fulfillment.ts", {
    react: { cache: fn => fn }, "@lib/config": { sdk: { store: { fulfillment: {
      listCartOptions: async () => ({ shipping_options: [
        { id: "flat", price_type: "flat", amount: 7 },
        { id: "calc", price_type: "calculated" },
        { id: "unknown", price_type: "flat" },
        { id: "failed", price_type: "calculated" },
        { id: "free", price_type: "flat", amount: 0 },
      ] }),
      calculate: async id => { priced++; if (id === "failed") throw new Error("Unavailable"); return { shipping_option: { calculated_price: { calculated_amount: 9 } } } },
    } } } },
  })
  const rates = await fulfillment.fetchCartShippingMethods("cart-wallet")
  assert.equal(priced, 2)
  assert.equal(JSON.stringify(rates.map(r => [r.id, r.amount])), JSON.stringify([["flat", 7], ["calc", 9], ["free", 0]]), "unavailable prices must never become free shipping")

  const previews = []
  const amounts = []
  let resolved, rejected = false
  let available = true
  const wallet = load("modules/checkout/components/express-checkout/wallet-confirm.ts", {
    "@lib/data/cart": { previewWalletTotals: async input => { previews.push(input); return { item_subtotal: 20, shipping_subtotal: 7, tax_total: 2, total: 29 } } },
    "@lib/data/fulfillment": { fetchCartShippingMethods: async () => available ? [{ id: "ship-1", name: "Ground", amount: 7 }] : [] },
    "@lib/data/enrich-pi": {}, "@lib/util/build-pi-data": {},
  })
  const event = { address: { country: "US", postal_code: "10001" }, shippingRate: { id: "ship-1" }, resolve: data => { resolved = data }, reject: () => { rejected = true } }
  const elements = { update: data => amounts.push(data.amount) }
  await wallet.handleShippingAddressChange({ event, cartId: "cart-wallet", elements })
  assert.equal(amounts.at(-1), 2900)
  assert.equal(resolved.lineItems.reduce((sum, line) => sum + line.amount, 0), 2900)
  assert.equal(previews.at(-1).shippingMethodId, "ship-1")
  await wallet.handleShippingRateChange({ event, cartId: "cart-wallet", elements })
  assert.equal(Object.keys(previews.at(-1).shippingAddress).length, 0)
  available = false
  await wallet.handleShippingAddressChange({ event, cartId: "cart-wallet", elements })
  assert.equal(rejected, true, "no rates must reject instead of inventing a shipping price")

  let resetCalls = 0, updateCalls = 0
  const passwords = load("lib/data/password-reset.ts", { "@lib/config": { sdk: { auth: {
    resetPassword: async () => { resetCalls++ }, updateProvider: async (...args) => { updateCalls++; assert.equal(args[3], "test-token") },
  } } } })
  const form = new FormData()
  assert.ok((await passwords.requestPasswordReset(null, form)).error)
  assert.equal(resetCalls, 0)
  form.set("email", "test@example.invalid")
  assert.ok((await passwords.requestPasswordReset(null, form)).success)
  form.set("token", "test-token"); form.set("password", "short")
  assert.ok((await passwords.resetCustomerPassword(null, form)).error)
  assert.equal(updateCalls, 0)
  form.set("password", "long-local-only"); form.set("confirm_password", "different")
  assert.ok((await passwords.resetCustomerPassword(null, form)).error)
  form.set("confirm_password", "long-local-only")
  assert.ok((await passwords.resetCustomerPassword(null, form)).success)
  assert.equal(updateCalls, 1)

  const privacy = load("lib/util/analytics-properties.ts", {})
  for (const pathname of ["/reset-password", "/checkout/return", "/order/confirmed/order_secret", "/account/orders/details/order_secret"]) {
    const safe = privacy.safeAnalyticsProperties({
      distinct_id: "anonymous", value: 25, currency: "usd",
      $current_url: "https://thedabpal.com/reset-password?token=secret",
      $pathname: "/order/confirmed/order_secret", $referrer: "https://google.com/search?q=secret",
      $session_entry_url: "https://thedabpal.com/checkout/return?payment_intent_client_secret=secret",
      $session_entry_pathname: "/order/confirmed/order_secret", nested: { token: "secret" },
      path: pathname, destination: pathname,
    }, pathname, "https://thedabpal.com")
    assert.ok(!JSON.stringify(safe).includes("secret"), "final analytics event must contain no private URL/session values")
    assert.equal(safe.referrer_host, "google.com")
    assert.equal(safe.value, 25)
  }
  const tracking = load("lib/util/order-tracking.ts", {})
  assert.match(tracking.orderTracking([{ id: "f1", data: { tracking_number: "123" } }])[0].status, /waiting for the carrier/)
  assert.equal(tracking.orderTracking([{ id: "f1", data: { tracking_status: { status: "TRANSIT" } } }])[0].status, "In transit")
  assert.equal(tracking.orderTracking([{ id: "f1", delivered_at: "2026-09-17" }])[0].status, "Delivered")
  assert.equal(tracking.orderTracking([{ id: "f1", canceled_at: "2026-09-17", data: { tracking_number: "123", tracking_url: "https://tracking.example/123" } }])[0].url, undefined)
  assert.equal(tracking.orderTracking([{ id: "f1", data: { tracking_url: "javascript:alert(1)" } }])[0].url, undefined)

  let choice = "essential", initialized = 0, outgoing = [], config
  const ph = { init: (_key, options) => { initialized++; config = options }, capture: (event, properties) => {
    outgoing.push(config.before_send({ event, properties: { ...properties, $session_entry_url: "https://thedabpal.com/reset-password?token=secret" } }))
  } }
  const analytics = load("lib/util/analytics.ts", {
    "./analytics-properties": privacy,
    "posthog-js": { default: ph },
    window: { location: { hostname: "thedabpal.com", pathname: "/order/confirmed/order_secret", origin: "https://thedabpal.com" } },
    localStorage: { getItem: () => choice },
  })
  await analytics.track("purchase", { value: 25 })
  assert.equal(initialized, 0, "analytics must not load before consent")
  choice = "analytics"
  await analytics.track("purchase", { value: 25 })
  assert.equal(initialized, 1)
  assert.equal(outgoing.length, 1)
  assert.ok(!JSON.stringify(outgoing).includes("secret"))
  choice = "essential"
  await analytics.track("purchase", { value: 25 })
  assert.equal(outgoing.length, 1, "withdrawal must stop future events")

  let redirectTo, paymentReturnSaved = false, sessionCalls = 0
  const confirmCart = { id: "cart-wallet", total: 29 }
  const confirmWallet = load("modules/checkout/components/express-checkout/wallet-confirm.ts", {
    window: { location: { origin: "https://example.invalid", assign: url => { redirectTo = url } } },
    "@lib/data/cart": {
      updateCart: async () => {}, setShippingMethod: async () => {}, retrieveCart: async () => confirmCart,
      initiatePaymentSession: async () => { sessionCalls++; return { payment_collection: { payment_sessions: [{ status: "pending", data: { client_secret: "local-test" } }] } } },
      preparePaymentReturn: async () => { paymentReturnSaved = true },
    },
    "@lib/data/fulfillment": { fetchCartShippingMethods: async () => [{ id: "ship-1", amount: 7 }] },
    "@lib/data/enrich-pi": { enrichStripePaymentIntent: async () => {} },
    "@lib/util/build-pi-data": { buildStripeSessionData: () => ({}) },
  })
  const walletInput = { cart: confirmCart, elements: { submit: async () => ({}) }, event: {
    shippingAddress: { name: "Local Test", address: { line1: "Local fixture", postal_code: "10001", country: "US" } },
    billingDetails: { email: "test@example.invalid" }, shippingRate: { id: "ship-1" },
  } }
  for (const status of ["succeeded", "requires_capture", "processing"]) {
    redirectTo = undefined
    await confirmWallet.walletConfirm({ ...walletInput, stripe: { confirmPayment: async () => ({ paymentIntent: { status } }) } })
    assert.equal(redirectTo, "/checkout/return", `${status} must recover the existing payment rather than invite a new payment`)
    assert.equal(paymentReturnSaved, true)
  }
  await assert.rejects(confirmWallet.walletConfirm({ ...walletInput, stripe: { confirmPayment: async () => ({ error: { message: "Card declined" } }) } }), /Card declined/)
  await assert.rejects(confirmWallet.walletConfirm({ ...walletInput, stripe: { confirmPayment: async () => ({}) } }), /status is unclear/)
  console.log("PASS: address preservation, discounted wallet totals, real calculated rates, no-rate rejection, payment-return recovery, isolated cart cleanup, and password-reset validation")
  console.log("PASS: apartment submission, final analytics allowlist, carrier-aware tracking, and wallet confirmed/processing/declined/unknown outcomes")
}
main().catch(error => { console.error(error); process.exitCode = 1 })
