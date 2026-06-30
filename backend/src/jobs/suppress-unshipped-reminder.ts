import { MedusaContainer } from "@medusajs/framework/types"
import suppressUnshippedReminder from "../scripts/suppress-unshipped-reminder"

export default async function suppressUnshippedReminderJob(
  container: MedusaContainer
) {
  if (process.env.SUPPRESS_UNSHIPPED_REMINDER !== "1") {
    return
  }

  console.log("[suppress-unshipped-reminder] Starting")
  await suppressUnshippedReminder({ container, args: [] })
  console.log("[suppress-unshipped-reminder] Finished")
}

export const config = {
  name: "suppress-unshipped-reminder",
  schedule: {
    cron: "* * * * *",
    concurrency: "forbid" as const,
  },
}
