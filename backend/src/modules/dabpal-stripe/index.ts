import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import DabPalStripeService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [DabPalStripeService],
})
