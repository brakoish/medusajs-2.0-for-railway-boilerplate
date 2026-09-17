import Image from "next/image"
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
      <div className="studio-hero-image">
        <Image
          src="/dab-pal/studio/hero.webp"
          alt="Black Dab Pal case with a bottle and example swabs, shown open"
          fill
          priority
          sizes="(max-width: 700px) 100vw, 50vw"
        />
      </div>
    </section>
  )
}
