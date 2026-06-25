import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"
import pg from "pg"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.resolve(
  __dirname,
  "../src/modules/home/components/pal-map/locations.ts"
)

const railwayEndpoint = "https://backboard.railway.app/graphql/v2"
const projectId = "83dbf72b-13e9-4284-a99a-caa9f40b801f"
const environmentId = "8c7c24bc-1e35-4de4-a379-f6d95e7830e3"
const postgresServiceId = "8cb2f43b-8a19-47ea-8e70-ef05faae5d80"

const stateAliases = new Map([
  ["ARIZONA", "AZ"],
  ["CALIFORNIA", "CA"],
  ["IDAHO", "ID"],
  ["NEBRASKA", "NE"],
  ["OHIO", "OH"],
  ["PENNSYLVANIA", "PA"],
  ["WISCONSIN", "WI"],
])

const normalizeProvince = (value) => {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
  return stateAliases.get(normalized) || normalized
}

const titleCase = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const fetchRailwayVariables = async () => {
  if (!process.env.RAILWAY_TOKEN) {
    throw new Error("RAILWAY_TOKEN is required")
  }

  const query = `
    query Vars($projectId: String!, $environmentId: String!, $serviceId: String!) {
      variables(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId)
    }
  `

  const response = await fetch(railwayEndpoint, {
    method: "POST",
    headers: {
      "Project-Access-Token": process.env.RAILWAY_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { projectId, environmentId, serviceId: postgresServiceId },
    }),
  })

  const body = await response.json()

  if (!response.ok || body.errors?.length) {
    throw new Error("Could not load Railway variables")
  }

  return body.data.variables
}

const fetchOrderCities = async (databaseUrl) => {
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  const result = await client.query(`
    with normalized as (
      select
        initcap(trim(a.city)) as city,
        upper(trim(a.province)) as province,
        upper(trim(a.country_code)) as country,
        o.created_at
      from "order" o
      join order_address a on a.id = o.shipping_address_id
      where o.deleted_at is null
        and o.canceled_at is null
        and o.is_draft_order = false
        and a.city is not null
        and a.province is not null
        and coalesce(a.country_code, 'us') = 'us'
    )
    select
      city,
      province,
      country,
      count(*)::int as count,
      min(created_at)::date::text as first_order_date,
      max(created_at)::date::text as latest_order_date
    from normalized
    group by city, province, country
    order by count desc, province, city
  `)

  await client.end()

  return result.rows.map((row) => ({
    city: titleCase(row.city),
    province: normalizeProvince(row.province),
    country: "US",
    count: Number(row.count),
    firstOrderDate: row.first_order_date,
    latestOrderDate: row.latest_order_date,
  }))
}

const geocode = async (location) => {
  const params = new URLSearchParams({
    format: "jsonv2",
    limit: "1",
    city: location.city,
    state: location.province,
    country: "US",
  })

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { headers: { "User-Agent": "DabPalOps/1.0" } }
  )
  const body = await response.json()
  const match = body[0]

  if (!match) {
    throw new Error(`Could not geocode ${location.city}, ${location.province}`)
  }

  return {
    ...location,
    latitude: Number(match.lat),
    longitude: Number(match.lon),
  }
}

const serialize = (locations) => `export type PalLocation = {
  city: string
  province: string
  country: "US"
  latitude: number
  longitude: number
  count: number
  firstOrderDate: string
  latestOrderDate: string
}

export const palLocations: PalLocation[] = ${JSON.stringify(locations, null, 2)}
`

const main = async () => {
  const variables = await fetchRailwayVariables()
  const cities = await fetchOrderCities(variables.DATABASE_URL)
  const locations = []

  for (const city of cities) {
    locations.push(await geocode(city))
    await new Promise((resolve) => setTimeout(resolve, 1100))
  }

  await fs.writeFile(outputPath, serialize(locations))
  console.log(`Wrote ${locations.length} Pal map locations`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
