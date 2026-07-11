import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'
import { UnsubscribeConfirm } from './unsubscribe-confirm'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token } = await searchParams

  // Solo verificamos y renderizamos (GET no muta). La baja se ejecuta con el
  // botón "Confirmar baja" (server action), para que los escáneres de links de
  // correo que hacen prefetch no den de baja silenciosamente.
  const email = token ? verifyUnsubscribeToken(token) : null

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        {email && token ? (
          <UnsubscribeConfirm token={token} email={email} />
        ) : (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="items-center text-center">
              <AlertCircle className="size-12 text-muted-foreground mb-2" />
              <CardTitle className="text-xl font-bold">Enlace no válido</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>
                El enlace de baja no es válido o está incompleto. Si el problema
                persiste, escríbenos y te damos de baja manualmente.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
