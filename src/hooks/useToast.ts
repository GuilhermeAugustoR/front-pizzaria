import { useState } from "react"

export const useToast = () => {
  const [toast, setToast] = useState<{ message: string } | null>(null)

  const showToast = (message: string) => {
    setToast({ message })
  }

  const hideToast = () => {
    setToast(null)
  }

  return { toast, showToast, hideToast }
}