import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IOrderModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { filterShippableOrders, ShippableOrder } from "../../../../lib/shippable-orders"

type BulkOrder = ShippableOrder & {
  id?: string
}

/**
 * GET /admin/bulk-fulfill/orders
 *
 * Returns all unfulfilled orders with address + items for the bulk fulfill UI.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  const query = req.scope.resolve("query")

  const orders = await orderModuleService.listOrders(
    {},
    {
      take: 200,
      order: {
        created_at: "DESC",
      },
      relations: ["shipping_address", "items", "items.detail"],
    }
  )

  res.json({ orders: await filterShippableOrders(query, (orders || []) as BulkOrder[]) })
}
