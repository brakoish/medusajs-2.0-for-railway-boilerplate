import { MedusaContainer } from "@medusajs/framework/types"
import setupDabback10Promo from "../scripts/setup-dabback10-promo"

export default async function setupDabback10PromoJob(container: MedusaContainer) {
  if (process.env.SETUP_DABBACK10_PROMO !== "1") {
    return
  }

  console.log("[setup-dabback10-promo] Starting")
  await setupDabback10Promo({ container, args: [] })
  console.log("[setup-dabback10-promo] Finished")
}

export const config = {
  name: "setup-dabback10-promo",
  schedule: {
    cron: "* * * * *",
    concurrency: "forbid" as const,
  },
}
