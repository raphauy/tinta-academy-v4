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
  Calendar
} from 'lucide-react'
import type { Order, OrderStatus, PaymentMethod } from '@/../product/sections/admin/types'

interface OrderRowProps {
  order: Order
  onViewDetails?: () => void
  onMarkAsPaid?: () => void
}

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; className: string }> = {
  Created: {
    label: 'Creada',
    icon: Clock,
    className: 'bg-stone-50 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700'
  },
  Pending: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900'
  },
  PaymentSent: {
    label: 'Pago Enviado',
    icon: AlertCircle,
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900'
  },
  Paid: {
    label: 'Pagado',
    icon: CheckCircle,
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
  },
  Rejected: {
    label: 'Rechazado',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900'
  },
  Refunded: {
    label: 'Reembolsado',
    icon: RotateCcw,
    className: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-900'
  },
  Cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'bg-stone-50 text-stone-500 dark:bg-stone-800 dark:text-stone-500 border-stone-200 dark:border-stone-700'
  }
}

const methodConfig: Record<PaymentMethod, { label: string; shortLabel: string; className: string }> = {
  MercadoPago: {
    label: 'MercadoPago',
    shortLabel: 'MP',
    className: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400'
  },
  Transferencia: {
    label: 'Transferencia',
    shortLabel: 'TR',
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400'
  },
  Gratuito: {
    label: 'Gratuito',
    shortLabel: 'GR',
    className: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('es-UY', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

export function OrderRow({ order, onViewDetails, onMarkAsPaid }: OrderRowProps) {
  const status = statusConfig[order.status] || statusConfig.Created
  const method = methodConfig[order.paymentMethod] || methodConfig.MercadoPago
  const StatusIcon = status.icon
  const canMarkAsPaid = order.status === 'PaymentSent' || (order.status === 'Pending' && order.paymentMethod === 'Transferencia')
  const hasDiscount = order.discount > 0

  return (
    <div className="group px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Order Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              order.status === 'Paid'
                ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                : order.status === 'PaymentSent'
                  ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
            }`}>
              <Receipt className="w-5 h-5" />
            </div>

            {/* Info */}
            <div className="min-w-0">
              <p className="font-mono font-semibold text-sm text-stone-900 dark:text-stone-100">
                {order.orderNumber}
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-300 truncate">
                {order.studentName}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className={`font-bold ${
              order.status === 'Cancelled' || order.status === 'Rejected'
                ? 'text-stone-400 line-through'
                : 'text-stone-900 dark:text-stone-100'
            }`}>
              {formatCurrency(order.amount, order.currency)}
            </p>
            {hasDiscount && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Ticket className="w-3 h-3" />
                -{order.discount}%
              </span>
            )}
          </div>
        </div>

        {/* Course */}
        <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
          {order.courseTitle}
        </p>

        {/* Transfer Comment */}
        {order.transferComment && (
          <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs text-blue-700 dark:text-blue-400">
            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2">{order.transferComment}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${status.className}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            {/* Method Badge */}
            <span className={`inline-flex items-center justify-center w-7 h-6 rounded text-[10px] font-bold ${method.className}`}>
              {method.shortLabel}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onViewDetails}
              className="p-1.5 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-md transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            {canMarkAsPaid && (
              <button
                onClick={onMarkAsPaid}
                className="p-1.5 text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-md transition-colors"
                title="Marcar como pagado"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Date */}
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
        {/* Order Number - 2 cols */}
        <div className="col-span-2">
          <p className="font-mono font-semibold text-sm text-stone-900 dark:text-stone-100">
            {order.orderNumber}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        {/* Student & Course - 3 cols */}
        <div className="col-span-3 min-w-0">
          <p className="font-medium text-sm text-stone-900 dark:text-stone-100 truncate">
            {order.studentName}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 truncate" title={order.courseTitle}>
            {order.courseTitle}
          </p>
        </div>

        {/* Amount - 2 cols */}
        <div className="col-span-2">
          <p className={`font-bold ${
            order.status === 'Cancelled' || order.status === 'Rejected'
              ? 'text-stone-400 line-through'
              : 'text-stone-900 dark:text-stone-100'
          }`}>
            {formatCurrency(order.amount, order.currency)}
          </p>
          {hasDiscount && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Ticket className="w-3 h-3" />
              {order.couponCode} (-{order.discount}%)
            </span>
          )}
        </div>

        {/* Status - 2 cols */}
        <div className="col-span-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${status.className}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          {order.transferComment && (
            <div className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400" title={order.transferComment}>
              <MessageSquare className="w-3 h-3" />
              <span className="truncate max-w-[80px]">Nota adjunta</span>
            </div>
          )}
        </div>

        {/* Method - 1 col */}
        <div className="col-span-1">
          <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium ${method.className}`} title={method.label}>
            {method.shortLabel}
          </span>
        </div>

        {/* Actions - 2 cols */}
        <div className="col-span-2 flex items-center justify-end gap-1">
          <button
            onClick={onViewDetails}
            className="p-1.5 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canMarkAsPaid ? (
            <button
              onClick={onMarkAsPaid}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-lg transition-colors"
              title="Marcar como pagado"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Confirmar pago
            </button>
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
