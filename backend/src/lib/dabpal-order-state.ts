export function isActiveOperation(order: { stage: string; items: { remaining: number }[]; shipments: { stage: string }[] }) {
  return !["canceled", "refunded"].includes(order.stage) && !(order.items.every(item => item.remaining === 0) && order.shipments.length > 0 && order.shipments.every(shipment => shipment.stage === "delivered"))
}
