'use client'

import { useState, useMemo } from 'react'
import {
  Receipt,
  Search,
  X,
  ChevronDown,
  DollarSign,
  Clock,
  CheckCircle,
  CreditCard,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Order, OrderStatus, PaymentMethod } from '@prisma/client'
import { AdminMetricCard } from './admin-metric-card'
import { OrderRow } from './order-row'

type OrderWithRelations = Order & {
  user: { id: string; email: string; name: string | null }
  course: { id: string; title: string }
  coupon?: { id: string; code: string; discountPercent: number } | null
}

type SortField = 'orderNumber' | 'amount' | 'status' | 'createdAt'
type SortDirection = 'asc' | 'desc'
type StatusFilter = 'all' | OrderStatus
type MethodFilter = 'all' | PaymentMethod

interface OrderStats {
  total: number
  pending: number
  paid: number
  totalRevenue: number
}

function calculateStats(orders: OrderWithRelations[]): OrderStats {
  const pending = orders.filter(
    (o) => o.status === 'pending_payment' || o.status === 'payment_processing'
  ).length
  const paid = orders.filter((o) => o.status === 'paid').length
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.finalAmount, 0)

  return { total: orders.length, pending, paid, totalRevenue }
}

export interface AdminOrdersProps {
  orders: OrderWithRelations[]
  onViewDetails?: (id: string) => void
  onMarkAsPaid?: (id: string) => void
}

export function AdminOrders({
  orders,
  onViewDetails,
  onMarkAsPaid,
}: AdminOrdersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const stats = useMemo(() => calculateStats(orders), [orders])

  const filteredOrders = useMemo(() => {
    let result = [...orders]

    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter)
    }

    if (methodFilter !== 'all') {
      result = result.filter((order) => order.paymentMethod === methodFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          (order.user.name?.toLowerCase() || '').includes(query) ||
          order.user.email.toLowerCase().includes(query) ||
          order.course.title.toLowerCase().includes(query)
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'orderNumber':
          comparison = a.orderNumber.localeCompare(b.orderNumber)
          break
        case 'amount':
          comparison = a.finalAmount - b.finalAmount
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [orders, searchQuery, statusFilter, methodFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const renderSortButton = (field: SortField, label: string) => (
    <button
      key={field}
      onClick={() => handleSort(field)}
      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
        sortField === field
          ? 'text-[#143F3B] dark:text-[#6B9B7A]'
          : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
      }`}
    >
      {label}
      {sortField === field && (
        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            sortDirection === 'asc' ? 'rotate-180' : ''
          }`}
        />
      )}
    </button>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          Ordenes de Pago
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Gestiona las ordenes y pagos de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Total Ordenes"
          value={stats.total}
          icon={<Receipt className="w-4 h-4" />}
          variant="primary"
        />
        <AdminMetricCard
          label="Pendientes"
          value={stats.pending}
          icon={<Clock className="w-4 h-4" />}
          subtitle="Requieren atencion"
        />
        <AdminMetricCard
          label="Pagadas"
          value={stats.paid}
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Ingresos Totales"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <Input
            type="text"
            placeholder="Buscar por numero, estudiante o curso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="created">Creada</SelectItem>
            <SelectItem value="pending_payment">Pendiente</SelectItem>
            <SelectItem value="payment_processing">Procesando</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="refunded">Reembolsado</SelectItem>
            <SelectItem value="rejected">Rechazado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={methodFilter}
          onValueChange={(value) => setMethodFilter(value as MethodFilter)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Metodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-stone-400" />
                Todos los metodos
              </span>
            </SelectItem>
            <SelectItem value="mercadopago">MercadoPago</SelectItem>
            <SelectItem value="bank_transfer">Transferencia</SelectItem>
            <SelectItem value="free">Gratuito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredOrders.length === 0
            ? 'No se encontraron ordenes'
            : filteredOrders.length === 1
              ? '1 orden'
              : `${filteredOrders.length} ordenes`}
          {(searchQuery || statusFilter !== 'all' || methodFilter !== 'all') &&
            orders.length !== filteredOrders.length && (
              <span className="text-stone-400 dark:text-stone-500">
                {' '}de {orders.length} totales
              </span>
            )}
        </p>

        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 dark:text-stone-500">
            Ordenar por:
          </span>
          <div className="flex items-center gap-3">
            {renderSortButton('orderNumber', 'Numero')}
            {renderSortButton('amount', 'Monto')}
            {renderSortButton('status', 'Estado')}
            {renderSortButton('createdAt', 'Fecha')}
          </div>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Orden
            </div>
            <div className="col-span-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Estudiante / Curso
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Monto
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Estado
            </div>
            <div className="col-span-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Metodo
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
              Acciones
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {filteredOrders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onViewDetails={() => onViewDetails?.(order.id)}
                onMarkAsPaid={() => onMarkAsPaid?.(order.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <Receipt className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            Sin resultados
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
            {searchQuery || statusFilter !== 'all' || methodFilter !== 'all'
              ? 'No se encontraron ordenes con los filtros aplicados'
              : 'No hay ordenes registradas en la plataforma'}
          </p>
          {(searchQuery || statusFilter !== 'all' || methodFilter !== 'all') && (
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setMethodFilter('all')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
