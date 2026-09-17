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
            <LocalizedClientLink href="/store/black-speck">
              Black
            </LocalizedClientLink>
            <LocalizedClientLink href="/store/white-speck">
              White Speck
            </LocalizedClientLink>
          </div>
          <div>
            <h2>A little help</h2>
            <LocalizedClientLink href="/blog">
              Cleaning guides
            </LocalizedClientLink>
            <LocalizedClientLink href="/care">Case care</LocalizedClientLink>
            <LocalizedClientLink href="/#faq">
              Shipping & returns
            </LocalizedClientLink>
            <a
              href="https://www.instagram.com/nslabs_/"
              target="_blank"
              rel="noreferrer"
            >
              Get in touch
            </a>
          </div>
          <div>
            <h2>Your corner</h2>
            <LocalizedClientLink href="/cart">Your cart</LocalizedClientLink>
            <LocalizedClientLink href="/account">
              Your account
            </LocalizedClientLink>
          </div>
        </div>
        <div className="studio-footer-bottom">
          <span>© {new Date().getFullYear()} Dab Pal.</span>
          <span>Small case. Good company.</span>
        </div>
      </div>
    </footer>
  )
}
