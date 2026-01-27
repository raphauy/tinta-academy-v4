'use client'

import { useTransition } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar, RefreshCw, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { recalculateExecutionsAction } from '@/app/educator/workflows/actions'

interface RecalculateDatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  affectedCount: number
  onRecalculated: () => void
  onKeepOriginal: () => void
}

export function RecalculateDatesDialog({
  open,
  onOpenChange,
  courseId,
  affectedCount,
  onRecalculated,
  onKeepOriginal,
}: RecalculateDatesDialogProps) {
  const [isPending, startTransition] = useTransition()

  const handleRecalculate = () => {
    startTransition(async () => {
      const result = await recalculateExecutionsAction(courseId)
      if (result.success && result.data) {
        toast.success(
          `Fechas recalculadas: ${result.data.updated} actualizadas, ${result.data.deleted} eliminadas`
        )
        onRecalculated()
        onOpenChange(false)
      } else if (!result.success) {
        toast.error(result.error)
      }
    })
  }

  const handleKeepOriginal = () => {
    onKeepOriginal()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            Fechas del curso modificadas
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Has modificado fechas del curso que afectan a workflows activos.
              </p>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <Clock className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    {affectedCount} email{affectedCount !== 1 ? 's' : ''} programado{affectedCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm">
                    Se recalcularán las fechas de envío basándose en las nuevas fechas del curso.
                  </p>
                </div>
              </div>

              <p className="text-sm">
                ¿Deseas recalcular las fechas de envío o mantener las fechas originales?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="secondary"
            onClick={handleKeepOriginal}
            disabled={isPending}
          >
            Mantener fechas originales
          </Button>
          <Button
            onClick={handleRecalculate}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Recalcular fechas
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
