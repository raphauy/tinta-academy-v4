'use client'

import { useState, useMemo } from 'react'
import {
  Mail,
  Search,
  X,
  ChevronDown,
  Calendar,
  Send,
  Eye,
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
import type { EmailCampaignStatus } from '@prisma/client'
import { AdminMetricCard } from './admin-metric-card'
import { CommunicationRow, type CampaignWithRelations } from './communication-row'

type SortField = 'name' | 'educator' | 'recipients' | 'createdAt' | 'status'
type SortDirection = 'asc' | 'desc'
type StatusFilter = 'all' | EmailCampaignStatus

interface AdminCommunicationsStats {
  totalCampaigns: number
  campaignsThisMonth: number
  deliveryRate: number
  openRate: number
}

interface EducatorOption {
  id: string
  name: string
  _count: {
    emailCampaigns: number
  }
}

export interface AdminCommunicationsProps {
  campaigns: CampaignWithRelations[]
  stats: AdminCommunicationsStats
  educators: EducatorOption[]
  onViewDetails?: (id: string) => void
}

export function AdminCommunications({
  campaigns,
  stats,
  educators,
  onViewDetails,
}: AdminCommunicationsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [educatorFilter, setEducatorFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns]

    if (statusFilter !== 'all') {
      result = result.filter((campaign) => campaign.status === statusFilter)
    }

    if (educatorFilter !== 'all') {
      result = result.filter((campaign) => campaign.educator.id === educatorFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(query) ||
          campaign.educator.name.toLowerCase().includes(query) ||
          campaign.template.subject.toLowerCase().includes(query) ||
          (campaign.course?.title.toLowerCase() || '').includes(query)
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'educator':
          comparison = a.educator.name.localeCompare(b.educator.name)
          break
        case 'recipients':
          comparison = a.totalRecipients - b.totalRecipients
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
  }, [campaigns, searchQuery, statusFilter, educatorFilter, sortField, sortDirection])

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
      className={`h-auto px-1 py-0 text-xs font-medium ${
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
    </Button>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          Comunicaciones
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Historial global de campañas de email de todos los educadores
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Total Campañas"
          value={stats.totalCampaigns}
          icon={<Mail className="w-4 h-4" />}
          variant="primary"
        />
        <AdminMetricCard
          label="Este Mes"
          value={stats.campaignsThisMonth}
          icon={<Calendar className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Tasa de Entrega"
          value={`${stats.deliveryRate}%`}
          icon={<Send className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Tasa de Apertura"
          value={`${stats.openRate}%`}
          icon={<Eye className="w-4 h-4" />}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <Input
            type="text"
            placeholder="Buscar por nombre, educador o curso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-background"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Select
          value={educatorFilter}
          onValueChange={setEducatorFilter}
        >
          <SelectTrigger className="w-full sm:w-48 bg-background">
            <SelectValue placeholder="Educador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los educadores</SelectItem>
            {educators.map((educator) => (
              <SelectItem key={educator.id} value={educator.id}>
                {educator.name} ({educator._count.emailCampaigns})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-40 bg-background">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="scheduled">Programado</SelectItem>
            <SelectItem value="sending">Enviando</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="partially_sent">Parcial</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredCampaigns.length === 0
            ? 'No se encontraron campañas'
            : filteredCampaigns.length === 1
              ? '1 campaña'
              : `${filteredCampaigns.length} campañas`}
          {(searchQuery || statusFilter !== 'all' || educatorFilter !== 'all') &&
            campaigns.length !== filteredCampaigns.length && (
              <span className="text-stone-400 dark:text-stone-500">
                {' '}de {campaigns.length} totales
              </span>
            )}
        </p>

        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 dark:text-stone-500">
            Ordenar por:
          </span>
          <div className="flex items-center gap-3">
            {renderSortButton('name', 'Nombre')}
            {renderSortButton('educator', 'Educador')}
            {renderSortButton('recipients', 'Destinatarios')}
            {renderSortButton('status', 'Estado')}
            {renderSortButton('createdAt', 'Fecha')}
          </div>
        </div>
      </div>

      {filteredCampaigns.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
            <div className="col-span-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Campaña
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Educador / Curso
            </div>
            <div className="col-span-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-center">
              Dest.
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-center">
              Métricas
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Estado
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
              Acciones
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {filteredCampaigns.map((campaign) => (
              <CommunicationRow
                key={campaign.id}
                campaign={campaign}
                onViewDetails={() => onViewDetails?.(campaign.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            Sin resultados
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
            {searchQuery || statusFilter !== 'all' || educatorFilter !== 'all'
              ? 'No se encontraron campañas con los filtros aplicados'
              : 'No hay campañas de email registradas en la plataforma'}
          </p>
          {(searchQuery || statusFilter !== 'all' || educatorFilter !== 'all') && (
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setEducatorFilter('all')
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
