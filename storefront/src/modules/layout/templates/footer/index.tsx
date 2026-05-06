import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-20">
          <div className="flex flex-col gap-y-2 max-w-md">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-base hover:text-ui-fg-base uppercase"
            >
              Dab Pal
            </LocalizedClientLink>
            <Text className="text-ui-fg-subtle txt-small">
              Portable Q-tip and isopropyl alcohol case for cleaning Puffco and quartz bangers. Made to order in NY.
            </Text>
          </div>
          <div className="flex flex-col gap-y-2">
            <span className="txt-small-plus txt-ui-fg-base">Shop</span>
            <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
              <li>
                <LocalizedClientLink
                  href="/#shop"
                  className="hover:text-ui-fg-base"
                >
                  Dab Pal
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/account"
                  className="hover:text-ui-fg-base"
                >
                  Account
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/cart"
                  className="hover:text-ui-fg-base"
                >
                  Cart
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Dab Pal. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  )
}
