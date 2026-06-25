import { palLocations } from "./locations"
import InteractivePalMap from "./interactive-map"

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

          <InteractivePalMap locations={palLocations} />
        </div>
      </div>
    </section>
  )
}
