"use client"

import { useCallback, useContext, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { RadioGroup } from "@headlessui/react"
import ErrorMessage from "@modules/checkout/components/error-message"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Container, Heading, Text, Tooltip, clx } from "@medusajs/ui"
import { PaymentElement } from "@stripe/react-stripe-js"

import Divider from "@modules/common/components/divider"
import PaymentContainer from "@modules/checkout/components/payment-container"
import PaymentButton from "@modules/checkout/components/payment-button"
import { isStripe as isStripeFunc, paymentInfoMap } from "@lib/constants"
import { StripeContext } from "@modules/checkout/components/payment-wrapper"
import StripeWrapper from "@modules/checkout/components/payment-wrapper/stripe-wrapper"
import { initiatePaymentSession } from "@lib/data/cart"
import { enrichStripePaymentIntent } from "@lib/data/enrich-pi"
import { buildStripeSessionData } from "@lib/util/build-pi-data"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { loadStripe } from "@stripe/stripe-js"

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  // Hide Manual Payment from customers. The provider may still be
  // registered on the region in Medusa admin (set via the seed script),
  // but for retail we only ever want Stripe to be selectable.
  const visiblePaymentMethods = (availablePaymentMethods || []).filter(
    (m: any) => m?.id !== "pp_system_default"
  )

  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentReadyToConfirm, setPaymentReadyToConfirm] = useState(false)
  // Auto-select the only visible method (Stripe) so the customer never sees
  // an empty radio group.
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? visiblePaymentMethods[0]?.id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const isStripe = isStripeFunc(activeSession?.provider_id)
  const hasParentStripeWrapper = useContext(StripeContext)
  const canMountStripe =
    isStripe &&
    activeSession &&
    (hasParentStripeWrapper ||
      Boolean(stripeKey && stripePromise && activeSession.data?.client_secret))

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputCard =
        isStripeFunc(selectedPaymentMethod) && !activeSession

      if (!activeSession) {
        const piData = isStripeFunc(selectedPaymentMethod)
          ? buildStripeSessionData(cart)
          : undefined
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
          data: piData,
        })
        if (isStripeFunc(selectedPaymentMethod)) {
          // Fire-and-forget enrichment (receipt_email, descriptor, shipping).
          enrichStripePaymentIntent(cart.id).catch((e) =>
            console.warn("[payment] enrich-pi failed", e)
          )
        }
        if (shouldInputCard) {
          window.location.assign(pathname + "?step=payment")
        }
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  // Auto-initiate the Stripe payment session as soon as the payment step
  // opens, so PaymentElement renders without an extra "Enter payment
  // details" click. Stripe is the only retail provider for this region.
  useEffect(() => {
    if (!isOpen) return
    if (activeSession) return
    if (paidByGiftcard) return
    if (!isStripeFunc(selectedPaymentMethod)) return
    if (isLoading) return
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      try {
        const piData = isStripeFunc(selectedPaymentMethod)
          ? buildStripeSessionData(cart)
          : undefined
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
          data: piData,
        })
        if (isStripeFunc(selectedPaymentMethod)) {
          enrichStripePaymentIntent(cart.id).catch((e) =>
            console.warn("[payment] enrich-pi failed", e)
          )
        }
        window.location.assign(pathname + "?step=payment")
      } catch (err: any) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeSession, paidByGiftcard, selectedPaymentMethod])

  const renderStripeContent = () => {
    if (!activeSession || !isStripe || !canMountStripe) {
      return null
    }

    const content = (
      <>
        <div className="mt-5 transition-all duration-150 ease-in-out">
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            Choose how you'd like to pay:
          </Text>

          <PaymentElement
            options={{
              layout: "tabs",
              wallets: {
                applePay: "auto",
                googlePay: "auto",
              },
            }}
            onChange={(e) => {
              setPaymentReadyToConfirm(e.complete)
              setError(null)
            }}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <PaymentButton cart={cart} data-testid="submit-order-button" />
          <Text className="txt-small text-ui-fg-subtle">
            By clicking Place Order, you agree to our{" "}
            <LocalizedClientLink
              href="/terms"
              className="underline hover:text-ui-fg-base"
            >
              Terms
            </LocalizedClientLink>{" "}
            and acknowledge our return policy.
          </Text>
        </div>
      </>
    )

    if (hasParentStripeWrapper) {
      return content
    }

    return (
      <StripeWrapper
        paymentSession={activeSession}
        stripeKey={stripeKey}
        stripePromise={stripePromise}
      >
        {content}
      </StripeWrapper>
    )
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && visiblePaymentMethods?.length ? (
            <>
              {visiblePaymentMethods.length > 1 && (
                <RadioGroup
                  value={selectedPaymentMethod}
                  onChange={(value: string) =>
                    setSelectedPaymentMethod(value)
                  }
                >
                  {visiblePaymentMethods
                    .sort((a, b) => {
                      return a.provider_id > b.provider_id ? 1 : -1
                    })
                    .map((paymentMethod) => {
                      return (
                        <PaymentContainer
                          paymentInfoMap={paymentInfoMap}
                          paymentProviderId={paymentMethod.id}
                          key={paymentMethod.id}
                          selectedPaymentOptionId={selectedPaymentMethod}
                        />
                      )
                    })}
                </RadioGroup>
              )}
              {renderStripeContent()}
            </>
          ) : null}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          {/* Combined Place Order CTA. The auto-init effect creates the
              Stripe session as soon as the step opens, so PaymentButton
              picks up an `activeSession` and renders "Place order"
              immediately — no separate "Continue to review" click. */}
          {activeSession && isStripe && !canMountStripe ? (
            <Button size="large" className="mt-6" disabled>
              Loading payment...
            </Button>
          ) : !activeSession || !isStripe ? (
            <Button
              size="large"
              className="mt-6"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={
                (isStripe && !paymentReadyToConfirm) ||
                (!selectedPaymentMethod && !paidByGiftcard)
              }
              data-testid="submit-payment-button"
            >
              {!activeSession && isStripeFunc(selectedPaymentMethod)
                ? " Enter payment details"
                : "Continue"}
            </Button>
          ) : null}
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment method
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[selectedPaymentMethod]?.title ||
                    selectedPaymentMethod}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment details
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>
                    {isStripeFunc(selectedPaymentMethod)
                      ? "Confirm at next step"
                      : "Another step will appear"}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
