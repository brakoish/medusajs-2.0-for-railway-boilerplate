import HeroImage from "./hero-image"
import { ArrowDown, ArrowRight } from "@medusajs/icons"

export default function Hero() {
  return (
    <section className="studio-hero studio-container">
      <div className="studio-hero-copy">
        <h1 className="studio-display">
          Keep the
          <br />
          session clean
        </h1>
        <p>Keep clean and used swabs separate.</p>
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
