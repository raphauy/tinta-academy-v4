import { Receipt, CreditCard, Building2, Gift, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react'
import type { Order } from '@/../product/sections/student-panel/types'

interface OrderRowProps {
  order: Order
  onViewOrder?: () => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatAmount(amount: number, currency: 'USD' | 'UYU'): string {
  if (amount === 0) return 'Gratis'

  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function getPaymentMethodInfo(method: Order['paymentMethod']) {
  const methods = {
    mercadopago: {
      label: 'MercadoPago',
      icon: CreditCard,
      color: 'text-blue-600 dark:text-blue-400'
    },
    transfer: {
      label: 'Transferencia',
      icon: Building2,
      color: 'text-stone-600 dark:text-stone-400'
    },
    free: {
      label: 'Gratuito',
      icon: Gift,
      color: 'text-emerald-600 dark:text-emerald-400'
    }
  }
  return methods[method]
}

function getStatusInfo(status: Order['status']) {
  const statuses = {
    created: {
      label: 'Creada',
      icon: Clock,
      color: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
    },
    pending: {
      label: 'Pendiente',
      icon: Clock,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    },
    payment_sent: {
      label: 'Pago enviado',
      icon: Clock,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    },
    paid: {
      label: 'Pagado',
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    },
    rejected: {
      label: 'Rechazado',
      icon: XCircle,
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    },
    refunded: {
      label: 'Reembolsado',
      icon: RefreshCw,
      color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
    },
    cancelled: {
      label: 'Cancelado',
      icon: XCircle,
      color: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
    }
  }
  return statuses[status]
}

export function OrderRow({ order, onViewOrder }: OrderRowProps) {
  const paymentMethod = getPaymentMethodInfo(order.paymentMethod)
  const status = getStatusInfo(order.status)
  const PaymentIcon = paymentMethod.icon
  const StatusIcon = status.icon

  return (
    <button
      onClick={onViewOrder}
      className="w-full text-left bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-md transition-all group"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Order info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-stone-400 dark:text-stone-500" />
            <span className="text-sm font-mono text-stone-500 dark:text-stone-400">
              {order.orderNumber}
            </span>
          </div>
          <h3 className="font-medium text-stone-900 dark:text-stone-100 truncate group-hover:text-[#143F3B] dark:group-hover:text-[#6B9B7A] transition-colors">
            {order.courseTitle}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Payment method */}
        <div className="flex items-center gap-2 sm:w-32">
          <PaymentIcon className={`w-4 h-4 ${paymentMethod.color}`} />
          <span className="text-sm text-stone-600 dark:text-stone-400">
            {paymentMethod.label}
          </span>
        </div>

        {/* Amount */}
        <div className="sm:w-28 sm:text-right">
          <span className={`text-lg font-semibold ${
            order.amount === 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-stone-900 dark:text-stone-100'
          }`}>
            {formatAmount(order.amount, order.currency)}
          </span>
        </div>

        {/* Status */}
        <div className="sm:w-32 sm:text-right">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>
      </div>
    </button>
  )
}
