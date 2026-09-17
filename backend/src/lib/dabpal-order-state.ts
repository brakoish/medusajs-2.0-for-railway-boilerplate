export function isActiveOperation(order: { stage: string; items: { remaining: number }[]; shipments: { stage: string }[] }) {
  const shipments = order.shipments.filter(shipment => shipment.stage !== "canceled")
  return !["canceled", "refunded"].includes(order.stage) && !(order.items.every(item => item.remaining === 0) && shipments.length > 0 && shipments.every(shipment => shipment.stage === "delivered"))
}
