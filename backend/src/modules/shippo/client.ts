import { MedusaError } from "@medusajs/framework/utils"
import {
  ShippoAddress,
  ShippoParcel,
  ShippoRefund,
  ShippoShipment,
  ShippoTransaction,
} from "./types"

export type ShippoClientOptions = {
  api_token: string
  /** API root override (test env, custom proxy). Defaults to https://api.goshippo.com */
  api_url?: string
  /** Shippo API version header (default 2018-02-08, matches dashboard default). */
  api_version?: string
}

const DEFAULT_API_URL = "https://api.goshippo.com"

export class ShippoClient {
  private readonly token: string
  private readonly baseUrl: string
  private readonly apiVersion: string

  constructor(opts: ShippoClientOptions) {
    if (!opts?.api_token) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Shippo provider requires api_token"
      )
    }
    this.token = opts.api_token
    this.baseUrl = (opts.api_url || DEFAULT_API_URL).replace(/\/+$/, "")
    this.apiVersion = opts.api_version || "2018-02-08"
  }

  private async request<T>(
    path: string,
    init: RequestInit & { method?: string } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      Authorization: `ShippoToken ${this.token}`,
      "Content-Type": "application/json",
      "Shippo-API-Version": this.apiVersion,
      ...((init.headers as Record<string, string>) || {}),
    }
    const res = await fetch(url, { ...init, headers })

    if (!res.ok) {
      let body: unknown
      try {
        body = await res.json()
      } catch {
        body = await res.text()
      }
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Shippo ${init.method || "GET"} ${path} failed: ${res.status} ${
          res.statusText
        } ${typeof body === "string" ? body : JSON.stringify(body)}`
      )
    }
    return (await res.json()) as T
  }

  /**
   * Create a shipment and synchronously return rates.
   * `async: false` makes Shippo wait until rates are computed (~600ms-2s).
   */
  async createShipment(input: {
    address_from: ShippoAddress
    address_to: ShippoAddress
    parcels: ShippoParcel[]
    extra?: Record<string, unknown>
  }): Promise<ShippoShipment> {
    return this.request<ShippoShipment>("/shipments", {
      method: "POST",
      body: JSON.stringify({ ...input, async: false }),
    })
  }

  async getShipment(id: string): Promise<ShippoShipment> {
    return this.request<ShippoShipment>(`/shipments/${id}`)
  }

  /**
   * Purchase a label for a specific rate. Synchronous so we get the label_url back
   * in the response and can stash it on the fulfillment record immediately.
   */
  async createTransaction(input: {
    rate: string
    label_file_type?: "PDF" | "PDF_4x6" | "PNG" | "ZPLII"
    metadata?: string
  }): Promise<ShippoTransaction> {
    return this.request<ShippoTransaction>("/transactions", {
      method: "POST",
      body: JSON.stringify({
        ...input,
        async: false,
        label_file_type: input.label_file_type || "PDF_4x6",
      }),
    })
  }

  async getTransaction(id: string): Promise<ShippoTransaction> {
    return this.request<ShippoTransaction>(`/transactions/${id}`)
  }

  /**
   * Void a label and request a refund. Only works for transactions whose label
   * has not yet been used (Shippo enforces a 24h-ish cancellation window).
   */
  async refundTransaction(transactionId: string): Promise<ShippoRefund> {
    return this.request<ShippoRefund>("/refunds", {
      method: "POST",
      body: JSON.stringify({ transaction: transactionId, async: false }),
    })
  }
}
