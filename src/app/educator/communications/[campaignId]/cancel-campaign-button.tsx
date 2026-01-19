'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cancelCampaignAction } from '../actions'

interface CancelCampaignButtonProps {
  campaignId: string
  campaignName: string
}

export function CancelCampaignButton({
  campaignId,
  campaignName,
}: CancelCampaignButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async () => {
    setIsCancelling(true)

    const result = await cancelCampaignAction({ campaignId })

    setIsCancelling(false)

    if (result.success) {
      toast.success('Campaña cancelada', {
        description: 'La campaña programada ha sido cancelada exitosamente.',
      })
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error('Error al cancelar', {
        description: result.error,
      })
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <XCircle className="h-4 w-4" />
          Cancelar envío
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar esta campaña?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de cancelar la campaña &quot;{campaignName}&quot;.
            Esta acción no se puede deshacer y los emails programados no serán enviados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCancelling}>
            Volver
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isCancelling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              'Sí, cancelar campaña'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
