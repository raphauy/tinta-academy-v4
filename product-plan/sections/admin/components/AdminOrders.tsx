import { useState, useMemo } from 'react'
import {
  Receipt,
  Search,
  X,
  ChevronDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminOrdersProps, Order, OrderStatus, PaymentMethod } from '@/../product/sections/admin/types'
import { AdminMetricCard } from './AdminMetricCard'
import { OrderRow } from './OrderRow'

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

function calculateStats(orders: Order[]): OrderStats {
  const pending = orders.filter(o => o.status === 'Pending' || o.status === 'PaymentSent').length
  const paid = orders.filter(o => o.status === 'Paid').length
  const totalRevenue = orders
    .filter(o => o.status === 'Paid')
    .reduce((sum, o) => sum + o.amount, 0)

  return {
    total: orders.length,
    pending,
    paid,
    totalRevenue
  }
}

export function AdminOrders({
  orders,
  onViewDetails,
  onMarkAsPaid
}: AdminOrdersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const stats = useMemo(() => calculateStats(orders), [orders])

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...orders]

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter)
    }

    // Apply method filter
    if (methodFilter !== 'all') {
      result = result.filter(order => order.paymentMethod === methodFilter)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        order =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.studentName.toLowerCase().includes(query) ||
          order.studentEmail.toLowerCase().includes(query) ||
          order.courseTitle.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'orderNumber':
          comparison = a.orderNumber.localeCompare(b.orderNumber)
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
        sortField === field
          ? 'text-teal-700 dark:text-teal-400'
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
    <div className="p-4 sm:p-6 pb-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          Órdenes de Pago
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Gestiona las órdenes y pagos de la plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <AdminMetricCard
          label="Total Órdenes"
          value={stats.total}
          icon={<Receipt className="w-4 h-4" />}
          variant="primary"
        />
        <AdminMetricCard
          label="Pendientes"
          value={stats.pending}
          icon={<Clock className="w-4 h-4" />}
          subtitle="Requieren atención"
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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            placeholder="Buscar por número, estudiante o curso..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
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

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-40 h-[42px] rounded-xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-stone-400" />
                Todos
              </span>
            </SelectItem>
            <SelectItem value="Pending">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pendiente
              </span>
            </SelectItem>
            <SelectItem value="PaymentSent">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Pago Enviado
              </span>
            </SelectItem>
            <SelectItem value="Paid">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Pagado
              </span>
            </SelectItem>
            <SelectItem value="Cancelled">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-stone-400" />
                Cancelado
              </span>
            </SelectItem>
            <SelectItem value="Refunded">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Reembolsado
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Method Filter */}
        <Select value={methodFilter} onValueChange={(value) => setMethodFilter(value as MethodFilter)}>
          <SelectTrigger className="w-full sm:w-44 h-[42px] rounded-xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <SelectValue placeholder="Método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-stone-400" />
                Todos los métodos
              </span>
            </SelectItem>
            <SelectItem value="MercadoPago">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-sky-500 flex items-center justify-center text-[8px] text-white font-bold">MP</span>
                MercadoPago
              </span>
            </SelectItem>
            <SelectItem value="Transferencia">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-teal-500 flex items-center justify-center text-[8px] text-white font-bold">TR</span>
                Transferencia
              </span>
            </SelectItem>
            <SelectItem value="Gratuito">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-stone-400 flex items-center justify-center text-[8px] text-white font-bold">GR</span>
                Gratuito
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count & Sort Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredOrders.length === 0
            ? 'No se encontraron órdenes'
            : filteredOrders.length === 1
              ? '1 orden'
              : `${filteredOrders.length} órdenes`}
          {(searchQuery || statusFilter !== 'all' || methodFilter !== 'all') && orders.length !== filteredOrders.length && (
            <span className="text-stone-400 dark:text-stone-500">
              {' '}de {orders.length} totales
            </span>
          )}
        </p>

        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 dark:text-stone-500">Ordenar por:</span>
          <div className="flex items-center gap-3">
            <SortButton field="orderNumber" label="Número" />
            <SortButton field="amount" label="Monto" />
            <SortButton field="status" label="Estado" />
            <SortButton field="createdAt" label="Fecha" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
          {/* Table Header - Desktop */}
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
              Método
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
              Acciones
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {filteredOrders.map(order => (
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
              ? 'No se encontraron órdenes con los filtros aplicados'
              : 'No hay órdenes registradas en la plataforma'}
          </p>
          {(searchQuery || statusFilter !== 'all' || methodFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setMethodFilter('all')
              }}
              className="mt-4 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
