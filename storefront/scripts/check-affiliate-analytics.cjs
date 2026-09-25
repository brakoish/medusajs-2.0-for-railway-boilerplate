// Isolated application/SDK serialization checks: no browser, network, ingestion, or orders.
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const assert = require("node:assert/strict")
const ts = require("typescript")

const root = path.resolve(__dirname, "..")
const passed = []
function check(name, test) { test(); passed.push(name) }
function load(file, mocks = {}, globals = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(compiled, {
    module, exports: module.exports, URL, console,
    require: name => name in mocks ? mocks[name] : require(name), ...globals,
  }, { filename: file })
  return module.exports
}

async function main() {
  const properties = load("src/lib/util/analytics-properties.ts")
  const clean = properties.safeAnalyticsProperties({
    article_slug: "best-swabs-for-dabs", product_id: "B0BPLQ9XZH", placement: "article_supplies",
    email: "private@example.test", order_id: "order_private", nested: { private: true },
    path: "/blog/best-swabs-for-dabs?email=private#hash", destination: "/store?email=private",
    $referrer: "https://www.google.com/search?q=private", $session_id: "private-session",
    $current_url: "https://thedabpal.com/?email=private",
  }, "/blog/best-swabs-for-dabs", "https://thedabpal.com")
  check("affiliate identifiers retained", () => {
    assert.equal(clean.article_slug, "best-swabs-for-dabs")
    assert.equal(clean.product_id, "B0BPLQ9XZH")
    assert.equal(clean.placement, "article_supplies")
  })
  check("unapproved private and nested properties removed", () => {
    for (const key of ["email", "order_id", "nested", "$session_id", "$referrer"]) assert.equal(clean[key], undefined)
  })
  check("referrer reduced to hostname", () => assert.equal(clean.referrer_host, "www.google.com"))
  check("query and fragment stripped", () => {
    assert.equal(clean.path, "/blog/best-swabs-for-dabs")
    assert.equal(clean.destination, "/store")
    assert.equal(clean.$current_url, "https://thedabpal.com/blog/best-swabs-for-dabs")
  })
  check("order path identifier redacted", () => assert.equal(properties.publicAnalyticsPath("/order/confirmed/order_private?token=secret"), "/order"))

  let choice = null, hostname = "thedabpal.com", initializations = 0, config
  const captures = []
  const storage = { getItem: () => choice, setItem: (_key, value) => { choice = value } }
  const window = { location: { get hostname() { return hostname }, pathname: "/blog/best-swabs-for-dabs", origin: "https://thedabpal.com" } }
  const sdk = {
    init: (_key, options) => { initializations++; config = options },
    capture: (event, values) => captures.push(config.before_send({ event, properties: { ...values, $referrer: "https://www.google.com/search?q=private" } })),
  }
  const analytics = load("src/lib/util/analytics.ts", { "./analytics-properties": properties, "posthog-js": sdk }, { window, localStorage: storage })
  await analytics.track("affiliate_click")
  check("no choice blocks initialization", () => assert.equal(initializations, 0))
  choice = "essential"
  await analytics.track("$pageview")
  check("essential-only blocks initialization", () => assert.equal(initializations, 0))
  choice = "analytics"; hostname = "localhost"
  await analytics.track("$pageview")
  check("nonproduction hostname blocks initialization", () => assert.equal(initializations, 0))
  hostname = "thedabpal.com"
  await analytics.track("affiliate_click", { article_slug: "best-swabs-for-dabs", product_id: "B0BPLQ9XZH", placement: "article_supplies" })
  check("consented affiliate event reaches fake capture once", () => {
    assert.equal(initializations, 1); assert.equal(captures.length, 1)
    assert.equal(captures[0].event, "affiliate_click")
    assert.equal(captures[0].properties.product_id, "B0BPLQ9XZH")
  })
  check("automatic collection disabled and DNT configured", () => {
    assert.equal(config.capture_pageview, false); assert.equal(config.autocapture, false)
    assert.equal(config.disable_session_recording, true); assert.equal(config.persistence, "memory")
    assert.equal(config.respect_dnt, true)
  })

  // Exercise the installed SDK's actual enrichment -> before_send -> batch serialization.
  // Never initialize it: storage/queue stay in memory and transport is forbidden.
  const { PostHog } = require("posthog-js/lib/src/posthog-core")
  const { RequestQueue } = require("posthog-js/lib/src/request-queue")
  const { jsonStringify } = require("posthog-js/lib/src/request")
  const realSdk = new PostHog(), queued = []
  realSdk.__loaded = true
  realSdk.config = { ...realSdk.config, ...config, token: "phc_offline_fixture", save_referrer: false, save_campaign_params: false }
  realSdk.is_capturing = () => true
  realSdk._is_bot = () => false
  realSdk.persistence = {
    get_property: () => undefined, set_property() {}, remove_event_timer: () => undefined,
    properties: () => ({ distinct_id: "anonymous-fixture", $device_id: "anonymous-fixture" }),
  }
  realSdk.sessionPersistence = {
    get_property: () => undefined, update_search_keyword() {},
    properties: () => ({ $session_id: "private-session", $referrer: "https://www.google.com/search?q=private" }),
  }
  realSdk.pageViewManager = { doPageView: () => ({}), doEvent: () => ({}) }
  realSdk._requestQueue = { enqueue: request => queued.push(request) }
  realSdk._send_retriable_request = () => { throw Error("Network forbidden in isolated checks") }
  for (const event of ["$pageview", "guide_product_click", "affiliate_click"]) {
    realSdk.capture(event, { path: "/blog/fixture?private=secret", email: "private@example.test", order_id: "order_private" })
  }
  const batches = RequestQueue.prototype._formatQueue.call({ _queue: queued })
  const serialized = JSON.parse(jsonStringify(Object.values(batches)[0].data))
  check("installed SDK serialized events retain the required project token", () => {
    assert.equal(serialized.length, 3)
    for (const event of serialized) assert.equal(event.properties.token, "phc_offline_fixture")
  })
  check("installed SDK serialized events retain disabled person processing", () => {
    for (const event of serialized) assert.equal(event.properties.$process_person_profile, false)
  })
  check("SDK protocol fields do not restore stripped private properties", () => {
    for (const event of serialized) {
      for (const key of ["email", "order_id", "$session_id", "$referrer"]) assert.equal(event.properties[key], undefined)
      assert.equal(event.properties.path, "/blog/fixture")
      assert.equal(event.properties.referrer_host, "www.google.com")
    }
  })
  choice = "essential"
  await analytics.track("affiliate_click")
  check("revocation blocks later capture", () => assert.equal(captures.length, 1))
  const blockedStorage = load("src/lib/util/analytics.ts", { "./analytics-properties": properties }, { window, localStorage: { getItem() { throw Error("blocked") } } })
  check("unavailable storage fails closed", () => assert.equal(blockedStorage.analyticsAllowed(), false))

  const link = load("src/modules/blog/affiliate-link.tsx", {
    "@lib/util/analytics": { track: (event, values) => captures.push({ event, properties: values }) },
  }).AffiliateLink({ href: "https://www.amazon.com/dp/B0BPLQ9XZH?tag=dabpal-20", productId: "B0BPLQ9XZH", slug: "best-swabs-for-dabs", children: "Paid link" })
  check("affiliate link qualified and opens new tab", () => {
    assert.equal(link.props.rel, "sponsored noopener"); assert.equal(link.props.target, "_blank")
  })
  link.props.onClick()
  check("one handler call requests one affiliate event", () => {
    assert.equal(captures.length, 2); assert.equal(captures[1].event, "affiliate_click")
  })

  let effects = [], pathname = "/blog/best-swabs-for-dabs", requested = []
  const react = { ...require("react"), useState: () => [true, () => {}], useEffect: effect => effects.push(effect) }
  const provider = load("src/app/posthog-provider.tsx", {
    react, "next/navigation": { usePathname: () => pathname },
    "@lib/util/analytics": { ANALYTICS_CHOICE: "choice", track: (event, values) => requested.push({ event, values }) },
  }, { window: { addEventListener() {}, removeEventListener() {} }, localStorage: storage })
  const preferences = provider.PostHogProvider({ children: null }).props.children[1].props.children.type
  function renderAndRunEffects(route) {
    pathname = route; effects = []; requested = []
    const tree = preferences()
    effects.forEach(effect => effect())
    return tree
  }
  renderAndRunEffects("/blog/best-swabs-for-dabs")
  check("public route effect requests pageview", () => assert.equal(requested[0].event, "$pageview"))
  for (const route of ["/checkout", "/account", "/order/confirmed/private", "/reset-password"]) {
    renderAndRunEffects(route)
    check(`${route} suppresses pageview`, () => assert.equal(requested.length, 0))
  }
  const tree = renderAndRunEffects("/blog/best-swabs-for-dabs")
  const allow = tree.props.children[1].props.children[1]
  requested = []; choice = "essential"
  allow.props.onClick()
  check("new consent grants a pageview", () => assert.equal(requested.length, 1))
  allow.props.onClick()
  check("reselecting existing consent does not duplicate pageview", () => assert.equal(requested.length, 1))

  let commerceAllowed = true, session = new Map(), storageUnavailable = false
  const commerceRequests = []
  const commerce = load("src/modules/common/components/commerce-event/index.tsx", {
    react: { useEffect: effect => effect() },
    "@lib/util/analytics": {
      analyticsAllowed: () => commerceAllowed,
      track: (event, properties) => commerceRequests.push({ event, properties }),
    },
  }, { sessionStorage: {
    getItem: key => { if (storageUnavailable) throw Error("blocked"); return session.get(key) },
    setItem: (key, value) => session.set(key, value),
  } }).default
  const confirmation = load("src/modules/order/templates/order-completed-template.tsx", {
    "@modules/common/components/commerce-event": commerce,
    "@medusajs/ui": { Heading: "h2" },
    "next/headers": { cookies: async () => ({ get: () => undefined }) },
    ...Object.fromEntries([
      "@modules/common/components/cart-totals", "@modules/order/components/help",
      "@modules/order/components/items", "@modules/order/components/onboarding-cta",
      "@modules/order/components/order-details", "@modules/order/components/shipping-details",
      "@modules/order/components/payment-details",
    ].map(name => [name, () => null])),
  }, { process: { env: { NODE_ENV: "production" } } }).default
  for (const payment_status of ["not_paid", "authorized", "captured", "refunded"]) {
    const rendered = await confirmation({ order: { id: "order_private", payment_status, total: 25, currency_code: "usd" } })
    const event = rendered.props.children[0]
    check(`${payment_status} confirmation means a view without financial payload`, () => {
      assert.equal(event.type, commerce)
      assert.equal(event.props.event, "order_confirmation_viewed")
      assert.equal(event.props.value, undefined); assert.equal(event.props.currency, undefined)
    })
  }
  const view = { event: "order_confirmation_viewed", sessionKey: "order_private" }
  commerce(view); commerce(view)
  check("confirmation tracking has no financial data or ID and suppresses repeat attempts", () => {
    assert.equal(commerceRequests.length, 1)
    assert.equal(commerceRequests[0].event, "order_confirmation_viewed")
    assert.equal(Object.keys(commerceRequests[0].properties).length, 0)
    assert.equal(session.get("dabpal-event:order_confirmation_viewed:order_private"), "attempted")
  })
  session = new Map(); commerce(view)
  check("fresh tab storage permits another view, not a unique-order count", () => assert.equal(commerceRequests.length, 2))
  commerce({ event: "begin_checkout", value: 25, currency: "usd", sessionKey: "cart_private" })
  check("checkout keeps its existing amount and currency without ID", () => {
    assert.equal(commerceRequests[2].event, "begin_checkout")
    assert.equal(commerceRequests[2].properties.value, 25)
    assert.equal(commerceRequests[2].properties.currency, "usd")
    assert.equal(Object.keys(commerceRequests[2].properties).length, 2)
  })
  session = new Map(); commerceAllowed = false; commerce(view)
  check("confirmation consent denial suppresses the attempt", () => assert.equal(commerceRequests.length, 3))
  commerceAllowed = true; storageUnavailable = true
  check("unavailable session storage does not interrupt confirmation or send", () => {
    assert.doesNotThrow(() => commerce(view)); assert.equal(commerceRequests.length, 3)
  })
  console.log(JSON.stringify({ passed: passed.length, checks: passed, scope: "Isolated source/SDK serialization checks only; no network or actual PostHog receipt." }, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
