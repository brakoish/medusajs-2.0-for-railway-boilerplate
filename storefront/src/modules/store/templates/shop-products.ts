export type ShopProduct = {
  handle: string
  title: string
  subtitle: string
  description: string
  seoDescription?: string
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
      "Black Speck dab swab case with an empty 1oz bottle and clean/dirty slider. Holds 30 regular Q-tips. Swabs and iso not included.",
    seoDescription:
      "Black Speck Dab Pal is a portable Puffco cleaning kit and dab swab case for Q-tips, iso, e-rigs, and quartz bangers.",
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
      "White Speck dab swab case with an empty 1oz bottle and clean/dirty slider. Holds 30 regular Q-tips. Swabs and iso not included.",
    seoDescription:
      "White Speck Dab Pal is a portable dab cleaning kit and swab holder for Puffco Peak, Pro, Proxy, e-rigs, and quartz bangers.",
    image: "/dab-pal/product-front-white.jpg",
    price: "From $25",
    badge: "Made to order",
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
      "Pick the body, lid, and slider colors for a made-to-order Dab Pal printed in NY.",
    seoDescription:
      "Custom Dab Pal lets you choose body, lid, and slider colors for a made-to-order Puffco cleaning kit and dab swab case.",
    image: "/dab-pal/lineup.png",
    price: "$35",
    badge: "Preview",
    cta: "Preview",
    medusaHandle: "dab-pal-custom",
    sku: "DABPAL-CUSTOM-SINGLE",
    available: false,
  },
]

export const getShopProduct = (handle: string) =>
  shopProducts.find((product) => product.handle === handle)
