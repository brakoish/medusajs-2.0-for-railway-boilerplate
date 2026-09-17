const assert = require("node:assert/strict")
const normalize = value => JSON.parse(JSON.stringify(value))
// Restore only this migration's changed fields and inserted options. Stop if
// someone has subsequently edited those fields, rather than overwriting them.
async function restoreCatalog(db, before, after) {
  const variants = before.catalog.product_variant.filter(row => /^DABPAL-(BLK|WHT)-(SINGLE|3|6)$/.test(row.sku) && !row.deleted_at).map(row => row.id)
  const expectedLinks = after.catalog.product_variant_option.filter(row => variants.includes(row.variant_id))
  const currentLinks = (await db.query("SELECT * FROM product_variant_option WHERE variant_id=ANY($1) ORDER BY variant_id,option_value_id", [variants])).rows
  const sortLinks = links => normalize(links).sort((a, b) => `${a.variant_id}${a.option_value_id}`.localeCompare(`${b.variant_id}${b.option_value_id}`))
  assert.deepEqual(sortLinks(currentLinks), sortLinks(expectedLinks), "Variant options changed after migration; stop rollback")
  const changed = []
  for (const table of ["product", "product_variant", "image", "product_variant_product_image"]) {
    for (const oldRow of before.catalog[table]) {
      const newRow = after.catalog[table].find(row => row.id === oldRow.id)
      const keys = Object.keys(oldRow).filter(key => JSON.stringify(oldRow[key]) !== JSON.stringify(newRow?.[key]))
      if (!keys.length) continue
      const current = normalize((await db.query(`SELECT * FROM "${table}" WHERE id=$1 FOR UPDATE`, [oldRow.id])).rows[0])
      for (const key of keys) assert.deepEqual(current[key], newRow[key], `${table}.${key} changed after migration; stop rollback`)
      changed.push({ table, oldRow, keys })
    }
  }
  await db.query("DELETE FROM product_variant_option WHERE variant_id=ANY($1)", [variants])
  for (const row of before.catalog.product_variant_option.filter(row => variants.includes(row.variant_id))) await db.query("INSERT INTO product_variant_option (variant_id,option_value_id) VALUES ($1,$2)", [row.variant_id, row.option_value_id])
  for (const { table, oldRow, keys } of changed) await db.query(`UPDATE "${table}" SET ${keys.map((key, i) => `"${key}"=$${i + 2}`).join(",")} WHERE id=$1`, [oldRow.id, ...keys.map(key => oldRow[key])])
  for (const table of ["product_option_value", "product_option"]) {
    const inserted = after.catalog[table].filter(row => !before.catalog[table].some(old => old.id === row.id))
    for (const row of inserted) {
      const current = normalize((await db.query(`SELECT * FROM "${table}" WHERE id=$1 FOR UPDATE`, [row.id])).rows[0])
      assert.deepEqual(current, row, "New option changed after migration; stop rollback")
      await db.query(`DELETE FROM "${table}" WHERE id=$1`, [row.id])
    }
  }
}
module.exports = { restoreCatalog }
