'use client'

import { useState, useMemo } from 'react'
import {
  Building2,
  Plus,
  DollarSign,
  Globe,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BankAccount, Currency } from '@prisma/client'
import { AdminMetricCard } from './admin-metric-card'
import { BankAccountCard } from './bank-account-card'

type CurrencyFilter = 'all' | Currency
type StatusFilter = 'all' | 'active' | 'inactive'

interface BankStats {
  total: number
  active: number
  usd: number
  uyu: number
}

function calculateStats(accounts: BankAccount[]): BankStats {
  return {
    total: accounts.length,
    active: accounts.filter((a) => a.isActive).length,
    usd: accounts.filter((a) => a.currency === 'USD' && a.isActive).length,
    uyu: accounts.filter((a) => a.currency === 'UYU' && a.isActive).length,
  }
}

export interface AdminBankDataProps {
  accounts: BankAccount[]
  onCreateNew?: () => void
  onEdit?: (id: string) => void
  onToggleActive?: (id: string) => void
  onDelete?: (id: string) => void
}

export function AdminBankData({
  accounts,
  onCreateNew,
  onEdit,
  onToggleActive,
  onDelete,
}: AdminBankDataProps) {
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const stats = useMemo(() => calculateStats(accounts), [accounts])

  const filteredAccounts = useMemo(() => {
    let result = [...accounts]

    if (currencyFilter !== 'all') {
      result = result.filter((account) => account.currency === currencyFilter)
    }

    if (statusFilter !== 'all') {
      result = result.filter((account) =>
        statusFilter === 'active' ? account.isActive : !account.isActive
      )
    }

    result.sort((a, b) => a.displayOrder - b.displayOrder)

    return result
  }, [accounts, currencyFilter, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
            Datos Bancarios
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Gestiona las cuentas bancarias para recibir pagos por transferencia
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-[#143F3B] hover:bg-[#0e2c29] text-white dark:bg-[#143F3B] dark:hover:bg-[#1e5a54]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cuenta
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Total Cuentas"
          value={stats.total}
          icon={<Building2 className="w-4 h-4" />}
          variant="primary"
        />
        <AdminMetricCard
          label="Activas"
          value={stats.active}
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Cuentas USD"
          value={stats.usd}
          icon={<DollarSign className="w-4 h-4" />}
          subtitle="Dolares"
        />
        <AdminMetricCard
          label="Cuentas UYU"
          value={stats.uyu}
          icon={<Globe className="w-4 h-4" />}
          subtitle="Pesos Uruguayos"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={currencyFilter}
          onValueChange={(value) => setCurrencyFilter(value as CurrencyFilter)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Moneda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-stone-400" />
                Todas las monedas
              </span>
            </SelectItem>
            <SelectItem value="USD">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                USD - Dolares
              </span>
            </SelectItem>
            <SelectItem value="UYU">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-500" />
                UYU - Pesos
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-stone-400" />
                Todos
              </span>
            </SelectItem>
            <SelectItem value="active">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Activas
              </span>
            </SelectItem>
            <SelectItem value="inactive">
              <span className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-stone-400" />
                Inactivas
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-stone-500 dark:text-stone-400">
        {filteredAccounts.length === 0
          ? 'No se encontraron cuentas'
          : filteredAccounts.length === 1
            ? '1 cuenta bancaria'
            : `${filteredAccounts.length} cuentas bancarias`}
        {(currencyFilter !== 'all' || statusFilter !== 'all') &&
          accounts.length !== filteredAccounts.length && (
            <span className="text-stone-400 dark:text-stone-500">
              {' '}de {accounts.length} totales
            </span>
          )}
      </p>

      {filteredAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAccounts.map((account) => (
            <BankAccountCard
              key={account.id}
              account={account}
              onEdit={() => onEdit?.(account.id)}
              onToggleActive={() => onToggleActive?.(account.id)}
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
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
            {currencyFilter !== 'all' || statusFilter !== 'all'
              ? 'No se encontraron cuentas con los filtros aplicados'
              : 'Agrega una cuenta bancaria para recibir pagos por transferencia'}
          </p>
          {currencyFilter !== 'all' || statusFilter !== 'all' ? (
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setCurrencyFilter('all')
                setStatusFilter('all')
              }}
            >
              Limpiar filtros
            </Button>
          ) : (
            <Button
              onClick={onCreateNew}
              className="mt-4 bg-[#143F3B] hover:bg-[#0e2c29] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar cuenta
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
