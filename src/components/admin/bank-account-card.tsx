'use client'

import {
  Building2,
  Copy,
  Check,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  Globe,
} from 'lucide-react'
import { useState } from 'react'
import type { BankAccount, Currency } from '@prisma/client'

interface BankAccountCardProps {
  account: BankAccount
  onEdit?: () => void
  onToggleActive?: () => void
  onDelete?: () => void
}

const currencyConfig: Record<Currency, { label: string; symbol: string; className: string }> = {
  USD: {
    label: 'USD',
    symbol: '$',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  UYU: {
    label: 'UYU',
    symbol: '$',
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  },
}

export function BankAccountCard({
  account,
  onEdit,
  onToggleActive,
  onDelete,
}: BankAccountCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const currency = currencyConfig[account.currency] || currencyConfig.USD

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const renderCopyButton = (value: string, field: string) => (
    <button
      onClick={(e) => {
        e.stopPropagation()
        copyToClipboard(value, field)
      }}
      className="p-1 text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] rounded transition-colors"
      title="Copiar"
    >
      {copiedField === field ? (
        <Check className="w-3.5 h-3.5 text-emerald-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  )

  return (
    <div
      className={`group relative bg-white dark:bg-stone-900 border rounded-xl overflow-hidden transition-all duration-200 ${
        account.isActive
          ? 'border-stone-200 dark:border-stone-700 hover:border-[#143F3B]/30 dark:hover:border-[#6B9B7A]/30 hover:shadow-lg hover:shadow-[#143F3B]/5'
          : 'border-stone-200 dark:border-stone-700 opacity-60'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#143F3B]/10 dark:bg-[#143F3B]/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                {account.bankName}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {account.accountType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${currency.className}`}>
              {currency.label}
            </span>
            {!account.isActive && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-500">
                Inactiva
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 px-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">
                Titular
              </p>
              <p className="font-medium text-sm text-stone-900 dark:text-stone-100">
                {account.accountHolder}
              </p>
            </div>
            {renderCopyButton(account.accountHolder, 'holder')}
          </div>

          <div className="flex items-center justify-between py-2 px-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">
                Numero de Cuenta
              </p>
              <p className="font-mono font-medium text-sm text-stone-900 dark:text-stone-100">
                {account.accountNumber}
              </p>
            </div>
            {renderCopyButton(account.accountNumber, 'number')}
          </div>

          {account.swiftCode && (
            <div className="flex items-center justify-between py-2 px-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-0.5">
                    SWIFT/BIC
                  </p>
                  <p className="font-mono font-medium text-sm text-blue-700 dark:text-blue-300">
                    {account.swiftCode}
                  </p>
                </div>
              </div>
              {renderCopyButton(account.swiftCode, 'swift')}
            </div>
          )}

          {account.routingNumber && (
            <div className="flex items-center justify-between py-2 px-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">
                  Routing Number
                </p>
                <p className="font-mono font-medium text-sm text-stone-900 dark:text-stone-100">
                  {account.routingNumber}
                </p>
              </div>
              {renderCopyButton(account.routingNumber, 'routing')}
            </div>
          )}

          {account.notes && (
            <div className="py-2 px-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {account.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
            <GripVertical className="w-3.5 h-3.5" />
            <span>Orden: {account.displayOrder}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleActive}
              className={`p-1.5 rounded-md transition-colors ${
                account.isActive
                  ? 'text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
              title={account.isActive ? 'Desactivar' : 'Activar'}
            >
              {account.isActive ? (
                <ToggleRight className="w-4 h-4" />
              ) : (
                <ToggleLeft className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-[#143F3B]/10 dark:hover:bg-[#143F3B]/20 rounded-md transition-colors"
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
    </div>
  )
}
