'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, SendHorizonal } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendTestEmailAction } from '@/app/educator/communications/actions'

const emailSchema = z.string().email('Ingresa un email válido')

interface SendTestEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string
  courseId?: string
}

export function SendTestEmailDialog({
  open,
  onOpenChange,
  templateId,
  courseId,
}: SendTestEmailDialogProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    const result = emailSchema.safeParse(email.trim())

    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setError('')
    setIsSending(true)

    const response = await sendTestEmailAction({
      templateId,
      email: email.trim(),
      courseId,
    })

    setIsSending(false)

    if (response.success) {
      toast.success(`Email de prueba enviado a ${email.trim()}`)
      onOpenChange(false)
      setEmail('')
    } else {
      toast.error(response.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar email de prueba</DialogTitle>
          <DialogDescription>
            Se enviará el email con datos de ejemplo para que puedas verificar
            cómo se ve en tu bandeja de entrada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="test-email">Email de destino</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSending) handleSend()
            }}
            disabled={isSending}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={isSending || !email.trim()}>
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="mr-2 h-4 w-4" />
            )}
            {isSending ? 'Enviando...' : 'Enviar prueba'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
