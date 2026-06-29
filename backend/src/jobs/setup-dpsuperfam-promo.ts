import { MedusaContainer } from "@medusajs/framework/types"
import setupDPSuperfamPromo from "../scripts/setup-dpsuperfam-promo"

export default async function setupDPSuperfamPromoJob(container: MedusaContainer) {
  if (process.env.SETUP_DPSUPERFAM_PROMO !== "1") {
    return
  }

  console.log("[setup-dpsuperfam-promo] Starting")
  await setupDPSuperfamPromo({ container, args: [] })
  console.log("[setup-dpsuperfam-promo] Finished")
}

export const config = {
  name: "setup-dpsuperfam-promo",
  schedule: {
    cron: "* * * * *",
    concurrency: "forbid" as const,
  },
}
