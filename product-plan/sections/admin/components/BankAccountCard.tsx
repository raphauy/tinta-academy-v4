import {
  Building2,
  User,
  CreditCard,
  Hash,
  DollarSign,
  FileText,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Check
} from 'lucide-react'
import type { BankData } from '@/../product/sections/admin/types'
import { useState } from 'react'

interface BankAccountCardProps {
  bankData: BankData
  onEdit?: () => void
  onDelete?: () => void
}

export function BankAccountCard({ bankData, onEdit, onDelete }: BankAccountCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(bankData.accountNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const currencyConfig = {
    USD: {
      label: 'Dólares',
      className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
    },
    UYU: {
      label: 'Pesos UY',
      className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900'
    }
  }

  const currency = currencyConfig[bankData.currency] || currencyConfig.USD

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg hover:shadow-teal-500/5">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              {bankData.bankName}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${currency.className}`}>
                {currency.label}
              </span>
              {bankData.isActive ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  Activa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
                  <XCircle className="w-3 h-3" />
                  Inactiva
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Account Holder */}
        <div className="flex items-start gap-3">
          <User className="w-4 h-4 text-stone-400 dark:text-stone-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-0.5">Titular</p>
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
              {bankData.accountHolder}
            </p>
          </div>
        </div>

        {/* Account Type */}
        <div className="flex items-start gap-3">
          <CreditCard className="w-4 h-4 text-stone-400 dark:text-stone-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-0.5">Tipo de cuenta</p>
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
              {bankData.accountType}
            </p>
          </div>
        </div>

        {/* Account Number */}
        <div className="flex items-start gap-3">
          <Hash className="w-4 h-4 text-stone-400 dark:text-stone-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-0.5">Número de cuenta</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono font-medium text-stone-900 dark:text-stone-100">
                {bankData.accountNumber}
              </p>
              <button
                onClick={handleCopyAccount}
                className="p-1 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded transition-colors"
                title="Copiar número de cuenta"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        {bankData.notes && (
          <div className="flex items-start gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
            <FileText className="w-4 h-4 text-stone-400 dark:text-stone-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-0.5">Notas</p>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                {bankData.notes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
