import { palLocations } from "./locations"
import InteractivePalMap from "./interactive-map"

export default function PalMap() {
  const usLocations = palLocations.filter(
    (location) => location.country === "US" && location.province !== "PR"
  )
  const states = new Set(usLocations.map((location) => location.province))
  const total = usLocations.reduce((sum, location) => sum + location.count, 0)

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
              Each bubble is a US city with a Dab Pal out in the wild.
            </p>

            <dl className="grid grid-cols-3 gap-3 mt-8 max-w-xl">
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
                  {usLocations.length}
                </dd>
              </div>
              <div className="border border-white/10 bg-white/[0.04] rounded-lg px-4 py-3">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                  States
                </dt>
                <dd className="text-2xl font-semibold mt-1">
                  {states.size}
                </dd>
              </div>
            </dl>
          </div>

          <InteractivePalMap locations={usLocations} />
        </div>
      </div>
    </section>
  )
}
