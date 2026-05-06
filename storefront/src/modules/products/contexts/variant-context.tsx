"use client"

/**
 * Tiny context to share the buyer's selected variant between siblings
 * inside the BuySection (gallery on one side, ProductActions on the other).
 *
 * Why this lives here and not in a global store:
 *   - State is scoped to a single PDP / buy-section render.
 *   - We only need the id; downstream components can look up the rest
 *     from the StoreProduct they already have.
 *   - Server components stay server components; only the providers and
 *     the consumers that actually read selection are client.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type Ctx = {
  selectedVariantId: string | null
  setSelectedVariantId: (id: string | null) => void
}

const VariantContext = createContext<Ctx | null>(null)

export const VariantProvider = ({ children }: { children: ReactNode }) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  )
  const value = useMemo(
    () => ({
      selectedVariantId,
      setSelectedVariantId: (id: string | null) => setSelectedVariantId(id),
    }),
    [selectedVariantId]
  )
  return (
    <VariantContext.Provider value={value}>{children}</VariantContext.Provider>
  )
}

/** Read the current selected variant id; returns null when no provider
 *  is mounted (so consumers can render gracefully outside the BuySection). */
export const useSelectedVariantId = (): string | null => {
  const ctx = useContext(VariantContext)
  return ctx ? ctx.selectedVariantId : null
}

/** Push a new selected variant id from a sibling component. No-op when
 *  no provider is mounted. */
export const useSetSelectedVariantId = (): ((id: string | null) => void) => {
  const ctx = useContext(VariantContext)
  return useCallback(
    (id: string | null) => ctx?.setSelectedVariantId(id),
    [ctx]
  )
}
