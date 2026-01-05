import { useState } from 'react'
import {
  Ticket,
  Percent,
  Mail,
  BookOpen,
  BarChart3,
  Pencil,
  Trash2,
  Calendar,
  Users,
  Clock,
  Copy,
  Check
} from 'lucide-react'
import type { Coupon } from '@/../product/sections/admin/types'

interface CouponRowProps {
  coupon: Coupon
  onViewStats?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

type CouponStatus = 'active' | 'inactive' | 'expired' | 'exhausted'

function getCouponStatus(coupon: Coupon): CouponStatus {
  if (!coupon.isActive) return 'inactive'
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return 'expired'
  if (coupon.currentUses >= coupon.maxUses) return 'exhausted'
  return 'active'
}

const statusConfig: Record<CouponStatus, { label: string; className: string }> = {
  active: {
    label: 'Activo',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
  },
  inactive: {
    label: 'Inactivo',
    className: 'bg-stone-50 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700'
  },
  expired: {
    label: 'Expirado',
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900'
  },
  exhausted: {
    label: 'Agotado',
    className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatExpirationDate(dateString: string | null): string {
  if (!dateString) return 'Sin fecha'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Expirado'
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  if (diffDays <= 7) return `${diffDays} días`
  return formatDate(dateString)
}

export function CouponRow({ coupon, onViewStats, onEdit, onDelete }: CouponRowProps) {
  const [copied, setCopied] = useState(false)
  const status = getCouponStatus(coupon)
  const statusStyle = statusConfig[status]
  const usagePercent = Math.round((coupon.currentUses / coupon.maxUses) * 100)
  const isExpiringSoon = coupon.expiresAt && (() => {
    const diffDays = Math.ceil((new Date(coupon.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 7
  })()

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="group px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Coupon Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              status === 'active'
                ? 'bg-[#143F3B]/10 dark:bg-[#143F3B]/20 text-[#143F3B] dark:text-[#6B9B7A]'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
            }`}>
              <Ticket className="w-5 h-5" />
            </div>

            {/* Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold text-stone-900 dark:text-stone-100 tracking-wide">
                  {coupon.code}
                </p>
                <button
                  onClick={handleCopyCode}
                  className="p-1 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusStyle.className}`}>
                  {statusStyle.label}
                </span>
                <span className="text-lg font-bold text-teal-700 dark:text-teal-400">
                  {coupon.discountPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 dark:text-stone-400">
              {coupon.currentUses} de {coupon.maxUses} usos
            </span>
            <span className={`font-medium ${
              usagePercent >= 90 ? 'text-red-600 dark:text-red-400' :
              usagePercent >= 70 ? 'text-amber-600 dark:text-amber-400' :
              'text-stone-500 dark:text-stone-400'
            }`}>
              {usagePercent}%
            </span>
          </div>
          <div className="h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePercent >= 90 ? 'bg-red-500' :
                usagePercent >= 70 ? 'bg-amber-500' :
                'bg-teal-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {/* Restrictions */}
        {(coupon.restrictedEmail || coupon.restrictedCourseName) && (
          <div className="flex flex-wrap gap-2">
            {coupon.restrictedEmail && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs rounded-md">
                <Mail className="w-3 h-3" />
                {coupon.restrictedEmail.length > 20
                  ? coupon.restrictedEmail.substring(0, 20) + '...'
                  : coupon.restrictedEmail}
              </span>
            )}
            {coupon.restrictedCourseName && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 text-xs rounded-md">
                <BookOpen className="w-3 h-3" />
                {coupon.restrictedCourseName.length > 20
                  ? coupon.restrictedCourseName.substring(0, 20) + '...'
                  : coupon.restrictedCourseName}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(coupon.createdAt)}
            </span>
            {coupon.expiresAt && (
              <span className={`flex items-center gap-1 ${
                isExpiringSoon ? 'text-amber-600 dark:text-amber-400' : ''
              }`}>
                <Clock className="w-3 h-3" />
                {formatExpirationDate(coupon.expiresAt)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onViewStats}
              className="p-1.5 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-md transition-colors"
              title="Ver estadísticas"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-md transition-colors"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
        {/* Code & Status - 3 cols */}
        <div className="col-span-3 flex items-center gap-3 min-w-0">
          <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
            status === 'active'
              ? 'bg-[#143F3B]/10 dark:bg-[#143F3B]/20 text-[#143F3B] dark:text-[#6B9B7A]'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
          }`}>
            <Ticket className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-mono font-semibold text-sm text-stone-900 dark:text-stone-100 tracking-wide">
                {coupon.code}
              </p>
              <button
                onClick={handleCopyCode}
                className="p-0.5 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                title="Copiar código"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusStyle.className}`}>
              {statusStyle.label}
            </span>
          </div>
        </div>

        {/* Discount - 2 cols */}
        <div className="col-span-2">
          <span className="inline-flex items-center gap-1 text-lg font-bold text-teal-700 dark:text-teal-400">
            <Percent className="w-4 h-4" />
            {coupon.discountPercent}
          </span>
        </div>

        {/* Usage - 2 cols */}
        <div className="col-span-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Users className="w-3 h-3 text-stone-400" />
              <span className="text-stone-600 dark:text-stone-300">
                {coupon.currentUses}/{coupon.maxUses}
              </span>
            </div>
            <div className="h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden w-20">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent >= 90 ? 'bg-red-500' :
                  usagePercent >= 70 ? 'bg-amber-500' :
                  'bg-teal-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Restrictions - 2 cols */}
        <div className="col-span-2">
          {coupon.restrictedEmail || coupon.restrictedCourseName ? (
            <div className="space-y-1">
              {coupon.restrictedEmail && (
                <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400" title={coupon.restrictedEmail}>
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[100px]">{coupon.restrictedEmail}</span>
                </span>
              )}
              {coupon.restrictedCourseName && (
                <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400" title={coupon.restrictedCourseName}>
                  <BookOpen className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[100px]">{coupon.restrictedCourseName}</span>
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-stone-400 dark:text-stone-500">Sin restricciones</span>
          )}
        </div>

        {/* Expiration - 1 col */}
        <div className="col-span-1">
          <span className={`text-xs ${
            isExpiringSoon
              ? 'text-amber-600 dark:text-amber-400 font-medium'
              : 'text-stone-500 dark:text-stone-400'
          }`}>
            {formatExpirationDate(coupon.expiresAt)}
          </span>
        </div>

        {/* Actions - 2 cols */}
        <div className="col-span-2 flex items-center justify-end gap-1">
          <button
            onClick={onViewStats}
            className="p-1.5 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Ver estadísticas"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
