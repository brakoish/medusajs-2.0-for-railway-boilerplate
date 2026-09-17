const tables = ["product", "product_variant", "product_option", "product_option_value", "product_variant_option", "image", "product_variant_product_image", "price", "price_set", "product_variant_price_set", "product_variant_inventory_item", "promotion_rule", "promotion_rule_value", "product_sales_channel", "product_shipping_profile"]
async function snapshotCatalog(db) {
  const catalog = {}
  for (const table of tables) catalog[table] = (await db.query(`SELECT * FROM "${table}" ORDER BY 1,2`)).rows
  const schema = (await db.query("SELECT table_name,column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name=ANY($1) ORDER BY table_name,ordinal_position", [tables])).rows
  const constraints = (await db.query("SELECT conrelid::regclass::text as table_name,pg_get_constraintdef(oid) as definition FROM pg_constraint WHERE conrelid::regclass::text=ANY($1)", [tables])).rows
  const indexes = (await db.query("SELECT tablename,indexname,indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=ANY($1) AND indexdef LIKE 'CREATE UNIQUE%'", [tables])).rows
  return JSON.parse(JSON.stringify({ catalog, schema, constraints, indexes }))
}
module.exports = { snapshotCatalog }
