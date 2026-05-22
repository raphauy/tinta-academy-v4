'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import type { DiplomaIssue } from '@prisma/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { sendDiplomasAction } from '@/app/educator/courses/[id]/diploma/actions'

type Props = {
  courseId: string
  recipients: DiplomaIssue[]
  triggerLabel?: string
  triggerClassName?: string
}

export function SendConfirmationDialog({
  courseId,
  recipients,
  triggerLabel = 'Confirmar y enviar',
  triggerClassName,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSend = async () => {
    setSubmitting(true)
    try {
      const result = await sendDiplomasAction(courseId)
      if (result.success) {
        toast.success(
          `Envío iniciado: ${result.data?.succeeded ?? 0} OK, ${result.data?.failed ?? 0} con error`
        )
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName} disabled={recipients.length === 0}>
          <Send className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar diplomas</DialogTitle>
          <DialogDescription>
            Se enviará un email con el diploma adjunto a los siguientes{' '}
            {recipients.length} estudiante{recipients.length === 1 ? '' : 's'}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-72 rounded border">
          <ul className="divide-y">
            {recipients.map((r) => (
              <li key={r.id} className="flex flex-col px-3 py-2">
                <span className="text-sm font-medium">{r.studentName}</span>
                <span className="text-xs text-muted-foreground">
                  {r.emailTo}
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={submitting}>
            {submitting ? 'Enviando…' : `Enviar a ${recipients.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
