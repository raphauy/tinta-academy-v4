'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Receipt,
  User,
  BookOpen,
  Calendar,
  CreditCard,
  Ticket,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  MessageSquare,
  Copy,
  Check,
  Loader2,
  FileImage,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import type { Order, OrderStatus, PaymentMethod } from '@prisma/client'

type OrderWithRelations = Order & {
  user: { id: string; email: string; name: string | null }
  course: { id: string; title: string }
  coupon?: { id: string; code: string; discountPercent: number } | null
}

interface OrderDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderWithRelations | null
  onMarkAsPaid?: (orderId: string) => Promise<void>
}

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  created: {
    label: 'Creada',
    icon: Clock,
    className:
      'bg-stone-50 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  },
  pending_payment: {
    label: 'Pendiente',
    icon: Clock,
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  },
  payment_processing: {
    label: 'Procesando',
    icon: AlertCircle,
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  },
  paid: {
    label: 'Pagado',
    icon: CheckCircle,
    className:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  rejected: {
    label: 'Rechazado',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  },
  refunded: {
    label: 'Reembolsado',
    icon: RotateCcw,
    className:
      'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    className:
      'bg-stone-50 text-stone-500 dark:bg-stone-800 dark:text-stone-500',
  },
}

const methodLabels: Record<PaymentMethod, string> = {
  mercadopago: 'MercadoPago',
  bank_transfer: 'Transferencia Bancaria',
  free: 'Gratuito',
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function OrderDetailDialog({
  open,
  onOpenChange,
  order,
  onMarkAsPaid,
}: OrderDetailDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!order) return null

  const status = statusConfig[order.status] || statusConfig.created
  const StatusIcon = status.icon
  const canMarkAsPaid =
    order.status === 'payment_processing' ||
    (order.status === 'pending_payment' && order.paymentMethod === 'bank_transfer')
  const displayName = order.user.name || order.user.email.split('@')[0]

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleMarkAsPaid = async () => {
    if (!onMarkAsPaid) return
    setLoading(true)
    try {
      await onMarkAsPaid(order.id)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                order.status === 'paid'
                  ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                  : order.status === 'payment_processing'
                    ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}
            >
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                Orden {order.orderNumber}
                <button
                  onClick={() => copyToClipboard(order.orderNumber, 'orderNumber')}
                  className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded"
                >
                  {copiedField === 'orderNumber' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </DialogTitle>
              <DialogDescription>
                Creada el {formatDate(order.createdAt)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 px-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium ${status.className}`}
            >
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </span>
            <span className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {formatCurrency(order.finalAmount, order.currency)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-stone-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Estudiante
                </p>
                <p className="font-medium text-stone-900 dark:text-stone-100">
                  {displayName}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {order.user.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-stone-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Curso
                </p>
                <p className="font-medium text-stone-900 dark:text-stone-100">
                  {order.course.title}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-stone-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Metodo de pago
                </p>
                <p className="font-medium text-stone-900 dark:text-stone-100">
                  {methodLabels[order.paymentMethod]}
                </p>
              </div>
            </div>

            {order.coupon && (
              <div className="flex items-start gap-3">
                <Ticket className="w-4 h-4 text-emerald-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Cupon aplicado
                  </p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    {order.coupon.code} (-{order.discountPercent}%)
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Original: {formatCurrency(order.originalPriceUSD, 'USD')}
                  </p>
                </div>
              </div>
            )}

            {order.paidAt && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-emerald-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Fecha de pago
                  </p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatDate(order.paidAt)}
                  </p>
                </div>
              </div>
            )}

            {order.transferReference && (
              <div className="py-3 px-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                      Referencia de transferencia
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {order.transferReference}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.transferProofUrl && (
              <div className="py-3 px-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-emerald-500" />
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      Comprobante de pago adjunto
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                  >
                    <a
                      href={order.transferProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ver comprobante
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cerrar
          </Button>
          {canMarkAsPaid && onMarkAsPaid && (
            <Button
              onClick={handleMarkAsPaid}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar pago
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
