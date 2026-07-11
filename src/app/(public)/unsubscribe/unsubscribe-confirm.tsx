'use client'

import { useState } from 'react'
import { MailX, CheckCircle2, Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { unsubscribeAction } from './actions'

interface UnsubscribeConfirmProps {
  token: string
  email: string
}

type Status = 'idle' | 'loading' | 'done' | 'error'

export function UnsubscribeConfirm({ token, email }: UnsubscribeConfirmProps) {
  const [status, setStatus] = useState<Status>('idle')

  const handleConfirm = async () => {
    setStatus('loading')
    const result = await unsubscribeAction(token)
    setStatus(result.success ? 'done' : 'error')
  }

  if (status === 'done') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="size-12 text-primary mb-2" />
          <CardTitle className="text-xl font-bold">Te diste de baja</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>
            No volverás a recibir correos de novedades ni promociones de Tinta
            Academy. Si fue un error, puedes volver a suscribirte desde nuestra
            web.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="items-center text-center">
        <MailX className="size-12 text-muted-foreground mb-2" />
        <CardTitle className="text-xl font-bold">Darse de baja</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center text-muted-foreground">
        <p>
          Vas a dejar de recibir correos de novedades y promociones de Tinta
          Academy enviados a <strong className="text-foreground">{email}</strong>.
        </p>
        {status === 'error' && (
          <p className="text-sm text-destructive">
            No pudimos procesar la baja. Intentá de nuevo en unos minutos.
          </p>
        )}
        <Button
          onClick={handleConfirm}
          disabled={status === 'loading'}
          className="w-full cursor-pointer"
        >
          {status === 'loading' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MailX className="size-4" />
          )}
          Confirmar baja
        </Button>
      </CardContent>
    </Card>
  )
}
