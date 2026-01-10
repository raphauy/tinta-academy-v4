'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home, ShoppingBag, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CheckoutPendingError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Checkout pending error:', error)
  }, [error])

  const isNotFound =
    error.message.includes('not found') || error.message.includes('no encontrado')
  const isUnauthorized =
    error.message.includes('unauthorized') || error.message.includes('no autorizado')

  let title = 'Error al cargar la página'
  let description = 'Ocurrió un error al cargar los detalles de tu transferencia pendiente.'
  let suggestion =
    'Si ya realizaste la transferencia, no te preocupes. Tu pago será procesado normalmente.'

  if (isNotFound) {
    title = 'Orden no encontrada'
    description = 'No pudimos encontrar la orden especificada.'
    suggestion = 'Revisa tu historial de compras o contacta a soporte si necesitas ayuda.'
  } else if (isUnauthorized) {
    title = 'Acceso no autorizado'
    description = 'No tienes permiso para ver esta orden.'
    suggestion = 'Asegúrate de haber iniciado sesión con la cuenta correcta.'
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {/* Error icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Error message */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
          <p className="text-sm text-muted-foreground">{suggestion}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/student/orders">
              <ShoppingBag className="w-4 h-4" />
              Mis compras
            </Link>
          </Button>
        </div>

        {/* Contact support */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            ¿Necesitas ayuda con tu transferencia?
          </p>
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <a href="mailto:academy@tinta.wine">
              <Mail className="w-4 h-4" />
              Contactar soporte
            </a>
          </Button>
        </div>

        {/* Home link */}
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/student">
            <Home className="w-4 h-4" />
            Ir a mi panel
          </Link>
        </Button>

        {/* Error digest */}
        {error.digest && (
          <p className="text-xs text-muted-foreground/60">
            Código de error: {error.digest}
          </p>
        )}
      </Card>
    </div>
  )
}
