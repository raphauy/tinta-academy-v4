import { Receipt, ShoppingBag } from 'lucide-react'
import type { OrderHistoryProps } from '@/../product/sections/student-panel/types'
import { OrderRow } from './OrderRow'

export function OrderHistory({ orders, onViewOrder }: OrderHistoryProps) {
  // Sort orders by date, most recent first
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Calculate totals
  const totalPaid = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => {
      // Convert to USD for display (simplified)
      const amountUSD = o.currency === 'UYU' ? o.amount / 40 : o.amount
      return sum + amountUSD
    }, 0)

  const paidCount = orders.filter(o => o.status === 'paid').length

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[#143F3B]/10 dark:bg-[#143F3B]/20">
            <Receipt className="w-6 h-6 text-[#143F3B] dark:text-[#6B9B7A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Mis Órdenes
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'} en total
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5">
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">Total invertido</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            ${totalPaid.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Aproximado en dólares
          </p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5">
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">Compras realizadas</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {paidCount}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            {paidCount === 1 ? 'Curso adquirido' : 'Cursos adquiridos'}
          </p>
        </div>
      </div>

      {/* Orders list */}
      {sortedOrders.length > 0 ? (
        <div className="space-y-3">
          {sortedOrders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onViewOrder={() => onViewOrder?.(order.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 mb-4">
            <ShoppingBag className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-1">
            Sin órdenes
          </h3>
          <p className="text-stone-500 dark:text-stone-400">
            Aún no has realizado ninguna compra.
          </p>
        </div>
      )}
    </div>
  )
}
