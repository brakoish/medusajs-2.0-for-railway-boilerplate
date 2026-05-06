"use client"

/**
 * NavShell — wraps the nav bar with a scroll-aware background.
 *
 * - Above the fold: translucent (white/70 + backdrop blur) so the hero
 *   shows through cleanly. No hard border line.
 * - On scroll: solid white + a subtle hairline shadow so it sits on
 *   page content without harsh edges.
 *
 * Lives as a client component so we can listen to `scroll`. The nav's
 * children are server-rendered; only the wrapper is client.
 */

import { useEffect, useState } from "react"

const NavShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`relative h-14 small:h-16 transition-[background-color,box-shadow,backdrop-filter] duration-200 ${
        scrolled
          ? "bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          : "bg-white/70 backdrop-blur-md"
      }`}
    >
      {children}
    </header>
  )
}

export default NavShell
