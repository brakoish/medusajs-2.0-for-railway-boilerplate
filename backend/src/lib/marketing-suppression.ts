import crypto from "crypto"
import { Pool } from "pg"

const TABLE_NAME = "dabpal_marketing_suppression"

let pool: Pool | null = null
let initialized = false

const getPool = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set")
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_URL.includes("sslmode=require") ||
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
    })
  }

  return pool
}

const ensureTable = async () => {
  if (initialized) return

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      email text PRIMARY KEY,
      reason text NOT NULL DEFAULT 'unsubscribe',
      source text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `)

  initialized = true
}

export const normalizeMarketingEmail = (email: string) =>
  email.trim().toLowerCase()

const getSecret = () =>
  process.env.JWT_SECRET ||
  process.env.COOKIE_SECRET ||
  process.env.MEDUSA_JWT_SECRET ||
  "dabpal-dev-secret"

export const createMarketingToken = (email: string) => {
  const normalized = normalizeMarketingEmail(email)
  return crypto
    .createHmac("sha256", getSecret())
    .update(normalized)
    .digest("base64url")
}

export const verifyMarketingToken = (email: string, token?: string | null) => {
  if (!email || !token) return false

  const expected = createMarketingToken(email)
  const expectedBuffer = Buffer.from(expected)
  const tokenBuffer = Buffer.from(token)
  if (expectedBuffer.length !== tokenBuffer.length) return false

  return crypto.timingSafeEqual(expectedBuffer, tokenBuffer)
}

export const isMarketingSuppressed = async (email: string) => {
  const normalized = normalizeMarketingEmail(email)
  if (!normalized) return true

  await ensureTable()
  const result = await getPool().query(
    `SELECT 1 FROM ${TABLE_NAME} WHERE email = $1 LIMIT 1`,
    [normalized]
  )

  return result.rowCount > 0
}

export const suppressMarketingEmail = async ({
  email,
  reason = "unsubscribe",
  source,
}: {
  email: string
  reason?: string
  source?: string
}) => {
  const normalized = normalizeMarketingEmail(email)
  if (!normalized) return

  await ensureTable()
  await getPool().query(
    `
      INSERT INTO ${TABLE_NAME} (email, reason, source)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET
        reason = EXCLUDED.reason,
        source = EXCLUDED.source
    `,
    [normalized, reason, source || null]
  )
}
