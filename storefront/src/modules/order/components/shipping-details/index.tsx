import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

import { orderTracking } from "@lib/util/order-tracking"
import Divider from "@modules/common/components/divider"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Delivery
      </Heading>
      <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
        <div
          className="flex flex-col min-w-0"
          data-testid="shipping-address-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            Shipping Address
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.country_code?.toUpperCase()}
          </Text>
        </div>

        <div
          className="flex flex-col min-w-0 "
          data-testid="shipping-contact-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Contact</Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.phone}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">{order.email}</Text>
        </div>

        <div
          className="flex flex-col min-w-0"
          data-testid="shipping-method-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Method</Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_methods?.[0]?.name} (
            {convertToLocale({
              amount: order.shipping_methods?.[0]?.total ?? 0,
              currency_code: order.currency_code,
            })}
            )
          </Text>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {orderTracking(order.fulfillments).map(shipment => <div key={shipment.id} className="rounded-lg border p-4 text-sm">
          <p className="font-semibold">{shipment.status}</p>
          {shipment.number && <p className="mt-1 break-words">Tracking: {shipment.number}</p>}
          {shipment.url && <a className="underline mt-2 inline-block" href={shipment.url} target="_blank" rel="noreferrer">View carrier tracking</a>}
        </div>)}
        {!order.fulfillments?.length && <p className="text-sm">Tracking will appear here once a label is ready. Label creation does not mean the carrier has received your parcel.</p>}
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails
