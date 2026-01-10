'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle, Trash2, XCircle, ToggleLeft } from 'lucide-react'

type ConfirmationType = 'delete' | 'deactivate' | 'cancel' | 'custom'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  type?: ConfirmationType
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => Promise<void>
}

const typeConfig: Record<
  ConfirmationType,
  { icon: typeof AlertTriangle; buttonClass: string }
> = {
  delete: {
    icon: Trash2,
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  deactivate: {
    icon: ToggleLeft,
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  cancel: {
    icon: XCircle,
    buttonClass: 'bg-stone-600 hover:bg-stone-700 text-white',
  },
  custom: {
    icon: AlertTriangle,
    buttonClass: 'bg-[#143F3B] hover:bg-[#0e2c29] text-white',
  },
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  type = 'custom',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
}: ConfirmationDialogProps) {
  const [loading, setLoading] = useState(false)
  const config = typeConfig[type]
  const Icon = config.icon

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                type === 'delete'
                  ? 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                  : type === 'deactivate'
                    ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={config.buttonClass}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Pre-configured confirmation dialogs for common use cases

interface DeleteConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  itemType?: string
  onConfirm: () => Promise<void>
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemName,
  itemType = 'elemento',
  onConfirm,
}: DeleteConfirmationProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      type="delete"
      title={`Eliminar ${itemType}`}
      description={`¿Estas seguro de que deseas eliminar "${itemName}"? Esta accion no se puede deshacer.`}
      confirmLabel="Eliminar"
      onConfirm={onConfirm}
    />
  )
}

interface DeactivateConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  itemType?: string
  onConfirm: () => Promise<void>
}

export function DeactivateConfirmationDialog({
  open,
  onOpenChange,
  itemName,
  itemType = 'elemento',
  onConfirm,
}: DeactivateConfirmationProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      type="deactivate"
      title={`Desactivar ${itemType}`}
      description={`¿Estas seguro de que deseas desactivar "${itemName}"? Podras reactivarlo mas tarde.`}
      confirmLabel="Desactivar"
      onConfirm={onConfirm}
    />
  )
}
