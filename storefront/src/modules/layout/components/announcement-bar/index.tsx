import LocalizedClientLink from "@modules/common/components/localized-client-link"

const AnnouncementBar = () => {
  return (
    <div className="bg-[#111111] text-white text-[11px] small:text-xs">
      <div className="content-container flex h-9 items-center justify-center gap-x-2 overflow-hidden whitespace-nowrap small:h-10 small:gap-x-4">
        <span className="hidden rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-black small:inline-flex">
          710 sale
        </span>
        <span className="font-medium tracking-wide">
          $7.10 off through Sunday
        </span>
        <span aria-hidden className="h-1 w-1 rounded-full bg-amber-400/90" />
        <span className="tracking-wide text-white/78">
          Use code{" "}
          <span className="font-bold tracking-[0.12em] text-amber-300">
            PAL710
          </span>
        </span>
        <LocalizedClientLink
          href="/store"
          className="ml-1 hidden rounded-full border border-white/16 px-3 py-1 font-semibold uppercase tracking-[0.12em] text-white transition hover:border-amber-300 hover:text-amber-200 small:inline-flex"
        >
          Shop
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default AnnouncementBar
