import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import ExpressCheckout from "@modules/checkout/components/express-checkout"
import Payment from "@modules/checkout/components/payment"
import RecoveryPanel from "@modules/checkout/components/recovery-panel"
import Shipping from "@modules/checkout/components/shipping"
import CheckoutStepFocus from "@modules/checkout/components/step-focus"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  return (
    <div>
      <CheckoutStepFocus />
      <div className="w-full grid grid-cols-1 gap-y-8">
        <div>
          <ExpressCheckout cart={cart} />
        </div>
        <div id="checkout-address" tabIndex={-1} className="scroll-mt-6 focus:outline-none">
          <Addresses cart={cart} customer={customer} />
        </div>

        <div id="checkout-delivery" tabIndex={-1} className="scroll-mt-6 focus:outline-none">
          {shippingMethods === null ? (
            <RecoveryPanel message="Shipping options could not load. Your address and cart are saved. Please try again." />
          ) : (
            <Shipping cart={cart} availableShippingMethods={shippingMethods} />
          )}
        </div>

        <div id="checkout-payment" tabIndex={-1} className="scroll-mt-6 focus:outline-none">
          {/* Payment step ends with the Place Order button itself — no
              separate Review step. Cuts a click from the funnel. */}
          {paymentMethods === null ? (
            <RecoveryPanel message="Payment options could not load. Your cart is saved. Please try again." />
          ) : (
            <Payment cart={cart} availablePaymentMethods={paymentMethods} />
          )}
        </div>
      </div>
    </div>
  )
}
