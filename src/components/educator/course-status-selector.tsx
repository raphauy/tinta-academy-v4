'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, Info, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { updateCourseStatusAction } from '@/app/educator/actions'
import type { CourseStatus } from '@prisma/client'

interface CourseStatusSelectorProps {
  courseId: string
  status: CourseStatus
}

// Configuración de estados (excluyendo 'available' que no se usa)
const STATUS_CONFIG: Record<string, { label: string; className: string; description: string }> = {
  draft: {
    label: 'Borrador',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'El curso no es visible al público. Úsalo mientras preparas el contenido.'
  },
  announced: {
    label: 'Anunciado',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Visible al público pero sin inscripciones abiertas. Ideal para generar expectativa.'
  },
  enrolling: {
    label: 'Inscribiendo',
    className: 'bg-green-100 text-green-800 border-green-200',
    description: 'Inscripciones abiertas. Los estudiantes pueden comprar el curso.'
  },
  full: {
    label: 'Completo',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Cupo lleno. El curso es visible pero no acepta más inscripciones.'
  },
  in_progress: {
    label: 'En curso',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'El curso está en marcha. Ya no se aceptan inscripciones.'
  },
  finished: {
    label: 'Finalizado',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    description: 'El curso ha terminado.'
  },
}

// Orden lógico de los estados en el selector
const STATUS_ORDER: CourseStatus[] = [
  'draft',
  'announced',
  'enrolling',
  'full',
  'in_progress',
  'finished',
]

export function CourseStatusSelector({ courseId, status }: CourseStatusSelectorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG.draft

  const handleSelect = (newStatus: CourseStatus) => {
    if (newStatus === status) {
      setOpen(false)
      return
    }

    startTransition(async () => {
      const result = await updateCourseStatusAction(courseId, newStatus)
      setOpen(false)

      if (result.success) {
        toast.success('Estado actualizado', {
          description: `El curso ahora está "${STATUS_CONFIG[newStatus]?.label || newStatus}"`,
        })
        router.refresh()
      } else {
        toast.error('Error al actualizar', {
          description: result.error,
        })
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={isPending}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-semibold transition-colors',
              'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              currentConfig.className
            )}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                {currentConfig.label}
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="start">
          <div className="flex flex-col gap-1">
            {STATUS_ORDER.map((statusOption) => {
              const config = STATUS_CONFIG[statusOption]
              const isSelected = statusOption === status

              return (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() => handleSelect(statusOption)}
                  className={cn(
                    'flex items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors cursor-pointer',
                    'hover:bg-muted focus:outline-none focus:bg-muted',
                    isSelected && 'bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold',
                      config.className
                    )}
                  >
                    {config.label}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Info dialog */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Información sobre estados"
          >
            <Info className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Flujo de estados del curso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Los estados determinan la visibilidad y disponibilidad del curso para los estudiantes.
            </p>
            <div className="space-y-3">
              {STATUS_ORDER.map((statusKey) => {
                const config = STATUS_CONFIG[statusKey]
                return (
                  <div key={statusKey} className="flex items-start gap-3">
                    <span
                      className={cn(
                        'inline-flex shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold',
                        config.className
                      )}
                    >
                      {config.label}
                    </span>
                    <span className="text-sm text-muted-foreground pt-0.5">
                      {config.description}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Flujo típico:</strong> Borrador → Anunciado → Inscribiendo → En curso → Finalizado
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
