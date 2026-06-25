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
const cachePath = path.resolve(__dirname, ".pal-map-geocode-cache.json")

const railwayEndpoint = "https://backboard.railway.app/graphql/v2"
const projectId = "83dbf72b-13e9-4284-a99a-caa9f40b801f"
const environmentId = "8c7c24bc-1e35-4de4-a379-f6d95e7830e3"
const postgresServiceId = "8cb2f43b-8a19-47ea-8e70-ef05faae5d80"

const stateAliases = new Map(
  Object.entries({
    ALABAMA: "AL",
    ALASKA: "AK",
    ARIZONA: "AZ",
    ARKANSAS: "AR",
    CALIFORNIA: "CA",
    COLORADO: "CO",
    CONNECTICUT: "CT",
    DELAWARE: "DE",
    FLORIDA: "FL",
    GEORGIA: "GA",
    HAWAII: "HI",
    IDAHO: "ID",
    ILLINOIS: "IL",
    INDIANA: "IN",
    IOWA: "IA",
    KANSAS: "KS",
    KENTUCKY: "KY",
    LOUISIANA: "LA",
    MAINE: "ME",
    MARYLAND: "MD",
    MASSACHUSETTS: "MA",
    MICHIGAN: "MI",
    MINNESOTA: "MN",
    MISSISSIPPI: "MS",
    MISSOURI: "MO",
    MONTANA: "MT",
    NEBRASKA: "NE",
    NEVADA: "NV",
    "NEW HAMPSHIRE": "NH",
    "NEW JERSEY": "NJ",
    "NEW MEXICO": "NM",
    "NEW YORK": "NY",
    "NORTH CAROLINA": "NC",
    "NORTH DAKOTA": "ND",
    OHIO: "OH",
    OKLAHOMA: "OK",
    OREGON: "OR",
    PENNSYLVANIA: "PA",
    "PUERTO RICO": "PR",
    "RHODE ISLAND": "RI",
    "SOUTH CAROLINA": "SC",
    "SOUTH DAKOTA": "SD",
    TENNESSEE: "TN",
    TEXAS: "TX",
    UTAH: "UT",
    VERMONT: "VT",
    VIRGINIA: "VA",
    WASHINGTON: "WA",
    "WEST VIRGINIA": "WV",
    WISCONSIN: "WI",
    WYOMING: "WY",
  })
)

const contiguousStates = new Set([
  "AL",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
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

const normalizeCountry = (value) => {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()

  if (normalized === "US" || normalized === "USA" || normalized === "UNITED STATES") {
    return "US"
  }

  return normalized
}

const locationKey = (location) =>
  `${location.city.toUpperCase()}|${location.province}|${location.country}`

const mergeLocation = (locations, location) => {
  const key = locationKey(location)
  const current = locations.get(key)

  if (!current) {
    locations.set(key, location)
    return
  }

  current.count += location.count
  current.firstOrderDate =
    current.firstOrderDate < location.firstOrderDate
      ? current.firstOrderDate
      : location.firstOrderDate
  current.latestOrderDate =
    current.latestOrderDate > location.latestOrderDate
      ? current.latestOrderDate
      : location.latestOrderDate
}

const parseCsv = (content) => {
  const rows = []
  let row = []
  let field = ""
  let quoted = false

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    const next = content[i + 1]

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"'
        i += 1
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === ",") {
      row.push(field)
      field = ""
    } else if (char === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else if (char !== "\r") {
      field += char
    }
  }

  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...body] = rows
  return body
    .filter((values) => values.some(Boolean))
    .map((values) =>
      Object.fromEntries(header.map((column, index) => [column, values[index] || ""]))
    )
}

const parseEtsyDate = (value) => {
  const [month, day, year] = String(value || "").split("/")
  const fullYear = Number(year) < 100 ? `20${year}` : year
  return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

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
        o.created_at,
        coalesce(sum(
          oi.quantity * case
            when oli.variant_sku like 'DABPAL-6-%' then 6
            when oli.variant_sku like 'DABPAL-3-%' then 3
            else 1
          end
        ), 1)::int as count
      from "order" o
      join order_address a on a.id = o.shipping_address_id
      left join order_item oi on oi.order_id = o.id and oi.deleted_at is null
      left join order_line_item oli on oli.id = oi.item_id and oli.deleted_at is null
      where o.deleted_at is null
        and o.canceled_at is null
        and o.is_draft_order = false
        and a.city is not null
        and a.province is not null
        and coalesce(a.country_code, 'us') = 'us'
      group by o.id, city, province, country, o.created_at
    )
    select
      city,
      province,
      country,
      sum(count)::int as count,
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
    country: normalizeCountry(row.country),
    count: Number(row.count),
    firstOrderDate: row.first_order_date,
    latestOrderDate: row.latest_order_date,
  }))
}

const readEtsyCsv = async (csvPath) => {
  const content = await fs.readFile(csvPath, "utf8")

  return parseCsv(content).map((row) => {
    const date = parseEtsyDate(row["Sale Date"])

    return {
      city: titleCase(row["Ship City"]),
      province: normalizeProvince(row["Ship State"]),
      country: normalizeCountry(row["Ship Country"]),
      count: Number(row["Number of Items"]) || 1,
      firstOrderDate: date,
      latestOrderDate: date,
    }
  })
}

const readCache = async () => {
  try {
    return JSON.parse(await fs.readFile(cachePath, "utf8"))
  } catch {
    return {}
  }
}

const writeCache = async (cache) => {
  await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`)
}

const geocode = async (location, cache) => {
  const key = locationKey(location)

  if (cache[key]) {
    return { ...location, ...cache[key] }
  }

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

  cache[key] = {
    latitude: Number(match.lat),
    longitude: Number(match.lon),
  }

  return {
    ...location,
    ...cache[key],
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
  const etsyPath = process.argv[2]
  const variables = await fetchRailwayVariables()
  const merged = new Map()
  const siteCities = await fetchOrderCities(variables.DATABASE_URL)
  const locations = []
  const cache = await readCache()

  siteCities.forEach((location) => mergeLocation(merged, location))

  if (etsyPath) {
    const etsyCities = await readEtsyCsv(etsyPath)
    etsyCities.forEach((location) => mergeLocation(merged, location))
  }

  const cities = Array.from(merged.values()).filter(
    (location) =>
      location.country === "US" && contiguousStates.has(location.province)
  )

  for (const city of cities) {
    const wasCached = Boolean(cache[locationKey(city)])
    locations.push(await geocode(city, cache))

    if (!wasCached) {
      await new Promise((resolve) => setTimeout(resolve, 1100))
    }
  }

  locations.sort(
    (a, b) =>
      b.count - a.count ||
      a.province.localeCompare(b.province) ||
      a.city.localeCompare(b.city)
  )

  await fs.writeFile(outputPath, serialize(locations))
  await writeCache(cache)
  console.log(`Wrote ${locations.length} Pal map locations`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
