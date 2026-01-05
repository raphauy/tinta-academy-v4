import {
  Building2,
  Plus,
  Info
} from 'lucide-react'
import type { AdminBankDataProps } from '@/../product/sections/admin/types'
import { BankAccountCard } from './BankAccountCard'

export function AdminBankData({
  bankData,
  onEdit,
  onDelete,
  onCreate
}: AdminBankDataProps) {
  const activeAccounts = bankData.filter(b => b.isActive).length
  const usdAccounts = bankData.filter(b => b.currency === 'USD').length
  const uyuAccounts = bankData.filter(b => b.currency === 'UYU').length

  return (
    <div className="p-4 sm:p-6 pb-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
            Datos Bancarios
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Cuentas bancarias para recibir pagos por transferencia
          </p>
        </div>

        <button
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 rounded-xl shadow-sm shadow-teal-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cuenta</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 mb-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl">
        <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Información para transferencias</p>
          <p className="text-blue-600 dark:text-blue-400">
            Estas cuentas se mostrarán a los estudiantes cuando elijan pagar por transferencia bancaria.
            Asegúrate de que los datos estén actualizados.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
        <span className="text-stone-500 dark:text-stone-400">
          <span className="font-semibold text-stone-900 dark:text-stone-100">{bankData.length}</span> cuenta{bankData.length !== 1 ? 's' : ''} registrada{bankData.length !== 1 ? 's' : ''}
        </span>
        <span className="text-stone-300 dark:text-stone-600">•</span>
        <span className="text-stone-500 dark:text-stone-400">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activeAccounts}</span> activa{activeAccounts !== 1 ? 's' : ''}
        </span>
        <span className="text-stone-300 dark:text-stone-600">•</span>
        <span className="text-stone-500 dark:text-stone-400">
          <span className="font-semibold text-stone-900 dark:text-stone-100">{usdAccounts}</span> USD
        </span>
        <span className="text-stone-300 dark:text-stone-600">•</span>
        <span className="text-stone-500 dark:text-stone-400">
          <span className="font-semibold text-stone-900 dark:text-stone-100">{uyuAccounts}</span> UYU
        </span>
      </div>

      {/* Bank Accounts Grid */}
      {bankData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bankData.map(account => (
            <BankAccountCard
              key={account.id}
              bankData={account}
              onEdit={() => onEdit?.(account.id)}
              onDelete={() => onDelete?.(account.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            Sin cuentas bancarias
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm mb-4">
            Agrega cuentas bancarias para que los estudiantes puedan pagar por transferencia
          </p>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar primera cuenta
          </button>
        </div>
      )}
    </div>
  )
}
