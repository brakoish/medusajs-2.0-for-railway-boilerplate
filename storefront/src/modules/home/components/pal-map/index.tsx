import { palLocations } from "./locations"

const pluralize = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

const mapFrame = {
  left: 4,
  top: 12,
  width: 92,
  height: 76,
}

const projectLocation = (longitude: number, latitude: number) => ({
  left: `${mapFrame.left + ((longitude + 180) / 360) * mapFrame.width}%`,
  top: `${mapFrame.top + ((90 - latitude) / 180) * mapFrame.height}%`,
})

const formatLocation = (location: (typeof palLocations)[number]) =>
  [
    location.city,
    location.province,
    location.country === "US" ? "" : location.country,
  ]
    .filter(Boolean)
    .join(", ")

export default function PalMap() {
  const regions = new Set(
    palLocations
      .map((location) => `${location.country}-${location.province}`)
      .filter((region) => !region.endsWith("-"))
  )
  const countries = new Set(palLocations.map((location) => location.country))
  const total = palLocations.reduce((sum, location) => sum + location.count, 0)

  return (
    <section className="bg-zinc-950 text-white py-20 small:py-32 overflow-hidden">
      <div className="content-container">
        <div className="grid grid-cols-1 large:grid-cols-[0.7fr_1.3fr] gap-10 large:gap-16 items-center">
          <div className="max-w-xl">
            <span className="uppercase tracking-[0.25em] text-xs text-amber-400/80">
              Dab Pal map
            </span>
            <h2 className="text-3xl small:text-5xl font-semibold tracking-tight mt-4 leading-tight">
              Where Dab Pals have landed.
            </h2>
            <p className="text-white/65 mt-5 leading-relaxed">
              Each bubble is a city with a Dab Pal out in the wild.
            </p>

            <dl className="grid grid-cols-2 small:grid-cols-4 gap-3 mt-8 max-w-xl">
              <div className="border border-white/10 bg-white/[0.04] rounded-lg px-4 py-3">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                  Pals
                </dt>
                <dd className="text-2xl font-semibold mt-1">{total}</dd>
              </div>
              <div className="border border-white/10 bg-white/[0.04] rounded-lg px-4 py-3">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                  Cities
                </dt>
                <dd className="text-2xl font-semibold mt-1">
                  {palLocations.length}
                </dd>
              </div>
              <div className="border border-white/10 bg-white/[0.04] rounded-lg px-4 py-3">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                  Regions
                </dt>
                <dd className="text-2xl font-semibold mt-1">{regions.size}</dd>
              </div>
              <div className="border border-white/10 bg-white/[0.04] rounded-lg px-4 py-3">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                  Countries
                </dt>
                <dd className="text-2xl font-semibold mt-1">
                  {countries.size}
                </dd>
              </div>
            </dl>
          </div>

          <div className="pal-map-shell">
            <div className="pal-map-surface" aria-label="Dab Pal order map">
              <div className="pal-map-graticule" aria-hidden="true" />
              <img
                className="pal-map-outline"
                src="/dab-pal/world-map.svg"
                alt=""
                aria-hidden="true"
              />

              {palLocations.map((location) => {
                const position = projectLocation(
                  location.longitude,
                  location.latitude
                )

                return (
                  <div
                    key={`${location.city}-${location.province}-${location.country}`}
                    className="pal-map-pin"
                    style={{
                      left: position.left,
                      top: position.top,
                      ["--pin-size" as string]: `${Math.min(
                        34,
                        18 + location.count * 5
                      )}px`,
                    }}
                  >
                    <span className="pal-map-pin-dot" />
                    <span className="pal-map-tooltip">
                      <strong>{formatLocation(location)}</strong>
                      <span>{pluralize(location.count, "Dab Pal")}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
