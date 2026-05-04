import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-black">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6 px-6">
        <span className="flex flex-col gap-4 max-w-2xl">
          <Heading
            level="h1"
            className="text-4xl small:text-6xl leading-tight text-white font-semibold tracking-tight"
          >
            Dab Pal
          </Heading>
          <Heading
            level="h2"
            className="text-xl small:text-2xl leading-snug text-white/70 font-normal"
          >
            Portable Q-tip and isopropyl alcohol case for Puffco and quartz bangers. Made to order in NY.
          </Heading>
        </span>
        <LocalizedClientLink href="/products/dab-pal">
          <Button variant="secondary" size="large" className="bg-white text-black hover:bg-white/90">
            Shop the Dab Pal
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Hero
