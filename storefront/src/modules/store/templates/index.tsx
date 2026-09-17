import PalPicker from "@modules/home/components/pal-picker"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight } from "@medusajs/icons"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export default function StoreTemplate({
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  void countryCode
  return (
    <main className="studio-store">
      <div className="studio-container studio-store-intro">
        <span className="studio-eyebrow">A pal for every session</span>
        <p>Two finishes. One thoughtful little case.</p>
      </div>
      <PalPicker heading="h1" />
      <div className="studio-container studio-store-more">
        <div>
          <h2 className="studio-display">Keep a good routine.</h2>
          <p>
            Simple guides for clean swabs, well-kept gear, and a case that
            travels with you.
          </p>
        </div>
        <LocalizedClientLink href="/blog" className="studio-text-link">
          Explore the field notes <ArrowRight />
        </LocalizedClientLink>
      </div>
    </main>
  )
}
