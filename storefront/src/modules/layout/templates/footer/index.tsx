import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DabPalLogoLong } from "@modules/common/components/dab-pal-logo"

export default function Footer() {
  return (
    <footer className="studio-footer">
      <div className="studio-container">
        <div className="studio-footer-top">
          <div>
            <LocalizedClientLink
              href="/"
              aria-label="Dab Pal home"
              className="studio-footer-logo"
            >
              <DabPalLogoLong />
            </LocalizedClientLink>
            <p>
              A little order for every session.
              <br />
              Made to order in Astoria, NY.
            </p>
          </div>
          <div>
            <h2>Find your Pal</h2>
            <LocalizedClientLink href="/store">
              Shop all finishes
            </LocalizedClientLink>
            <LocalizedClientLink href="/store?finish=slate">
              Slate
            </LocalizedClientLink>
            <LocalizedClientLink href="/store?finish=marble">
              Marble
            </LocalizedClientLink>
          </div>
          <div>
            <h2>A little help</h2>
            <LocalizedClientLink href="/blog">
              Cleaning guides
            </LocalizedClientLink>
            <LocalizedClientLink href="/care">Case care</LocalizedClientLink>
            <LocalizedClientLink href="/shipping-returns">
              Shipping & returns
            </LocalizedClientLink>
            <a
              href="mailto:hello@thedabpal.com"
              rel="noreferrer"
            >
              Get in touch
            </a>
          </div>
          <div>
            <h2>Your corner</h2>
            <LocalizedClientLink href="/about">About Dab Pal</LocalizedClientLink>
            <LocalizedClientLink href="/contact">Contact & help</LocalizedClientLink>
            <LocalizedClientLink href="/cart">Your cart</LocalizedClientLink>
            <LocalizedClientLink href="/account">
              Your account
            </LocalizedClientLink>
          </div>
        </div>
        <div className="studio-footer-bottom">
          <span>© {new Date().getFullYear()} Dab Pal.</span>
          <div className="flex gap-6"><LocalizedClientLink href="/privacy">Privacy</LocalizedClientLink><LocalizedClientLink href="/terms">Terms</LocalizedClientLink></div>
        </div>
      </div>
    </footer>
  )
}
