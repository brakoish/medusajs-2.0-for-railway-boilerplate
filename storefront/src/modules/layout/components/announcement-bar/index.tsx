/**
 * Announcement bar — thin strip above the main nav.
 *
 * Why it's here:
 *   - Free-shipping/value bars above the nav correlate with one of the
 *     biggest cart-completion lifts (~30%, Baymard) because buyers see
 *     the threshold before they bounce.
 *   - Stating origin + lead time builds trust on a small DTC brand
 *     without forcing the buyer into an "About" page.
 *
 * Design:
 *   - Black background with off-white text, amber dots as separators.
 *     Provides a high-contrast frame that makes the white nav below
 *     pop without piling extra borders on the page.
 *   - Three rotating-friendly slots (we just render them inline for now;
 *     trivial to upgrade to a tiny carousel later).
 */

const items = [
  "Free shipping over $60",
  "Made in NY",
  "Ships in 1–2 days",
]

const AnnouncementBar = () => {
  return (
    <div className="bg-black text-white text-[11px] small:text-xs">
      <div className="content-container flex items-center justify-center gap-x-3 small:gap-x-5 h-8 small:h-9 overflow-hidden whitespace-nowrap">
        {items.map((text, i) => (
          <span key={text} className="flex items-center gap-x-3 small:gap-x-5">
            {i > 0 && (
              <span
                aria-hidden
                className="w-[3px] h-[3px] rounded-full bg-amber-400/90"
              />
            )}
            <span className="tracking-wide">{text}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default AnnouncementBar
