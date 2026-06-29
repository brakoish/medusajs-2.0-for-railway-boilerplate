import { Img } from "@react-email/components"
import * as React from "react"

const LOGO_URL = "https://thedabpal.com/dab-pal/logo/dab-pal-long-amber.png"
const BLACK_PRODUCT_URL = "https://thedabpal.com/dab-pal/product-front.png"
const WHITE_PRODUCT_URL = "https://thedabpal.com/dab-pal/product-front-white.jpg"

const S = {
  logo: {
    display: "block",
    height: "auto",
    margin: "0 auto",
    width: "180px",
  },
  productImage: {
    border: "1px solid #e4e4e7",
    borderRadius: "10px",
    display: "block",
    height: "auto",
    objectFit: "cover" as const,
  },
}

export const DabPalEmailLogo = () => (
  <Img
    alt="Dab Pal"
    height="31"
    src={LOGO_URL}
    style={S.logo}
    width="180"
  />
)

const productImageUrl = (variantTitle?: string | null) =>
  variantTitle?.toLowerCase().includes("white")
    ? WHITE_PRODUCT_URL
    : BLACK_PRODUCT_URL

export const DabPalProductImage = ({
  variantTitle,
  size = 64,
}: {
  variantTitle?: string | null
  size?: number
}) => (
  <Img
    alt="Dab Pal cleaning kit"
    height={String(size)}
    src={productImageUrl(variantTitle)}
    style={{ ...S.productImage, width: `${size}px` }}
    width={String(size)}
  />
)
