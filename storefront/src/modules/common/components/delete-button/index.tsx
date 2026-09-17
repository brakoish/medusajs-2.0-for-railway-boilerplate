"use client"

import { deleteLineItem } from "@lib/data/cart"
import { dispatchCartChange } from "@lib/util/cart-events"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
}: {
  id: string
  children?: React.ReactNode
  className?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async (id: string) => {
    if (isDeleting) return
    setIsDeleting(true)
    setError("")
    try {
      await deleteLineItem(id)
      dispatchCartChange()
    } catch { setError("Could not remove this item. Please try again.") }
    finally { setIsDeleting(false) }
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
        aria-label="Remove item"
        disabled={isDeleting}
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
        <span>{children}</span>
      </button>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
    </div>
  )
}

export default DeleteButton
