'use client'

import { useState, useRef, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import {
  Clock,
  Copy,
  Check,
  Building2,
  Calendar,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  ArrowRight,
  Upload,
  FileText,
  X,
} from 'lucide-react'
import Confetti from 'react-confetti'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { markTransferSentAction } from '@/app/checkout/actions'

interface BankAccountData {
  id: string
  bankName: string
  accountHolder: string
  accountType: string
  accountNumber: string
  currency: string
}

interface OrderData {
  id: string
  orderNumber: string
  finalAmount: number
  currency: string
  transferReference: string | null
  transferProofUrl: string | null
  course: {
    id: string
    title: string
    type: string
    wsetLevel: number | null
    imageUrl: string | null
    startDate: Date | null
    duration: string | null
    location: string | null
    modality: string
    educator: {
      name: string | null
    }
  }
}

interface PendingTransferPageProps {
  order: OrderData
  bankAccounts: BankAccountData[]
}

function formatDate(date: Date | null): string {
  if (!date) return 'Por definir'
  return new Intl.DateTimeFormat('es-UY', {
    dateStyle: 'long',
  }).format(new Date(date))
}

const courseTypeLabels: Record<string, string> = {
  wset: 'WSET',
  taller: 'Taller',
  cata: 'Cata',
  curso: 'Curso',
}

// Hook to get window dimensions using useSyncExternalStore
function useWindowSize() {
  const getSnapshot = () =>
    typeof window !== 'undefined'
      ? JSON.stringify({ width: window.innerWidth, height: window.innerHeight })
      : JSON.stringify({ width: 0, height: 0 })

  const getServerSnapshot = () => JSON.stringify({ width: 0, height: 0 })

  const subscribe = (callback: () => void) => {
    window.addEventListener('resize', callback)
    return () => window.removeEventListener('resize', callback)
  }

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return JSON.parse(snapshot) as { width: number; height: number }
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`${label} copiado`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Error al copiar')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}

export function PendingTransferPage({
  order,
  bankAccounts,
}: PendingTransferPageProps) {
  const { update: updateSession } = useSession()
  const windowSize = useWindowSize()
  const [reference, setReference] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [transferMarked, setTransferMarked] = useState(
    !!order.transferReference || !!order.transferProofUrl
  )
  const [showConfetti, setShowConfetti] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    url: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { course } = order

  // Stop confetti after 5 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande', {
        description: 'El tamaño máximo es 10MB',
      })
      return
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ]
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no permitido', {
        description: 'Usa JPG, PNG, GIF, WebP o PDF',
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('orderId', order.id)

      const response = await fetch('/api/upload/transfer-proof', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el archivo')
      }

      setUploadedFile({
        name: file.name,
        url: data.url,
      })
      toast.success('Comprobante subido correctamente')
    } catch (error) {
      toast.error('Error al subir el comprobante', {
        description: error instanceof Error ? error.message : 'Intenta de nuevo',
      })
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
  }

  const handleMarkTransferSent = async () => {
    setIsSubmitting(true)

    try {
      const result = await markTransferSentAction(
        order.id,
        reference || undefined,
        uploadedFile?.url
      )

      if (!result.success) {
        toast.error('Error al marcar la transferencia', {
          description: result.error,
        })
        setIsSubmitting(false)
        return
      }

      // Update session if a new role was assigned
      if (result.data?.newRole) {
        await updateSession({ role: result.data.newRole })
      }

      toast.success('Transferencia marcada como enviada')
      setTransferMarked(true)
      setShowConfetti(true)
    } catch {
      toast.error('Error inesperado', {
        description: 'Por favor intenta de nuevo',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter bank accounts by order currency (USD for bank transfers)
  const relevantAccounts = bankAccounts.filter(
    (account) => account.currency === order.currency
  )

  return (
    <div className="relative max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 50 }}
        />
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
          <Clock className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold">Pendiente de Pago</h1>
        <p className="text-muted-foreground">
          Tu orden ha sido creada. Realiza la transferencia para completar tu
          inscripcion.
        </p>
      </div>

      {/* Order Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Resumen de tu orden</CardTitle>
            <Badge variant="outline">#{order.orderNumber}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course Info */}
          <div className="flex gap-4">
            {course.imageUrl ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">
                  {courseTypeLabels[course.type] || course.type}
                </Badge>
                {course.wsetLevel && (
                  <Badge variant="outline">Nivel {course.wsetLevel}</Badge>
                )}
              </div>
              <h3 className="font-semibold line-clamp-2">{course.title}</h3>
              {course.educator.name && (
                <p className="text-sm text-muted-foreground">
                  {course.educator.name}
                </p>
              )}
            </div>
          </div>

          {/* Course Details */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground pt-3 border-t">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(course.startDate)}</span>
            </div>
            {course.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{course.location}</span>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="font-medium">Total a transferir</span>
            <span className="text-2xl font-bold text-verde-uva-700">
              {order.currency} {order.finalAmount.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-verde-uva-600" />
            <CardTitle className="text-lg">Datos para la transferencia</CardTitle>
          </div>
          <CardDescription>
            Realiza la transferencia a cualquiera de las siguientes cuentas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {relevantAccounts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No hay cuentas bancarias disponibles para {order.currency}</p>
              <p className="text-sm mt-1">
                Por favor contactanos para recibir los datos de transferencia
              </p>
            </div>
          ) : (
            relevantAccounts.map((account) => (
              <div
                key={account.id}
                className="rounded-lg border bg-muted/30 p-4 space-y-3"
              >
                <div className="font-semibold text-verde-uva-700">
                  {account.bankName}
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Titular</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.accountHolder}</span>
                      <CopyButton text={account.accountHolder} label="Titular" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tipo de cuenta</span>
                    <span className="font-medium">{account.accountType}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Numero de cuenta</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">
                        {account.accountNumber}
                      </span>
                      <CopyButton
                        text={account.accountNumber}
                        label="Numero de cuenta"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Moneda</span>
                    <span className="font-medium">{account.currency}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Transfer Instructions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-verde-uva-600" />
            <CardTitle className="text-lg">Instrucciones</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              Realiza la transferencia por{' '}
              <strong className="text-foreground">
                {order.currency} {order.finalAmount.toFixed(2)}
              </strong>{' '}
              a cualquiera de las cuentas indicadas
            </li>
            <li>
              En el concepto o referencia de la transferencia, incluye tu numero
              de orden:{' '}
              <strong className="text-foreground">{order.orderNumber}</strong>
            </li>
            <li>Una vez realizada la transferencia, marcala como enviada abajo</li>
            <li>
              Verificaremos el pago y te confirmaremos la inscripcion por email
            </li>
          </ol>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Importante</p>
                <p className="text-amber-700 mt-1">
                  Las transferencias pueden demorar hasta 48 horas habiles en ser
                  verificadas. Te notificaremos por email cuando tu pago sea
                  confirmado.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mark as Sent Form */}
      {!transferMarked ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ya realice la transferencia</CardTitle>
            <CardDescription>
              Marca tu transferencia como enviada para que podamos verificarla
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Reference Number */}
            <div className="space-y-2">
              <Label htmlFor="reference">
                Numero de referencia (opcional)
              </Label>
              <Input
                id="reference"
                placeholder="Ej: 123456789"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                disabled={isSubmitting || isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Si tu banco te proporciono un numero de comprobante
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Comprobante de transferencia (opcional)</Label>

              {uploadedFile ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-green-600">Archivo subido</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                    onClick={handleRemoveFile}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isUploading
                      ? 'border-verde-uva-300 bg-verde-uva-50/50'
                      : 'border-muted-foreground/25 hover:border-verde-uva-400 hover:bg-muted/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    disabled={isSubmitting || isUploading}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label
                    htmlFor="proof-upload"
                    className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-verde-uva-600 animate-spin" />
                        <p className="text-sm text-verde-uva-600 font-medium">
                          Subiendo archivo...
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-verde-uva-600">
                            Click para subir
                          </span>{' '}
                          o arrastra el archivo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, JPG, PNG o GIF (max. 10MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              )}
            </div>

            <Button
              onClick={handleMarkTransferSent}
              disabled={isSubmitting || isUploading}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marcar transferencia como enviada
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-green-800">
                  Transferencia marcada como enviada
                </h3>
                <p className="text-sm text-green-700">
                  Estamos verificando tu pago. Te notificaremos por email cuando
                  este confirmado.
                </p>
              </div>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/student/orders">
                  Ver mis ordenes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <p className="text-center text-sm text-muted-foreground">
        Si tienes alguna pregunta sobre el proceso de pago, no dudes en
        contactarnos a{' '}
        <a
          href="mailto:hola@tinta.wine"
          className="text-verde-uva-600 hover:underline"
        >
          hola@tinta.wine
        </a>
      </p>
    </div>
  )
}
