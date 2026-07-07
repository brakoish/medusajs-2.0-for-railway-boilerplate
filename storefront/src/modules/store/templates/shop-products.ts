export type ShopProduct = {
  handle: string
  title: string
  subtitle: string
  description: string
  image: string
  price: string
  badge: string
  cta: string
  medusaHandle?: string
  sku?: string
  available: boolean
}

export const shopProducts: ShopProduct[] = [
  {
    handle: "black-speck",
    title: "Black Speck",
    subtitle: "Original finish",
    description:
      "Matte black speck case with a 1oz iso bottle, 30 Q-tips, and the clean/dirty slider.",
    image: "/dab-pal/product-front.png",
    price: "From $25",
    badge: "Best seller",
    cta: "View product",
    medusaHandle: "dab-pal-black-speck",
    sku: "DABPAL-BLK-SINGLE",
    available: true,
  },
  {
    handle: "white-speck",
    title: "White Speck",
    subtitle: "Bright finish",
    description:
      "White speck case with the same compact bottle, swab storage, and slider layout.",
    image: "/dab-pal/product-front-white.jpg",
    price: "From $25",
    badge: "Ready to ship",
    cta: "View product",
    medusaHandle: "dab-pal-white-speck",
    sku: "DABPAL-WHT-SINGLE",
    available: true,
  },
  {
    handle: "custom",
    title: "Custom",
    subtitle: "Coming soon",
    description:
      "Custom colorways and name plates are next. Black and white are available now.",
    image: "/dab-pal/lineup.png",
    price: "Soon",
    badge: "In progress",
    cta: "Preview",
    available: false,
  },
]

export const getShopProduct = (handle: string) =>
  shopProducts.find((product) => product.handle === handle)
