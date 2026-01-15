'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, CreditCard, Building2, Gift, ArrowRight, Ban } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface OrderCardProps {
  order: {
    id: string
    orderNumber: string
    finalAmount: number
    currency: string
    paymentMethod: string
    status: string
    createdAt: Date
    paidAt: Date | null
    course: {
      id: string
      title: string
      type: string
      imageUrl: string | null
    }
    cancelledBy?: { id: string; name: string | null; email: string } | null
  }
  viewAs?: string
  onCancel?: (orderId: string) => void
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  created: { label: 'Creada', variant: 'secondary' },
  pending_payment: { label: 'Confirmación de pago pendiente', variant: 'outline' },
  payment_processing: { label: 'Procesando', variant: 'default' },
  paid: { label: 'Pagada', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
  refunded: { label: 'Reembolsada', variant: 'secondary' },
  rejected: { label: 'Rechazada', variant: 'destructive' },
}

const paymentMethodConfig: Record<string, { label: string; icon: typeof CreditCard }> = {
  mercadopago: { label: 'MercadoPago', icon: CreditCard },
  bank_transfer: { label: 'Transferencia', icon: Building2 },
  free: { label: 'Gratuito', icon: Gift },
}

const DEFAULT_COURSE_IMAGE = '/placeholder-course.jpg'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-UY', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

function formatAmount(amount: number, currency: string): string {
  if (currency === 'UYU') {
    return `$ ${amount.toLocaleString('es-UY')}`
  }
  return `USD ${amount.toFixed(2)}`
}

export function OrderCard({ order, viewAs, onCancel }: OrderCardProps) {
  const status = statusConfig[order.status] || {
    label: order.status,
    variant: 'secondary' as const,
  }
  const paymentMethod = paymentMethodConfig[order.paymentMethod] || {
    label: order.paymentMethod,
    icon: CreditCard,
  }
  const PaymentIcon = paymentMethod.icon

  const showTransferButton =
    order.status === 'pending_payment' && order.paymentMethod === 'bank_transfer'
  const showCourseButton = order.status === 'paid'
  const canCancel = ['created', 'pending_payment', 'payment_processing'].includes(order.status)

  return (
    <div className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Course Image */}
        <div className="shrink-0 relative w-full sm:w-28 h-40 sm:h-28 rounded-xl overflow-hidden bg-muted">
          <Image
            src={order.course.imageUrl || DEFAULT_COURSE_IMAGE}
            alt={order.course.title}
            fill
            sizes="(max-width: 640px) 100vw, 112px"
            className="object-cover"
          />
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-mono">
                {order.orderNumber}
              </p>
              <h3 className="font-semibold line-clamp-1">{order.course.title}</h3>
            </div>
            {order.status === 'cancelled' && order.cancelledBy ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={status.variant}
                      className="cursor-help"
                    >
                      {status.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancelada por {order.cancelledBy.name || order.cancelledBy.email}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Badge
                variant={status.variant}
                className={
                  order.status === 'paid'
                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                    : order.status === 'pending_payment'
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                      : ''
                }
              >
                {status.label}
              </Badge>
            )}
          </div>

          {/* Details Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PaymentIcon className="w-4 h-4" />
              <span>{paymentMethod.label}</span>
            </div>
            <div className="font-medium text-foreground">
              {formatAmount(order.finalAmount, order.currency)}
            </div>
          </div>

          {/* Action Buttons */}
          {(showTransferButton || showCourseButton || canCancel) && (
            <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {showTransferButton && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/checkout/pending/${order.id}`}>
                      Ver datos de transferencia
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
                {showCourseButton && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/student/courses/${order.course.id}${viewAs ? `?viewAs=${viewAs}` : ''}`}
                    >
                      Ver curso
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
              {canCancel && onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(order.id)}
                  className="border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Cancelar orden
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
