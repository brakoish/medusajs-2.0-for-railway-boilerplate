import crypto from "crypto"
import { Pool } from "pg"

const TABLE_NAME = "dabpal_email_log"

let pool: Pool | null = null
let initialized = false

type EmailLogStatus = "sent" | "failed"

export type EmailLogRow = {
  id: string
  created_at: string
  template: string
  subject: string | null
  recipient: string
  sender: string | null
  status: EmailLogStatus
  provider: string
  provider_message_id: string | null
  error: string | null
  tags: { name: string; value: string }[] | null
}

export type EmailFlowStat = {
  template: string
  status: EmailLogStatus
  count: number
  last_sent_at: string | null
}

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
      id text PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT now(),
      template text NOT NULL,
      subject text,
      recipient text NOT NULL,
      sender text,
      status text NOT NULL,
      provider text NOT NULL DEFAULT 'resend',
      provider_message_id text,
      error text,
      tags jsonb
    )
  `)

  await getPool().query(`
    CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_created_at_idx
      ON ${TABLE_NAME} (created_at DESC)
  `)

  await getPool().query(`
    CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_template_idx
      ON ${TABLE_NAME} (template, created_at DESC)
  `)

  initialized = true
}

export const logEmailSend = async ({
  template,
  subject,
  recipient,
  sender,
  status,
  providerMessageId,
  error,
  tags,
}: {
  template: string
  subject?: string | null
  recipient: string
  sender?: string | null
  status: EmailLogStatus
  providerMessageId?: string | null
  error?: string | null
  tags?: { name: string; value: string }[] | null
}) => {
  await ensureTable()

  await getPool().query(
    `
      INSERT INTO ${TABLE_NAME}
        (id, template, subject, recipient, sender, status, provider_message_id, error, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      crypto.randomUUID(),
      template,
      subject || null,
      recipient,
      sender || null,
      status,
      providerMessageId || null,
      error || null,
      tags ? JSON.stringify(tags) : null,
    ]
  )
}

export const listEmailLogs = async (limit = 50) => {
  await ensureTable()

  const result = await getPool().query<EmailLogRow>(
    `
      SELECT id, created_at, template, subject, recipient, sender, status,
        provider, provider_message_id, error, tags
      FROM ${TABLE_NAME}
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [Math.min(Math.max(limit, 1), 100)]
  )

  return result.rows
}

export const emailLogStats = async () => {
  await ensureTable()

  const result = await getPool().query<EmailFlowStat>(`
    SELECT
      template,
      status,
      count(*)::int AS count,
      max(created_at)::text AS last_sent_at
    FROM ${TABLE_NAME}
    WHERE created_at >= now() - interval '30 days'
    GROUP BY template, status
    ORDER BY template ASC, status ASC
  `)

  return result.rows
}
