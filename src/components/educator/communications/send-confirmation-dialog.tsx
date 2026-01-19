'use client'

import { Loader2, Mail, AlertTriangle, CalendarClock, Clock } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'

interface SendConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipientCount: number
  templateName: string
  onConfirm: () => void
  isLoading: boolean
  /** If provided, shows scheduled send info instead of immediate */
  scheduledAt?: string
  /** Human-readable scheduled date/time */
  scheduledAtFormatted?: string
}

export function SendConfirmationDialog({
  open,
  onOpenChange,
  recipientCount,
  templateName,
  onConfirm,
  isLoading,
  scheduledAt,
  scheduledAtFormatted,
}: SendConfirmationDialogProps) {
  const isScheduled = !!scheduledAt

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isScheduled ? (
              <CalendarClock className="h-5 w-5" />
            ) : (
              <Mail className="h-5 w-5" />
            )}
            {isScheduled ? 'Confirmar programación' : 'Confirmar envío de campaña'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Destinatarios:</span>
                  <Badge variant="secondary">{recipientCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plantilla:</span>
                  <span className="font-medium text-foreground">
                    {templateName}
                  </span>
                </div>
                {isScheduled && scheduledAtFormatted && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Programado para:</span>
                    <span className="font-medium text-foreground">
                      {scheduledAtFormatted}
                    </span>
                  </div>
                )}
              </div>

              <div className={`flex items-start gap-2 rounded-md p-3 ${
                isScheduled
                  ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
              }`}>
                {isScheduled ? (
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <span className="text-sm">
                  {isScheduled
                    ? 'Los emails se enviarán automáticamente en la fecha y hora indicadas.'
                    : 'Esta acción enviará los emails inmediatamente. No se puede deshacer.'}
                </span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading
              ? (isScheduled ? 'Programando...' : 'Enviando...')
              : (isScheduled ? 'Programar envío' : 'Enviar ahora')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
