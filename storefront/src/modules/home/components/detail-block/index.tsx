import Image from "next/image"

const specs = [
  { label: "Capacity", value: "30 regular Q-tips + 1oz iso bottle" },
  { label: "Closure", value: "Friction-fit lid (no magnets)" },
  { label: "Internal slider", value: "Separates used from unused swabs" },
  { label: "Weight", value: "~4 oz packaged" },
  { label: "Colors", value: "Black Speck or White Speck" },
  { label: "Made in", value: "Astoria, NY — made to order" },
  { label: "Compatible with", value: "Puffco Peak, Pro, Proxy, traditional quartz bangers" },
]

export default function DetailBlock() {
  return (
    <section id="details" className="bg-black text-white py-20 small:py-32">
      <div className="content-container">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-12 small:gap-20 items-center">
          <div className="relative aspect-square w-full bg-zinc-900 rounded-lg overflow-hidden">
            <Image
              src="/dab-pal/hero.jpg"
              alt="Dab Pal portable Q-tip and isopropyl case on a black background"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-8">
            <div>
              <span className="uppercase tracking-[0.25em] text-xs text-white/50">
                The details
              </span>
              <h2 className="text-3xl small:text-5xl font-semibold tracking-tight mt-4 leading-tight">
                Everything your Puffco needs. Nothing it doesn't.
              </h2>
              <p className="text-white/70 mt-4 max-w-md leading-relaxed">
                Built for daily Puffco and quartz banger users who care about a clean dab and want their gear organized, at home or on the move.
              </p>
            </div>
            <dl className="divide-y divide-white/10 border-t border-white/10">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="grid grid-cols-3 gap-4 py-4 text-sm"
                >
                  <dt className="text-white/50">{s.label}</dt>
                  <dd className="col-span-2 text-white">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
