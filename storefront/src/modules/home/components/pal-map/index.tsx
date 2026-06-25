import { palLocations } from "./locations"

const bounds = {
  west: -124.75,
  east: -66.9,
  north: 49.4,
  south: 24.5,
}

const pluralize = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

const projectLocation = (longitude: number, latitude: number) => ({
  left: `${((longitude - bounds.west) / (bounds.east - bounds.west)) * 100}%`,
  top: `${((bounds.north - latitude) / (bounds.north - bounds.south)) * 100}%`,
})

export default function PalMap() {
  const states = new Set(palLocations.map((location) => location.province))
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
              From the first site orders, every pin marks a city that has a Dab
              Pal out in the wild.
            </p>

            <dl className="grid grid-cols-3 gap-3 mt-8 max-w-md">
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
                  States
                </dt>
                <dd className="text-2xl font-semibold mt-1">{states.size}</dd>
              </div>
            </dl>
          </div>

          <div className="pal-map-shell">
            <div className="pal-map-surface" aria-label="Dab Pal order map">
              <svg
                className="pal-map-outline"
                viewBox="0 0 1000 620"
                role="img"
                aria-hidden="true"
              >
                <path
                  d="M56 160 130 95l135-23 145 20 130-22 125 48 135-2 120 74-36 80 60 84-60 82 28 72-112 47-150 15-135-30-125 40-140-40-95-70 15-90-65-55 35-75-34-90Z"
                  fill="currentColor"
                />
                <path
                  d="M174 181c148 31 287 25 419-18M152 320c169-28 336-21 501 21M286 512c132-70 275-98 428-84M548 103c-17 169-13 318 12 448M718 122c-37 132-38 269-3 412M372 82c28 166 31 328 9 486"
                  fill="none"
                  opacity="0.35"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>

              <div className="pal-map-label">United States</div>

              {palLocations.map((location) => {
                const position = projectLocation(
                  location.longitude,
                  location.latitude
                )

                return (
                  <div
                    key={`${location.city}-${location.province}`}
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
                      <strong>
                        {location.city}, {location.province}
                      </strong>
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
