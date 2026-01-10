'use client'

import {
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Calendar,
  DollarSign,
  BookOpen,
  Mail,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import type { Coupon } from '@prisma/client'
import { Button } from '@/components/ui/button'

interface CouponRowProps {
  coupon: Coupon
  onEdit?: () => void
  onToggleActive?: () => void
  onDelete?: () => void
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

type CouponStatus = 'active' | 'expired' | 'exhausted' | 'inactive' | 'scheduled'

function getCouponStatus(coupon: Coupon): CouponStatus {
  if (!coupon.isActive) return 'inactive'

  const now = new Date()

  if (coupon.validFrom > now) return 'scheduled'
  if (coupon.expiresAt && coupon.expiresAt < now) return 'expired'
  if (coupon.currentUses >= coupon.maxUses) return 'exhausted'

  return 'active'
}

const statusConfig: Record<
  CouponStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  active: {
    label: 'Activo',
    icon: CheckCircle,
    className:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  },
  expired: {
    label: 'Expirado',
    icon: XCircle,
    className:
      'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900',
  },
  exhausted: {
    label: 'Agotado',
    icon: AlertCircle,
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  },
  inactive: {
    label: 'Inactivo',
    icon: XCircle,
    className:
      'bg-stone-50 text-stone-500 dark:bg-stone-800 dark:text-stone-500 border-stone-200 dark:border-stone-700',
  },
  scheduled: {
    label: 'Programado',
    icon: Clock,
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  },
}

export function CouponRow({
  coupon,
  onEdit,
  onToggleActive,
  onDelete,
}: CouponRowProps) {
  const couponStatus = getCouponStatus(coupon)
  const status = statusConfig[couponStatus]
  const StatusIcon = status.icon
  const usagePercent = Math.round((coupon.currentUses / coupon.maxUses) * 100)
  const hasRestrictions =
    coupon.restrictedToEmail ||
    coupon.restrictedToCourseId ||
    coupon.minPurchaseAmount

  return (
    <div className="group px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                couponStatus === 'active'
                  ? 'bg-[#143F3B]/10 dark:bg-[#143F3B]/20 text-[#143F3B] dark:text-[#6B9B7A]'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}
            >
              <Ticket className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <Button
                variant="link"
                onClick={onEdit}
                className="h-auto p-0 font-mono font-bold text-sm text-stone-900 dark:text-stone-100 hover:text-[#143F3B] dark:hover:text-[#6B9B7A]"
              >
                {coupon.code}
              </Button>
              <p className="text-lg font-bold text-[#143F3B] dark:text-[#6B9B7A]">
                -{coupon.discountPercent}%
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${status.className}`}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>

        {coupon.description && (
          <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
            {coupon.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {coupon.currentUses}/{coupon.maxUses} usos
          </span>
          {coupon.expiresAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Expira: {formatDate(coupon.expiresAt)}
            </span>
          )}
        </div>

        {hasRestrictions && (
          <div className="flex flex-wrap gap-1.5">
            {coupon.restrictedToEmail && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded text-xs">
                <Mail className="w-3 h-3" />
                Email
              </span>
            )}
            {coupon.restrictedToCourseId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded text-xs">
                <BookOpen className="w-3 h-3" />
                Curso
              </span>
            )}
            {coupon.minPurchaseAmount && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded text-xs">
                <DollarSign className="w-3 h-3" />
                Min: {formatCurrency(coupon.minPurchaseAmount)}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleActive}
            className={`h-8 w-8 ${
              coupon.isActive
                ? 'text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
            title={coupon.isActive ? 'Desactivar' : 'Activar'}
          >
            {coupon.isActive ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-[#143F3B]/10 dark:hover:bg-[#143F3B]/20"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          {coupon.currentUses === 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
        <div className="col-span-3 flex items-center gap-3 min-w-0">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              couponStatus === 'active'
                ? 'bg-[#143F3B]/10 dark:bg-[#143F3B]/20 text-[#143F3B] dark:text-[#6B9B7A]'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
            }`}
          >
            <Ticket className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <Button
              variant="link"
              onClick={onEdit}
              className="h-auto p-0 font-mono font-bold text-sm text-stone-900 dark:text-stone-100 hover:text-[#143F3B] dark:hover:text-[#6B9B7A]"
            >
              {coupon.code}
            </Button>
            {coupon.description && (
              <p
                className="text-xs text-stone-500 dark:text-stone-400 truncate"
                title={coupon.description}
              >
                {coupon.description}
              </p>
            )}
          </div>
        </div>

        <div className="col-span-1">
          <span className="text-lg font-bold text-[#143F3B] dark:text-[#6B9B7A]">
            -{coupon.discountPercent}%
          </span>
        </div>

        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent >= 90
                    ? 'bg-red-500'
                    : usagePercent >= 70
                      ? 'bg-amber-500'
                      : 'bg-[#143F3B]'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">
              {coupon.currentUses}/{coupon.maxUses}
            </span>
          </div>
        </div>

        <div className="col-span-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${status.className}`}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          {coupon.expiresAt && (
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
              Expira: {formatDate(coupon.expiresAt)}
            </p>
          )}
        </div>

        <div className="col-span-2">
          <div className="flex flex-wrap gap-1">
            {coupon.restrictedToEmail && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded text-[10px]"
                title={coupon.restrictedToEmail}
              >
                <Mail className="w-2.5 h-2.5" />
              </span>
            )}
            {coupon.restrictedToCourseId && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded text-[10px]">
                <BookOpen className="w-2.5 h-2.5" />
              </span>
            )}
            {coupon.minPurchaseAmount && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded text-[10px]"
                title={`Mínimo: ${formatCurrency(coupon.minPurchaseAmount)}`}
              >
                <DollarSign className="w-2.5 h-2.5" />
              </span>
            )}
            {!hasRestrictions && (
              <span className="text-xs text-stone-400 dark:text-stone-500">
                Sin restricciones
              </span>
            )}
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleActive}
            className={`h-8 w-8 opacity-0 group-hover:opacity-100 ${
              coupon.isActive
                ? 'text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
            title={coupon.isActive ? 'Desactivar' : 'Activar'}
          >
            {coupon.isActive ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-[#143F3B]/10 dark:hover:bg-[#143F3B]/20 opacity-0 group-hover:opacity-100"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          {coupon.currentUses === 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 opacity-0 group-hover:opacity-100"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
