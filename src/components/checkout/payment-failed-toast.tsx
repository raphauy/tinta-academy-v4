'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function PaymentFailedToast() {
  useEffect(() => {
    toast.error('El pago no pudo ser procesado. Por favor, intenta nuevamente.', {
      duration: 5000,
    })
  }, [])

  return null
}
