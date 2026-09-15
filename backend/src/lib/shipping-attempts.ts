import { Pool, PoolClient } from "pg"
import { AsyncLocalStorage } from "node:async_hooks"

const lockConnection = new AsyncLocalStorage<PoolClient>()

// A durable purchase reservation survives workflow rollback, process restarts,
// and lost Shippo responses. Never clear it automatically or repurchase on retry.
let pool: Pool | undefined
let initialized: Promise<unknown> | undefined

async function db() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
  }
  if (!initialized) {
    initialized = pool
      .query(
        `CREATE TABLE IF NOT EXISTS dabpal_shipping_attempt (
      order_id text PRIMARY KEY, fulfillment_id text, state text NOT NULL,
      details jsonb NOT NULL DEFAULT '{}'::jsonb,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
      )
      .catch((error) => {
        initialized = undefined
        throw error
      })
  }
  await initialized
  return pool
}

export async function claimShippingAttempt(
  orderId: string,
  fulfillmentId?: string,
) {
  const result = await (lockConnection.getStore() || (await db())).query(
    `INSERT INTO dabpal_shipping_attempt (order_id, fulfillment_id, state)
     VALUES ($1, $2, 'processing') ON CONFLICT (order_id) DO NOTHING RETURNING order_id`,
    [orderId, fulfillmentId || null],
  )
  if (!result.rowCount)
    throw new Error(
      "A label purchase already exists or needs review. Refresh shipping progress before taking another action.",
    )
}

export async function recordShippingAttempt(
  orderId: string,
  state: string,
  details: Record<string, unknown>,
) {
  await (lockConnection.getStore() || (await db())).query(
    `UPDATE dabpal_shipping_attempt SET state=$2, details=details || $3::jsonb, updated_at=now() WHERE order_id=$1`,
    [orderId, state, JSON.stringify(details)],
  )
}

export type ShippingAttempt = {
  order_id: string
  fulfillment_id: string | null
  state: string
  details: Record<string, any>
  updated_at: Date
}

export async function shippingAttempts(
  orderIds?: string[],
): Promise<ShippingAttempt[]> {
  const result = await (lockConnection.getStore() || (await db())).query(
    `SELECT * FROM dabpal_shipping_attempt ${orderIds ? "WHERE order_id = ANY($1::text[])" : ""}`,
    orderIds ? [orderIds] : [],
  )
  return result.rows
}

export async function closeShippingAttempts() {
  await pool?.end()
  pool = undefined
  initialized = undefined
}

export async function withShippingLock<T>(
  key: string,
  work: () => Promise<T>,
): Promise<T> {
  const existing = lockConnection.getStore()
  const client = existing || (await (await db()).connect())
  let locked = false
  try {
    const result = await client.query(
      "SELECT pg_try_advisory_lock(hashtext('dabpal-shipping'), hashtext($1)) AS locked",
      [key],
    )
    locked = result.rows[0].locked
    if (!locked)
      throw new Error(
        "A shipping update is already in progress. Refresh shortly.",
      )
    return await lockConnection.run(client, work)
  } finally {
    try {
      if (locked)
        await client.query(
          "SELECT pg_advisory_unlock(hashtext('dabpal-shipping'), hashtext($1))",
          [key],
        )
      if (!existing) client.release()
    } catch (error) {
      if (!existing) client.release(true)
      throw error
    }
  }
}
