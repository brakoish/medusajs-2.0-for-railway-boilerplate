import { Img } from "@react-email/components"
import * as React from "react"

const LOGO_URL = "https://thedabpal.com/dab-pal/logo/dab-pal-long-amber.png"

const S = {
  logo: {
    display: "block",
    height: "auto",
    margin: "0 auto",
    width: "180px",
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
