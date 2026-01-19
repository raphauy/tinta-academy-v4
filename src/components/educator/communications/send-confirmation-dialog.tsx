'use client'

import { Loader2, Mail, AlertTriangle } from 'lucide-react'

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
}

export function SendConfirmationDialog({
  open,
  onOpenChange,
  recipientCount,
  templateName,
  onConfirm,
  isLoading,
}: SendConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Confirmar envío de campaña
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
              </div>

              <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-sm">
                  Esta acción enviará los emails inmediatamente. No se puede
                  deshacer.
                </span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Enviando...' : 'Enviar ahora'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
