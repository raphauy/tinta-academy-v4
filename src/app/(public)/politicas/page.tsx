import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText } from 'lucide-react'

export default function Politicas() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Políticas de Tinta Academy</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/politicas/ajuste-razonable"
                  className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <FileText className="size-5 text-primary" />
                  <span className="text-primary hover:underline font-medium">
                    Política de Ajustes Razonables
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas/conflicto-intereses"
                  className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <FileText className="size-5 text-primary" />
                  <span className="text-primary hover:underline font-medium">
                    Política de Conflicto de Intereses
                  </span>
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
