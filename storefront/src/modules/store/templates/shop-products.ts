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
    title: "Slate",
    subtitle: "Dark speckled finish",
    description:
      "A 3D-printed swab case in a dark speckled finish. Keep fresh and used swabs separate, with room for 30 regular Q-tips and the included empty 1 oz bottle. Swabs and iso not included.",
    seoDescription:
      "Dab Pal — Slate: a 3D-printed dab swab case in a dark speckled finish. Includes a divider and empty 1 oz bottle. Made to order in Astoria, NY.",
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
    title: "Marble",
    subtitle: "Marble-look finish",
    description:
      "A 3D-printed swab case with a light, marble-look finish. Keep fresh and used swabs separate, with room for 30 regular Q-tips and the included empty 1 oz bottle. Swabs and iso not included.",
    seoDescription:
      "Dab Pal — Marble: a 3D-printed dab swab case with a marble-look finish. Includes a divider and empty 1 oz bottle. Made to order in Astoria, NY.",
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
