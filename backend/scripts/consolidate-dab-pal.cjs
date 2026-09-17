const assert = require("node:assert/strict")
const { ulid } = require("ulid")

// Run inside the caller's transaction. Variant IDs and every financial,
// inventory and promotion association remain untouched.
async function consolidate(db) {
  const { rows: products } = await db.query("SELECT * FROM product WHERE handle=ANY($1) AND deleted_at IS NULL FOR UPDATE", [["dab-pal-black-speck", "dab-pal-white-speck", "dab-pal-standard"]])
  const merged = products.find(p => p.handle === "dab-pal-standard")
  if (merged) {
    const variants = (await db.query("SELECT sku FROM product_variant WHERE product_id=$1 AND deleted_at IS NULL", [merged.id])).rows
    assert.deepEqual(variants.map(v => v.sku).sort(), ["DABPAL-BLK-SINGLE", "DABPAL-BLK-3", "DABPAL-BLK-6", "DABPAL-WHT-SINGLE", "DABPAL-WHT-3", "DABPAL-WHT-6"].sort())
    return { product_id: merged.id, already_consolidated: true }
  }
  const target = products.find(p => p.handle === "dab-pal-black-speck")
  const source = products.find(p => p.handle === "dab-pal-white-speck")
  assert(target && source, "Both current finish products must exist")
  const variants = (await db.query("SELECT * FROM product_variant WHERE product_id=ANY($1) AND deleted_at IS NULL FOR UPDATE", [[target.id, source.id]])).rows
  const expected = ["DABPAL-BLK-SINGLE", "DABPAL-BLK-3", "DABPAL-BLK-6", "DABPAL-WHT-SINGLE", "DABPAL-WHT-3", "DABPAL-WHT-6"].sort()
  assert.deepEqual(variants.map(v => v.sku).sort(), expected, "Unexpected variants: stop migration")
  for (const table of ["product_shipping_profile", "product_sales_channel"]) {
    const key = table === "product_shipping_profile" ? "shipping_profile_id" : "sales_channel_id"
    const rows = (await db.query(`SELECT product_id,${key} FROM ${table} WHERE product_id=ANY($1) AND deleted_at IS NULL`, [[target.id, source.id]])).rows
    assert.deepEqual(rows.filter(r => r.product_id === target.id).map(r => r[key]).sort(), rows.filter(r => r.product_id === source.id).map(r => r[key]).sort(), `${key} differs between finishes`)
  }
  const options = (await db.query("SELECT * FROM product_option WHERE product_id=$1 AND deleted_at IS NULL", [target.id])).rows
  assert.equal(options.length, 1, "Unexpected target product options")
  assert.equal(options[0].title, "Pack Size")
  const packs = (await db.query("SELECT id,value FROM product_option_value WHERE option_id=$1 AND deleted_at IS NULL", [options[0].id])).rows
  assert.deepEqual(packs.map(p => p.value).sort(), ["Single", "3-Pack", "6-Pack"].sort())
  const finishId = `opt_${ulid()}`
  const slateId = `optval_${ulid()}`, marbleId = `optval_${ulid()}`
  await db.query("INSERT INTO product_option (id,title,product_id,created_at,updated_at) VALUES ($1,'Finish',$2,now(),now())", [finishId, target.id])
  await db.query("INSERT INTO product_option_value (id,value,option_id,created_at,updated_at) VALUES ($1,'Slate',$3,now(),now()),($2,'Marble',$3,now(),now())", [slateId, marbleId, finishId])
  for (const variant of variants) {
    const pack = variant.sku.endsWith("-3") ? "3-Pack" : variant.sku.endsWith("-6") ? "6-Pack" : "Single"
    const marble = variant.sku.startsWith("DABPAL-WHT-")
    await db.query("DELETE FROM product_variant_option WHERE variant_id=$1", [variant.id])
    await db.query("INSERT INTO product_variant_option (variant_id,option_value_id) VALUES ($1,$2),($1,$3)", [variant.id, packs.find(p => p.value === pack).id, marble ? marbleId : slateId])
    await db.query("UPDATE product_variant SET product_id=$2,title=$3,updated_at=now() WHERE id=$1", [variant.id, target.id, `${marble ? "Marble" : "Slate"} / ${pack}`])
  }
  // Keep native Media management usable for both finishes. Duplicate URLs use
  // the existing target image; historical source images are retained.
  const sourceImages = (await db.query("SELECT * FROM image WHERE product_id=$1 AND deleted_at IS NULL", [source.id])).rows
  for (const image of sourceImages) {
    const duplicate = (await db.query("SELECT id FROM image WHERE product_id=$1 AND url=$2 AND deleted_at IS NULL", [target.id, image.url])).rows[0]
    if (!duplicate) await db.query("UPDATE image SET product_id=$2,updated_at=now() WHERE id=$1", [image.id, target.id])
    else {
      const links = (await db.query("SELECT * FROM product_variant_product_image WHERE image_id=$1 AND deleted_at IS NULL", [image.id])).rows
      for (const link of links) {
        const existing = (await db.query("SELECT id FROM product_variant_product_image WHERE variant_id=$1 AND image_id=$2 AND deleted_at IS NULL", [link.variant_id, duplicate.id])).rows[0]
        if (!existing) await db.query("UPDATE product_variant_product_image SET image_id=$2,updated_at=now() WHERE id=$1", [link.id, duplicate.id])
      }
    }
  }
  await db.query("UPDATE product SET handle='dab-pal-standard',title='Dab Pal',subtitle='3D-printed swab case',description=$2,updated_at=now() WHERE id=$1", [target.id, "3D-printed swab case in Slate or Marble. Includes a case, slider, and empty 1 oz bottle. Swabs and isopropyl alcohol not included."])
  await db.query("UPDATE product SET status='draft',title='Dab Pal — Marble (legacy)',updated_at=now() WHERE id=$1", [source.id])
  return { product_id: target.id, legacy_product_id: source.id, variant_ids: variants.map(v => v.id), already_consolidated: false }
}
module.exports = { consolidate }
