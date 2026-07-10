import { MedusaContainer } from "@medusajs/framework/types"
import setupPal710Promo from "../scripts/setup-pal710-promo"

export default async function setupPal710PromoJob(container: MedusaContainer) {
  if (process.env.SETUP_PAL710_PROMO !== "1") {
    return
  }

  console.log("[setup-pal710-promo] Starting")
  await setupPal710Promo({ container, args: [] })
  console.log("[setup-pal710-promo] Finished")
}

export const config = {
  name: "setup-pal710-promo",
  schedule: {
    cron: "* * * * *",
    concurrency: "forbid" as const,
  },
}
