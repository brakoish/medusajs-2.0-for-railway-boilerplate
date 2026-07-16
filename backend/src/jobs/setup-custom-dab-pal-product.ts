import { MedusaContainer } from "@medusajs/framework/types"
import setupCustomDabPalProduct from "../scripts/setup-custom-dab-pal-product"

export default async function setupCustomDabPalProductJob(
  container: MedusaContainer
) {
  if (process.env.SETUP_CUSTOM_DAB_PAL_PRODUCT !== "1") {
    return
  }

  console.log("[setup-custom-dab-pal-product] Starting")
  await setupCustomDabPalProduct({ container, args: [] })
  console.log("[setup-custom-dab-pal-product] Finished")
}

export const config = {
  name: "setup-custom-dab-pal-product",
  schedule: {
    cron: "* * * * *",
    concurrency: "forbid" as const,
  },
}
