import { NextRequest, NextResponse } from "next/server"

/**
 * Dab Pal is a single-region storefront (US only). Routes live at the root
 * (`/products/...`, `/checkout`, etc.) and the legacy `/us/*` URLs from the
 * pre-strip era are 301'd to their root equivalent for SEO continuity.
 *
 * Cart / onboarding cookie handling stays the same as the multi-region
 * boilerplate. Region selection is hardcoded to `us` in the data layer.
 */

const COUNTRY = "us"

export async function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl
  const searchParams = request.nextUrl.searchParams

  // 0. Canonical host: www.thedabpal.com -> thedabpal.com (don't split SEO,
  //    don't dilute backlinks). 308 keeps the method on POST checkouts.
  const host = request.headers.get("host") || ""
  if (host === "www.thedabpal.com") {
    return NextResponse.redirect(
      `https://thedabpal.com${pathname}${search}`,
      308
    )
  }

  const isOnboarding = searchParams.get("onboarding") === "true"
  const cartId = searchParams.get("cart_id")
  const checkoutStep = searchParams.get("step")
  const onboardingCookie = request.cookies.get("_medusa_onboarding")
  const cartIdCookie = request.cookies.get("_medusa_cart_id")

  // 1. Permanent redirect away from the legacy /us/* URL space.
  if (pathname === `/${COUNTRY}` || pathname.startsWith(`/${COUNTRY}/`)) {
    const stripped = pathname === `/${COUNTRY}` ? "/" : pathname.slice(`/${COUNTRY}`.length)
    return NextResponse.redirect(`${origin}${stripped}${search}`, 301)
  }

  // 2. Single-product store: collapse the boilerplate listing surfaces
  //    onto the homepage. /products/<anything>, /store, /collections/*,
  //    /categories/* all 301 to /. The home is the canonical PDP.
  //    Keeping them as 301s instead of just deleting the routes so any
  //    indexed/shared links land on a real page instead of 404.
  const SINGLE_PRODUCT_REDIRECT = [
    /^\/products(?:\/|$)/,
    /^\/store(?:\/|$)/,
    /^\/collections(?:\/|$)/,
    /^\/categories(?:\/|$)/,
  ]
  if (SINGLE_PRODUCT_REDIRECT.some((re) => re.test(pathname))) {
    return NextResponse.redirect(`${origin}/${search}`, 301)
  }

  let response = NextResponse.next()

  // 3. Carry through cart_id from query string into a cookie + send the
  //    user to the address step.
  if (cartId && !checkoutStep) {
    const next = new URL(request.nextUrl.href)
    next.searchParams.set("step", "address")
    response = NextResponse.redirect(next.toString(), 307)
    response.cookies.set("_medusa_cart_id", cartId, { maxAge: 60 * 60 * 24 })
    return response
  }

  // 4. Onboarding flag from query string -> cookie.
  if (isOnboarding && !onboardingCookie) {
    response.cookies.set("_medusa_onboarding", "true", {
      maxAge: 60 * 60 * 24,
    })
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|favicon.ico|\\.well-known|.*\\.png|.*\\.jpg|.*\\.gif|.*\\.svg).*)",
  ],
}
