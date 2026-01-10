'use client'

import { useState, useMemo } from 'react'
import {
  Ticket,
  Search,
  X,
  ChevronDown,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
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
import type { Coupon } from '@prisma/client'
import { AdminMetricCard } from './admin-metric-card'
import { CouponRow } from './coupon-row'

type SortField = 'code' | 'discountPercent' | 'currentUses' | 'createdAt'
type SortDirection = 'asc' | 'desc'
type StatusFilter = 'all' | 'active' | 'inactive' | 'expired' | 'exhausted'

interface CouponStats {
  total: number
  active: number
  expired: number
  totalUses: number
}

function calculateStats(coupons: Coupon[]): CouponStats {
  const now = new Date()
  const active = coupons.filter((c) => {
    if (!c.isActive) return false
    if (c.expiresAt && c.expiresAt < now) return false
    if (c.currentUses >= c.maxUses) return false
    return true
  }).length

  const expired = coupons.filter(
    (c) => c.expiresAt && c.expiresAt < now
  ).length

  const totalUses = coupons.reduce((sum, c) => sum + c.currentUses, 0)

  return { total: coupons.length, active, expired, totalUses }
}

function getCouponStatus(coupon: Coupon): StatusFilter {
  if (!coupon.isActive) return 'inactive'
  const now = new Date()
  if (coupon.expiresAt && coupon.expiresAt < now) return 'expired'
  if (coupon.currentUses >= coupon.maxUses) return 'exhausted'
  return 'active'
}

export interface AdminCouponsProps {
  coupons: Coupon[]
  onCreateNew?: () => void
  onEdit?: (id: string) => void
  onToggleActive?: (id: string) => void
  onDelete?: (id: string) => void
}

export function AdminCoupons({
  coupons,
  onCreateNew,
  onEdit,
  onToggleActive,
  onDelete,
}: AdminCouponsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const stats = useMemo(() => calculateStats(coupons), [coupons])

  const filteredCoupons = useMemo(() => {
    let result = [...coupons]

    if (statusFilter !== 'all') {
      result = result.filter((coupon) => getCouponStatus(coupon) === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (coupon) =>
          coupon.code.toLowerCase().includes(query) ||
          (coupon.description?.toLowerCase() || '').includes(query)
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'code':
          comparison = a.code.localeCompare(b.code)
          break
        case 'discountPercent':
          comparison = a.discountPercent - b.discountPercent
          break
        case 'currentUses':
          comparison = a.currentUses - b.currentUses
          break
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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

  const renderSortButton = (field: SortField, label: string) => (
    <Button
      key={field}
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className={`h-auto px-2 py-1 text-xs font-medium ${
        sortField === field
          ? 'text-[#143F3B] dark:text-[#6B9B7A]'
          : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
      }`}
    >
      {label}
      {sortField === field && (
        <ChevronDown
          className={`w-3 h-3 ml-1 transition-transform ${
            sortDirection === 'asc' ? 'rotate-180' : ''
          }`}
        />
      )}
    </Button>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
            Cupones de Descuento
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Gestiona los cupones de descuento de la plataforma
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-[#143F3B] hover:bg-[#0e2c29] text-white dark:bg-[#143F3B] dark:hover:bg-[#1e5a54]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cupon
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Total Cupones"
          value={stats.total}
          icon={<Ticket className="w-4 h-4" />}
          variant="primary"
        />
        <AdminMetricCard
          label="Activos"
          value={stats.active}
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Expirados"
          value={stats.expired}
          icon={<Clock className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Usos Totales"
          value={stats.totalUses}
          icon={<Percent className="w-4 h-4" />}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <Input
            type="text"
            placeholder="Buscar por codigo o descripcion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-white dark:bg-stone-900"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-stone-900">
            <SelectValue placeholder="Estado" />
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
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Activos
              </span>
            </SelectItem>
            <SelectItem value="inactive">
              <span className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-stone-400" />
                Inactivos
              </span>
            </SelectItem>
            <SelectItem value="expired">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                Expirados
              </span>
            </SelectItem>
            <SelectItem value="exhausted">
              <span className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-amber-500" />
                Agotados
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredCoupons.length === 0
            ? 'No se encontraron cupones'
            : filteredCoupons.length === 1
              ? '1 cupon'
              : `${filteredCoupons.length} cupones`}
          {(searchQuery || statusFilter !== 'all') &&
            coupons.length !== filteredCoupons.length && (
              <span className="text-stone-400 dark:text-stone-500">
                {' '}de {coupons.length} totales
              </span>
            )}
        </p>

        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 dark:text-stone-500">
            Ordenar por:
          </span>
          <div className="flex items-center gap-3">
            {renderSortButton('code', 'Codigo')}
            {renderSortButton('discountPercent', 'Descuento')}
            {renderSortButton('currentUses', 'Usos')}
            {renderSortButton('createdAt', 'Fecha')}
          </div>
        </div>
      </div>

      {filteredCoupons.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
            <div className="col-span-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Cupon
            </div>
            <div className="col-span-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Descuento
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Usos
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Estado
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Restricciones
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
              Acciones
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {filteredCoupons.map((coupon) => (
              <CouponRow
                key={coupon.id}
                coupon={coupon}
                onEdit={() => onEdit?.(coupon.id)}
                onToggleActive={() => onToggleActive?.(coupon.id)}
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
              : 'No hay cupones registrados en la plataforma'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
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
