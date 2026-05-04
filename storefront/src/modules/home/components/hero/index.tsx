import Image from "next/image"

const Hero = () => {
  return (
    <section className="relative w-full bg-black overflow-hidden">
      {/* Background hero image, full-bleed */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/dab-pal/hero.jpg"
          alt="Dab Pal portable Q-tip and isopropyl case on a black background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
        {/* Stronger gradient on mobile so the headline is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 small:via-black/40 small:to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40 small:from-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-[78vh] small:min-h-[88vh] flex items-end pb-10 small:pb-24">
        <div className="content-container w-full">
          <div className="max-w-2xl flex flex-col gap-4 small:gap-6 text-white">
            <span className="uppercase tracking-[0.25em] text-[10px] small:text-xs text-white/60">
              The portable cleaning kit
            </span>
            <h1 className="text-3xl small:text-6xl xl:text-7xl font-semibold leading-[1.1] small:leading-[1.05] tracking-tight">
              The clean banger kit you can actually carry.
            </h1>
            <p className="text-base small:text-xl text-white/75 max-w-xl leading-relaxed">
              30 Q-tips, a 1oz iso bottle, and a slider that keeps clean and dirty separate. Made to order in NY.
            </p>
            <div className="flex flex-wrap items-center gap-3 small:gap-4 pt-1 small:pt-2">
              <a
                href="#shop"
                className="inline-flex items-center justify-center rounded-full bg-white text-black px-6 small:px-8 py-3 small:py-3.5 text-sm small:text-base font-medium hover:bg-white/90 transition-colors"
              >
                Shop now — from $25
              </a>
              <a
                href="#details"
                className="hidden small:inline-flex items-center text-white/80 hover:text-white px-2 py-3.5 text-base"
              >
                See how it works ↓
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
