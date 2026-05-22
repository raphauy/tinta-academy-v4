'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { FileText, Image as ImageIcon, Loader2, Mail, Send } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  diplomaTemplateSchema,
  type DiplomaTemplateInput,
} from '@/lib/validations/diploma'
import {
  renderDiplomaSampleAction,
  sendDiplomaSampleEmailAction,
} from '@/app/educator/courses/[id]/diploma/actions'

type Props = {
  courseId: string
  template: DiplomaTemplateInput
  sampleName: string
  defaultEmail: string
}

type DownloadKind = 'png' | 'pdf'

export function TemplateSampleActions({
  courseId,
  template,
  sampleName,
  defaultEmail,
}: Props) {
  const trimmedSample = sampleName.trim()
  const templateValid = diplomaTemplateSchema.safeParse(template).success
  const disabledReason = !trimmedSample
    ? 'Cargá un nombre de muestra'
    : !templateValid
      ? 'Completá los campos de la plantilla'
      : null
  const isDisabled = disabledReason !== null

  const [downloading, setDownloading] = useState<DownloadKind | null>(null)

  const handleDownload = async (kind: DownloadKind) => {
    setDownloading(kind)
    try {
      const result = await renderDiplomaSampleAction(courseId, {
        template,
        sampleName: trimmedSample,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      const base64 = kind === 'png' ? result.data!.pngBase64 : result.data!.pdfBase64
      const mime = kind === 'png' ? 'image/png' : 'application/pdf'
      const filename = kind === 'png' ? 'diploma-muestra.png' : 'diploma-muestra.pdf'
      triggerBrowserDownload(base64, mime, filename)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">Previsualizar la plantilla</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleDownload('png')}
          disabled={isDisabled || downloading !== null}
          title={disabledReason ?? undefined}
        >
          {downloading === 'png' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="mr-2 h-4 w-4" />
          )}
          Descargar imagen
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleDownload('pdf')}
          disabled={isDisabled || downloading !== null}
          title={disabledReason ?? undefined}
        >
          {downloading === 'pdf' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          Descargar PDF
        </Button>

        <SampleEmailDialog
          courseId={courseId}
          template={template}
          sampleName={trimmedSample}
          defaultEmail={defaultEmail}
          disabled={isDisabled}
          disabledReason={disabledReason}
        />
      </div>
    </div>
  )
}

function triggerBrowserDownload(
  base64: string,
  mime: string,
  filename: string
) {
  const byteChars = atob(base64)
  const bytes = new Uint8Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i)
  const blob = new Blob([bytes], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

type SampleEmailDialogProps = {
  courseId: string
  template: DiplomaTemplateInput
  sampleName: string
  defaultEmail: string
  disabled: boolean
  disabledReason: string | null
}

function SampleEmailDialog({
  courseId,
  template,
  sampleName,
  defaultEmail,
  disabled,
  disabledReason,
}: SampleEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(defaultEmail)
  const [sending, setSending] = useState(false)

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleSend = async () => {
    setSending(true)
    try {
      const result = await sendDiplomaSampleEmailAction(courseId, {
        template,
        sampleName,
        toEmail: email.trim(),
      })
      if (result.success) {
        toast.success(`Email enviado a ${email.trim()}`)
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (sending) return
        if (next) setEmail(defaultEmail)
        setOpen(next)
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          title={disabledReason ?? undefined}
        >
          <Mail className="mr-2 h-4 w-4" />
          Enviar email de muestra
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={!sending}
        onEscapeKeyDown={(e) => {
          if (sending) e.preventDefault()
        }}
        onPointerDownOutside={(e) => {
          if (sending) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Enviar email de muestra</DialogTitle>
          <DialogDescription>
            Vamos a enviar un email idéntico al que reciben los estudiantes
            usando los valores actuales de la plantilla (aunque no estén
            guardados).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="sample-email-input" className="text-xs">
            Email destino
          </Label>
          <Input
            id="sample-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sending}
            autoFocus
            placeholder="vos@ejemplo.com"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={sending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!emailLooksValid || sending}
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
