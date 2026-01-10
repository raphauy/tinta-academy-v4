'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CheckoutError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Checkout error:', error)
  }, [error])

  // Determine error type for user-friendly messages
  const isNotFound =
    error.message.includes('not found') || error.message.includes('no encontrado')
  const isNetworkError =
    error.message.includes('network') ||
    error.message.includes('fetch') ||
    error.message.includes('ECONNREFUSED')
  const isTimeout =
    error.message.includes('timeout') || error.message.includes('tiempo de espera')

  let title = 'Error en el checkout'
  let description = 'Ocurrió un error al cargar la página de checkout.'
  let suggestion = 'Intenta recargar la página o vuelve más tarde.'

  if (isNotFound) {
    title = 'Curso no encontrado'
    description = 'El curso que buscas no existe o ya no está disponible.'
    suggestion = 'Explora nuestros cursos disponibles para encontrar uno que te interese.'
  } else if (isNetworkError) {
    title = 'Error de conexión'
    description = 'No pudimos conectar con el servidor.'
    suggestion = 'Verifica tu conexión a internet e intenta nuevamente.'
  } else if (isTimeout) {
    title = 'Tiempo de espera agotado'
    description = 'El servidor tardó demasiado en responder.'
    suggestion = 'Intenta nuevamente en unos momentos.'
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
            <Link href="/cursos">
              <ArrowLeft className="w-4 h-4" />
              Ver cursos
            </Link>
          </Button>
        </div>

        {/* Home link */}
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/">
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </Button>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="text-xs text-muted-foreground/60">
            Código de error: {error.digest}
          </p>
        )}
      </Card>
    </div>
  )
}
