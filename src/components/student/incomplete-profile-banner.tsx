'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Cuantos campos se nombran antes de resumir el resto en "y N datos mas". */
const MAX_LISTED_FIELDS = 3

function formatMissingFields(fields: string[]): string {
  if (fields.length === 1) return fields[0]

  if (fields.length <= MAX_LISTED_FIELDS) {
    return `${fields.slice(0, -1).join(', ')} y ${fields[fields.length - 1]}`
  }

  const remaining = fields.length - MAX_LISTED_FIELDS
  return `${fields.slice(0, MAX_LISTED_FIELDS).join(', ')} y ${remaining} dato${
    remaining > 1 ? 's' : ''
  } más`
}

interface IncompleteProfileBannerProps {
  missingFields: string[]
}

export function IncompleteProfileBanner({
  missingFields,
}: IncompleteProfileBannerProps) {
  const pathname = usePathname()

  // En el propio perfil el aviso sobra: el formulario ya marca lo que falta
  if (pathname.startsWith('/student/profile')) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3 -mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 max-w-screen-xl mx-auto px-2">
        <div className="flex items-start gap-2 flex-1 min-w-0 text-amber-800 dark:text-amber-200">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p className="text-sm">
            <span className="font-medium">Faltan datos en tu perfil.</span>{' '}
            Completa {formatMissingFields(missingFields)} para que podamos emitir
            tu diploma y tu factura.
          </p>
        </div>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="shrink-0 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900"
        >
          <Link href="/student/profile">Completar perfil</Link>
        </Button>
      </div>
    </div>
  )
}
