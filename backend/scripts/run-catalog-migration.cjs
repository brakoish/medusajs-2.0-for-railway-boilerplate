const fs = require("node:fs")
const path = require("node:path")
const assert = require("node:assert/strict")
const { Client } = require("pg")
const { snapshotCatalog } = require("./catalog-snapshot.cjs")
const { consolidate } = require("./consolidate-dab-pal.cjs")
const { restoreCatalog } = require("./restore-dab-pal-catalog.cjs")
async function main() {
  const [mode, directory] = process.argv.slice(2)
  assert(["snapshot", "apply", "restore"].includes(mode) && directory, "Specify snapshot/apply/restore and backup directory")
  const db = new Client({ connectionString: process.env.DATABASE_URL })
  await db.connect()
  try {
    await db.query("BEGIN ISOLATION LEVEL SERIALIZABLE")
    await db.query("SET LOCAL lock_timeout='5s'")
    const before = await snapshotCatalog(db)
    fs.mkdirSync(directory, { recursive: true })
    if (mode === "snapshot") fs.writeFileSync(path.join(directory, "catalog-snapshot.json"), JSON.stringify(before, null, 2), { flag: "wx" })
    if (mode === "apply") {
      fs.writeFileSync(path.join(directory, "before.json"), JSON.stringify(before, null, 2), { flag: "wx" })
      const result = await consolidate(db)
      assert(!result.already_consolidated, "Already consolidated; no migration necessary")
      const after = await snapshotCatalog(db)
      for (const table of ["price", "price_set", "product_variant_price_set", "product_variant_inventory_item", "promotion_rule", "promotion_rule_value", "product_sales_channel", "product_shipping_profile"]) assert.deepEqual(after.catalog[table], before.catalog[table], `${table} changed`)
      fs.writeFileSync(path.join(directory, "after.json"), JSON.stringify(after, null, 2), { flag: "wx" })
      console.log(JSON.stringify({ prepared: result, financial_links_unchanged: true }))
    }
    if (mode === "restore") await restoreCatalog(db, JSON.parse(fs.readFileSync(path.join(directory, "before.json"))), JSON.parse(fs.readFileSync(path.join(directory, "after.json"))))
    await db.query("COMMIT")
    console.log(JSON.stringify({ status: "COMMITTED", mode }))
  } catch (error) { await db.query("ROLLBACK"); throw error } finally { await db.end() }
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
