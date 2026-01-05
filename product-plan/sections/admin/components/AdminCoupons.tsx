import { useState, useMemo } from 'react'
import {
  Ticket,
  Plus,
  Search,
  X,
  ChevronDown,
  Percent,
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminCouponsProps, Coupon } from '@/../product/sections/admin/types'
import { AdminMetricCard } from './AdminMetricCard'
import { CouponRow } from './CouponRow'

type SortField = 'code' | 'discount' | 'uses' | 'expiresAt' | 'createdAt'
type SortDirection = 'asc' | 'desc'
type StatusFilter = 'all' | 'active' | 'inactive' | 'expired'

interface CouponStats {
  total: number
  active: number
  totalUses: number
  avgDiscount: number
}

function calculateStats(coupons: Coupon[]): CouponStats {
  const now = new Date()
  const active = coupons.filter(c => {
    if (!c.isActive) return false
    if (c.expiresAt && new Date(c.expiresAt) < now) return false
    if (c.currentUses >= c.maxUses) return false
    return true
  }).length

  const totalUses = coupons.reduce((sum, c) => sum + c.currentUses, 0)
  const avgDiscount = coupons.length > 0
    ? Math.round(coupons.reduce((sum, c) => sum + c.discountPercent, 0) / coupons.length)
    : 0

  return {
    total: coupons.length,
    active,
    totalUses,
    avgDiscount
  }
}

export function AdminCoupons({
  coupons,
  onViewStats,
  onEdit,
  onDelete,
  onCreate
}: AdminCouponsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const stats = useMemo(() => calculateStats(coupons), [coupons])

  // Get coupon status
  const getCouponStatus = (coupon: Coupon): 'active' | 'inactive' | 'expired' | 'exhausted' => {
    if (!coupon.isActive) return 'inactive'
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return 'expired'
    if (coupon.currentUses >= coupon.maxUses) return 'exhausted'
    return 'active'
  }

  // Filter and sort coupons
  const filteredCoupons = useMemo(() => {
    let result = [...coupons]

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(coupon => {
        const status = getCouponStatus(coupon)
        if (statusFilter === 'inactive') {
          return status === 'inactive' || status === 'exhausted'
        }
        return status === statusFilter
      })
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        coupon =>
          coupon.code.toLowerCase().includes(query) ||
          (coupon.restrictedEmail && coupon.restrictedEmail.toLowerCase().includes(query)) ||
          (coupon.restrictedCourseName && coupon.restrictedCourseName.toLowerCase().includes(query))
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'code':
          comparison = a.code.localeCompare(b.code)
          break
        case 'discount':
          comparison = a.discountPercent - b.discountPercent
          break
        case 'uses':
          comparison = a.currentUses - b.currentUses
          break
        case 'expiresAt':
          if (!a.expiresAt && !b.expiresAt) comparison = 0
          else if (!a.expiresAt) comparison = 1
          else if (!b.expiresAt) comparison = -1
          else comparison = new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [coupons, searchQuery, statusFilter, sortField, sortDirection])

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
            Cupones
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Gestiona los cupones de descuento de la plataforma
          </p>
        </div>

        {/* Create Button */}
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cupón</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <AdminMetricCard
          label="Total Cupones"
          value={stats.total}
          icon={<Ticket className="w-4 h-4" />}
          variant="primary"
        />
        <AdminMetricCard
          label="Cupones Activos"
          value={stats.active}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Usos Totales"
          value={stats.totalUses}
          icon={<Users className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Descuento Promedio"
          value={`${stats.avgDiscount}%`}
          icon={<Percent className="w-4 h-4" />}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            placeholder="Buscar por código, email o curso..."
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
          <SelectTrigger className="w-full sm:w-44 h-[42px] rounded-xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-stone-400" />
                Todos
              </span>
            </SelectItem>
            <SelectItem value="active">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Activos
              </span>
            </SelectItem>
            <SelectItem value="inactive">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-stone-400" />
                Inactivos
              </span>
            </SelectItem>
            <SelectItem value="expired">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Expirados
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count & Sort Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredCoupons.length === 0
            ? 'No se encontraron cupones'
            : filteredCoupons.length === 1
              ? '1 cupón'
              : `${filteredCoupons.length} cupones`}
          {(searchQuery || statusFilter !== 'all') && coupons.length !== filteredCoupons.length && (
            <span className="text-stone-400 dark:text-stone-500">
              {' '}de {coupons.length} totales
            </span>
          )}
        </p>

        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 dark:text-stone-500">Ordenar por:</span>
          <div className="flex items-center gap-3">
            <SortButton field="code" label="Código" />
            <SortButton field="discount" label="Descuento" />
            <SortButton field="uses" label="Usos" />
            <SortButton field="expiresAt" label="Expira" />
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      {filteredCoupons.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
          {/* Table Header - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
            <div className="col-span-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Código
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Descuento
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Uso
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Restricciones
            </div>
            <div className="col-span-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Expira
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
              Acciones
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {filteredCoupons.map(coupon => (
              <CouponRow
                key={coupon.id}
                coupon={coupon}
                onViewStats={() => onViewStats?.(coupon.id)}
                onEdit={() => onEdit?.(coupon.id)}
                onDelete={() => onDelete?.(coupon.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            Sin resultados
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
            {searchQuery || statusFilter !== 'all'
              ? 'No se encontraron cupones con los filtros aplicados'
              : 'No hay cupones creados en la plataforma'}
          </p>
          {(searchQuery || statusFilter !== 'all') ? (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              className="mt-4 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
            >
              Limpiar filtros
            </button>
          ) : (
            <button
              onClick={onCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear primer cupón
            </button>
          )}
        </div>
      )}
    </div>
  )
}
