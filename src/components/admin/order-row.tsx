'use client'

import {
  Receipt,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  Ticket,
  MessageSquare,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Order, OrderStatus, PaymentMethod } from '@prisma/client'

type OrderWithRelations = Order & {
  user: { id: string; email: string; name: string | null }
  course: { id: string; title: string }
  coupon?: { id: string; code: string; discountPercent: number } | null
}

interface OrderRowProps {
  order: OrderWithRelations
  onViewDetails?: () => void
  onMarkAsPaid?: () => void
}

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  created: {
    label: 'Creada',
    icon: Clock,
    className:
      'bg-stone-50 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700',
  },
  pending_payment: {
    label: 'Pendiente',
    icon: Clock,
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  },
  payment_processing: {
    label: 'Procesando',
    icon: AlertCircle,
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  },
  paid: {
    label: 'Pagado',
    icon: CheckCircle,
    className:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  },
  rejected: {
    label: 'Rechazado',
    icon: XCircle,
    className:
      'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900',
  },
  refunded: {
    label: 'Reembolsado',
    icon: RotateCcw,
    className:
      'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-900',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    className:
      'bg-stone-50 text-stone-500 dark:bg-stone-800 dark:text-stone-500 border-stone-200 dark:border-stone-700',
  },
}

const methodConfig: Record<
  PaymentMethod,
  { label: string; shortLabel: string; className: string }
> = {
  mercadopago: {
    label: 'MercadoPago',
    shortLabel: 'MP',
    className:
      'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400',
  },
  bank_transfer: {
    label: 'Transferencia',
    shortLabel: 'TR',
    className:
      'bg-[#143F3B]/10 text-[#143F3B] dark:bg-[#143F3B]/20 dark:text-[#6B9B7A]',
  },
  free: {
    label: 'Gratuito',
    shortLabel: 'GR',
    className:
      'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  },
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('es-UY', {
    day: 'numeric',
    month: 'short',
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

export function OrderRow({
  order,
  onViewDetails,
  onMarkAsPaid,
}: OrderRowProps) {
  const status = statusConfig[order.status] || statusConfig.created
  const method = methodConfig[order.paymentMethod] || methodConfig.mercadopago
  const StatusIcon = status.icon
  const canMarkAsPaid =
    order.status === 'payment_processing' ||
    (order.status === 'pending_payment' && order.paymentMethod === 'bank_transfer')
  const hasDiscount = order.discountPercent > 0
  const displayName = order.user.name || order.user.email.split('@')[0]

  return (
    <div className="group px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                order.status === 'paid'
                  ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                  : order.status === 'payment_processing'
                    ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}
            >
              <Receipt className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <Button
                variant="link"
                onClick={onViewDetails}
                className="h-auto p-0 font-mono font-semibold text-sm text-stone-900 dark:text-stone-100 hover:text-[#143F3B] dark:hover:text-[#6B9B7A]"
              >
                {order.orderNumber}
              </Button>
              <p className="text-sm text-stone-600 dark:text-stone-300 truncate">
                {displayName}
              </p>
            </div>
          </div>

          <div className="text-right">
            {order.finalAmount > 0 ? (
              <p
                className={`font-bold ${
                  order.status === 'cancelled' || order.status === 'rejected'
                    ? 'text-stone-400 line-through'
                    : 'text-stone-900 dark:text-stone-100'
                }`}
              >
                {formatCurrency(order.finalAmount, order.currency)}
              </p>
            ) : null}
            {hasDiscount && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Ticket className="w-3 h-3" />-{order.discountPercent}%
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
          {order.course.title}
        </p>

        {order.transferReference && (
          <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs text-blue-700 dark:text-blue-400">
            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2">{order.transferReference}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${status.className}`}
            >
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            <span
              className={`inline-flex items-center justify-center w-7 h-6 rounded text-[10px] font-bold ${method.className}`}
            >
              {method.shortLabel}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onViewDetails}
              className="h-8 w-8 text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-[#143F3B]/10 dark:hover:bg-[#143F3B]/20"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {canMarkAsPaid && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMarkAsPaid}
                className="h-8 w-8 text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                title="Marcar como pagado"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
          <Calendar className="w-3 h-3" />
          {formatDateTime(order.createdAt)}
          {order.paidAt && (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400">
              Pagado: {formatDateTime(order.paidAt)}
            </span>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
        <div className="col-span-2">
          <Button
            variant="link"
            onClick={onViewDetails}
            className="h-auto p-0 font-mono font-semibold text-sm text-stone-900 dark:text-stone-100 hover:text-[#143F3B] dark:hover:text-[#6B9B7A]"
          >
            {order.orderNumber}
          </Button>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="col-span-3 min-w-0">
          <p className="font-medium text-sm text-stone-900 dark:text-stone-100 truncate">
            {displayName}
          </p>
          <p
            className="text-xs text-stone-500 dark:text-stone-400 truncate"
            title={order.course.title}
          >
            {order.course.title}
          </p>
        </div>

        <div className="col-span-2">
          {order.finalAmount > 0 ? (
            <p
              className={`font-bold ${
                order.status === 'cancelled' || order.status === 'rejected'
                  ? 'text-stone-400 line-through'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {formatCurrency(order.finalAmount, order.currency)}
            </p>
          ) : null}
          {hasDiscount && order.coupon && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Ticket className="w-3 h-3" />
              {order.coupon.code} (-{order.discountPercent}%)
            </span>
          )}
        </div>

        <div className="col-span-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${status.className}`}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          {order.transferReference && (
            <div
              className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400"
              title={order.transferReference}
            >
              <MessageSquare className="w-3 h-3" />
              <span className="truncate max-w-[80px]">Nota adjunta</span>
            </div>
          )}
        </div>

        <div className="col-span-1">
          <span
            className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium ${method.className}`}
            title={method.label}
          >
            {method.shortLabel}
          </span>
        </div>

        <div className="col-span-2 flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onViewDetails}
            className="h-8 w-8 text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-[#143F3B]/10 dark:hover:bg-[#143F3B]/20 opacity-0 group-hover:opacity-100"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {canMarkAsPaid ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAsPaid}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950"
              title="Marcar como pagado"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Confirmar pago
            </Button>
          ) : order.paidAt ? (
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {formatDate(order.paidAt)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
