const fs = require("node:fs")
const assert = require("node:assert/strict")
const { PGlite } = require("@electric-sql/pglite")
const { consolidate } = require("./consolidate-dab-pal.cjs")
const { restoreCatalog } = require("./restore-dab-pal-catalog.cjs")
const { snapshotCatalog } = require("./catalog-snapshot.cjs")

async function main() {
  const snapshot = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
  const db = new PGlite()
  try {
    for (const table of Object.keys(snapshot.catalog)) {
      const columns = snapshot.schema.filter(c => c.table_name === table)
      await db.exec(`CREATE TABLE "${table}" (${columns.map(c => `"${c.column_name}" ${c.data_type === "USER-DEFINED" ? "text" : c.data_type === "ARRAY" ? "text[]" : c.data_type}`).join(",")})`)
      for (const row of snapshot.catalog[table]) await db.query(`INSERT INTO "${table}" (${columns.map(c => `"${c.column_name}"`).join(",")}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(",")})`, columns.map(c => row[c.column_name]))
    }
    for (const constraint of snapshot.constraints.filter(c => snapshot.catalog[c.table_name] && !c.definition.startsWith("FOREIGN"))) await db.exec(`ALTER TABLE "${constraint.table_name}" ADD ${constraint.definition}`)
    for (const constraint of snapshot.constraints.filter(c => snapshot.catalog[c.table_name] && c.definition.startsWith("FOREIGN") && snapshot.catalog[c.definition.match(/REFERENCES ([\w]+)/)?.[1]])) await db.exec(`ALTER TABLE "${constraint.table_name}" ADD ${constraint.definition}`)
    for (const index of snapshot.indexes || []) await db.exec(index.indexdef.replace("CREATE UNIQUE INDEX ", "CREATE UNIQUE INDEX IF NOT EXISTS "))
    const protectedTables = ["price", "price_set", "product_variant_price_set", "product_variant_inventory_item", "promotion_rule", "promotion_rule_value", "product_sales_channel", "product_shipping_profile"]
    const read = async tables => Object.fromEntries(await Promise.all(tables.map(async table => [table, (await db.query(`SELECT * FROM "${table}" ORDER BY 1,2`)).rows])))
    const protectedBefore = await read(protectedTables)
    const allBefore = await read(Object.keys(snapshot.catalog))
    const rollbackBefore = await snapshotCatalog(db)
    await db.exec("BEGIN")
    const first = await consolidate(db)
    assert.equal(first.variant_ids.length, 6)
    assert.deepEqual(await read(protectedTables), protectedBefore, "Prices, stock links and promotions changed")
    const options = (await db.query("SELECT v.sku,o.title,ov.value FROM product_variant v JOIN product_variant_option vo ON vo.variant_id=v.id JOIN product_option_value ov ON ov.id=vo.option_value_id JOIN product_option o ON o.id=ov.option_id WHERE v.product_id=$1 ORDER BY v.sku,o.title", [first.product_id])).rows
    assert.equal(options.length, 12)
    for (const sku of [...new Set(options.map(o => o.sku))]) {
      const choices = options.filter(o => o.sku === sku)
      assert.equal(choices.find(o => o.title === "Finish").value, sku.includes("WHT") ? "Marble" : "Slate")
      assert.equal(choices.find(o => o.title === "Pack Size").value, sku.endsWith("-3") ? "3-Pack" : sku.endsWith("-6") ? "6-Pack" : "Single")
    }
    await db.exec("ROLLBACK")
    assert.deepEqual(await read(Object.keys(snapshot.catalog)), allBefore, "Rollback failed")
    await db.exec("BEGIN")
    const result = await consolidate(db)
    await db.exec("COMMIT")
    assert.equal((await consolidate(db)).already_consolidated, true)
    const afterVariants = (await db.query("SELECT * FROM product_variant ORDER BY id")).rows
    for (const before of snapshot.catalog.product_variant) {
      const after = afterVariants.find(v => v.id === before.id)
      assert(after)
      for (const field of ["id", "sku", "manage_inventory", "allow_backorder", "weight", "thumbnail"]) assert.deepEqual(after[field], before[field])
    }
    const rollbackAfter = await snapshotCatalog(db)
    await db.exec("BEGIN")
    await restoreCatalog(db, rollbackBefore, rollbackAfter)
    await db.exec("COMMIT")
    assert.deepEqual(await read(Object.keys(snapshot.catalog)), allBefore, "Post-commit restore failed")
    console.log(JSON.stringify({ status: "PASS", environment: "isolated PGlite catalog clone", variants: result.variant_ids.length, checks: ["all six finish/pack mappings", "stable variant IDs/SKUs", "unchanged prices/inventory/promotions", "retained historical records", "transaction rollback", "idempotent rerun"] }))
  } finally { await db.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
