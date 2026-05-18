import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

/**
 * POST /admin/fix-single-variants
 *
 * One-time fix: DABPAL-1-BLK and DABPAL-1-WHT lost their Pack Size option
 * value when "1-Pack" was renamed to "Single". Re-attaches the existing
 * "Single" option value (optval_01KRHDXCDCS5GRSB0YYVHBHNWS) to both
 * variants directly in the product_variant_option table.
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    const SINGLE_OPTVAL_ID = "optval_01KRHDXCDCS5GRSB0YYVHBHNWS"
    const variants = [
      { id: "variant_01KREB21QZ5REXYNFVME6C22R2", sku: "DABPAL-1-WHT" },
      { id: "variant_01KREB7MPCF6RAXSQEXACNQT7K", sku: "DABPAL-1-BLK" },
    ]

    // Find the actual table name (Medusa 2.x may use product_variant_option or similar)
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name ILIKE '%variant%option%'
    `)
    const tables = tableCheck.rows.map((r: any) => r.table_name)

    const results: any[] = []

    for (const variant of variants) {
      // Check what Pack Size options currently exist for this variant
      let existing: any[] = []
      for (const table of tables) {
        try {
          const cols = await client.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
            [table]
          )
          const colNames = cols.rows.map((r: any) => r.column_name)
          if (colNames.includes("variant_id") && colNames.includes("option_value_id")) {
            const r = await client.query(
              `SELECT * FROM ${table} WHERE variant_id = $1`,
              [variant.id]
            )
            existing = r.rows
            // Insert if not already there
            const alreadyHasSingle = r.rows.some((row: any) => row.option_value_id === SINGLE_OPTVAL_ID)
            if (!alreadyHasSingle) {
              await client.query(
                `INSERT INTO ${table} (variant_id, option_value_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [variant.id, SINGLE_OPTVAL_ID]
              )
              results.push({ sku: variant.sku, table, status: "inserted", existing_before: r.rows.length })
            } else {
              results.push({ sku: variant.sku, table, status: "already_present" })
            }
            break
          }
        } catch (e: any) {
          results.push({ sku: variant.sku, table, error: e.message })
        }
      }
    }

    res.json({ tables_found: tables, results })
  } finally {
    await client.end()
  }
}
