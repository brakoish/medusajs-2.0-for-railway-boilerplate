import { Pool } from "pg"

const TABLE_NAME = "dabpal_email_config"

let pool: Pool | null = null
let initialized = false

export type EmailConfig = {
  template: string
  subject: string
  preview: string
  updated_at: string
}

const DEFAULT_CONFIG: Record<string, { subject: string; preview: string }> = {
  "order-placed": {
    subject: "Your Dab Pal is locked in",
    preview: "Nice. Your Dab Pal is locked in and ships from Brooklyn soon.",
  },
  "order-shipped": {
    subject: "Your Dab Pal is out the door",
    preview: "Your Dab Pal is out the door.",
  },
  "abandoned-cart": {
    subject: "Your Dab Pal is still waiting",
    preview: "Your cart saved the cleanup kit.",
  },
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
      template text PRIMARY KEY,
      subject text NOT NULL,
      preview text NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `)

  initialized = true
}

const normalize = (value: string, fallback: string, maxLength: number) => {
  const trimmed = value.trim()
  return (trimmed || fallback).slice(0, maxLength)
}

export const defaultEmailConfig = (template: string) =>
  DEFAULT_CONFIG[template] || {
    subject: "Dab Pal",
    preview: "Dab Pal",
  }

export const getEmailConfig = async (
  template: string,
  fallback = defaultEmailConfig(template)
): Promise<EmailConfig> => {
  await ensureTable()

  const result = await getPool().query<EmailConfig>(
    `
      INSERT INTO ${TABLE_NAME} (template, subject, preview)
      VALUES ($1, $2, $3)
      ON CONFLICT (template) DO NOTHING
      RETURNING template, subject, preview, updated_at::text
    `,
    [template, fallback.subject, fallback.preview]
  )

  if (result.rows[0]) return result.rows[0]

  const existing = await getPool().query<EmailConfig>(
    `
      SELECT template, subject, preview, updated_at::text
      FROM ${TABLE_NAME}
      WHERE template = $1
      LIMIT 1
    `,
    [template]
  )

  return existing.rows[0] || {
    template,
    subject: fallback.subject,
    preview: fallback.preview,
    updated_at: new Date().toISOString(),
  }
}

export const listEmailConfigs = async (templates: string[]) =>
  Promise.all(templates.map((template) => getEmailConfig(template)))

export const updateEmailConfig = async ({
  template,
  subject,
  preview,
}: {
  template: string
  subject: string
  preview: string
}) => {
  await ensureTable()
  const fallback = defaultEmailConfig(template)

  const result = await getPool().query<EmailConfig>(
    `
      INSERT INTO ${TABLE_NAME} (template, subject, preview, updated_at)
      VALUES ($1, $2, $3, now())
      ON CONFLICT (template) DO UPDATE SET
        subject = EXCLUDED.subject,
        preview = EXCLUDED.preview,
        updated_at = now()
      RETURNING template, subject, preview, updated_at::text
    `,
    [
      template,
      normalize(subject, fallback.subject, 120),
      normalize(preview, fallback.preview, 160),
    ]
  )

  return result.rows[0]
}
