import { sdk } from "@lib/config"
import { cache } from "react"

export type DabPalSettings = {
  title: string; subtitle: string; description: string; included: string; capacity: string; construction: string; instructions: string[];
  finishes: Record<"slate" | "marble", { description: string; image: string; detail_image: string }>;
  custom: { enabled: boolean; palettes: Record<"body" | "lid" | "slider", { name: string; value: string }[]> };
}
const black = { name: "Black", value: "#252525" }, white = { name: "White", value: "#f6f6f3" }, pink = { name: "Pink", value: "#f4a8bf" }, amber = { name: "Amber", value: "#ed8f1f" }, sage = { name: "Sage", value: "#8fa78f" }
export const defaultSettings: DabPalSettings = {
  title: "Dab Pal", subtitle: "3D-printed swab case",
  description: "Keep fresh and used swabs separate, with space for your cleaning bottle.",
  included: "Includes case, slider, and empty 1 oz bottle. Swabs and isopropyl alcohol not included.",
  capacity: "80 × 80 × 25 mm closed. Holds 30 regular cotton swabs and the included 1 oz bottle. Specialty swab fit varies.",
  construction: "3D printed to order. Small variations in texture and visible print layers are part of the process.",
  instructions: ["Fill the 1 oz bottle with your preferred 90%+ isopropyl alcohol.", "Load clean cotton swabs into the clean side.", "Swab your Puffco bowl, e-rig chamber, or banger after each dab.", "Slide used swabs behind the slider, toward the hinge, until you can toss them."],
  finishes: {
    slate: { description: "Dark speckled finish. 3D printed to order.", image: "/dab-pal/studio/black.webp", detail_image: "/dab-pal/product-front.png" },
    marble: { description: "Light, marble-look finish. 3D printed, not stone.", image: "/dab-pal/studio/white.webp", detail_image: "/dab-pal/product-front-white.jpg" },
  },
  custom: { enabled: false, palettes: { body: [black, white, pink, amber, sage], lid: [black, white, amber, pink, { name: "Blue", value: "#6f95c9" }], slider: [white, black, amber, pink, sage] } },
}

export const getDabPalSettings = cache(async (): Promise<DabPalSettings> => {
  try {
    const response = await sdk.client.fetch<{ settings: DabPalSettings }>("/store/dab-pal", { cache: "no-store" })
    return response.settings
  } catch (error) {
    // Older backends have no settings route during the rolling deployment.
    if ((error as { status?: number }).status === 404) return defaultSettings
    throw error
  }
})
