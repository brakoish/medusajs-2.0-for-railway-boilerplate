import HeroImage from "./hero-image"
import { ArrowDown, ArrowRight } from "@medusajs/icons"

export default function Hero() {
  return (
    <section className="studio-hero studio-container">
      <div className="studio-hero-copy">
        <h1>
          <span className="studio-eyebrow studio-hero-kicker">
            Cleaning kit for Puffco &amp; e-rigs
          </span>
          <span className="studio-display">
            Keep the
            <br />
            session clean
          </span>
        </h1>
        <p>Clean swabs, used swabs and your iso, in one pocket case.</p>
        <div className="studio-hero-actions">
          <a href="#shop" className="studio-button">
            Pick your Pal <ArrowDown />
          </a>
          <a href="#how-it-works" className="studio-text-link">
            How it works <ArrowRight />
          </a>
        </div>
      </div>
      <HeroImage />
    </section>
  )
}
