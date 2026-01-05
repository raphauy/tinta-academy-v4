import { useState } from 'react'
import { Plus, Search, Send, Clock, FileEdit, CheckCircle2 } from 'lucide-react'
import type { EmailCampaignListProps } from '@/../product/sections/educator-panel/types'
import { EmailCampaignCard } from './EmailCampaignCard'

type StatusFilter = 'all' | 'draft' | 'scheduled' | 'sent'

export function EmailCampaignList({
  campaigns,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onCreate
}: EmailCampaignListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // Count by status
  const countByStatus = {
    all: campaigns.length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    sent: campaigns.filter(c => c.status === 'sent').length
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!campaign.subject.toLowerCase().includes(query) &&
          !campaign.courseName.toLowerCase().includes(query) &&
          !campaign.templateName.toLowerCase().includes(query)) {
        return false
      }
    }

    // Status filter
    if (statusFilter !== 'all' && campaign.status !== statusFilter) {
      return false
    }

    return true
  })

  // Sort: drafts first, then scheduled, then sent (most recent first)
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    const statusOrder = { draft: 0, scheduled: 1, sent: 2 }
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    // Within same status, sort by date
    const dateA = a.sentAt || a.scheduledAt || ''
    const dateB = b.sentAt || b.scheduledAt || ''
    return dateB.localeCompare(dateA)
  })

  const statusTabs: { value: StatusFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'Todas', icon: null },
    { value: 'draft', label: 'Borradores', icon: <FileEdit className="w-3.5 h-3.5" /> },
    { value: 'scheduled', label: 'Programadas', icon: <Clock className="w-3.5 h-3.5" /> },
    { value: 'sent', label: 'Enviadas', icon: <CheckCircle2 className="w-3.5 h-3.5" /> }
  ]

  return (
    <div className="p-6 pb-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-0.5">
            Campañas de Email
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Historial de comunicaciones enviadas a tus alumnos
          </p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Campaña</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus-within:ring-2 focus-within:ring-[#143F3B]/20 focus-within:border-[#143F3B] dark:focus-within:border-[#6B9B7A] transition-colors">
            <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar campañas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 py-2 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
            {statusTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className={`text-xs ${
                  statusFilter === tab.value
                    ? 'text-stone-500 dark:text-stone-400'
                    : 'text-stone-400 dark:text-stone-500'
                }`}>
                  {countByStatus[tab.value]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredCampaigns.length === campaigns.length
            ? `${campaigns.length} campañas`
            : `${filteredCampaigns.length} de ${campaigns.length} campañas`}
        </p>
      </div>

      {/* Campaigns List */}
      {sortedCampaigns.length > 0 ? (
        <div className="space-y-3">
          {sortedCampaigns.map(campaign => (
            <EmailCampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={() => onView?.(campaign.id)}
              onEdit={() => onEdit?.(campaign.id)}
              onDelete={() => onDelete?.(campaign.id)}
              onDuplicate={() => onDuplicate?.(campaign.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
          {searchQuery || statusFilter !== 'all' ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 mb-3">
                <Search className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 mb-1">
                No se encontraron campañas
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                Intenta con otros filtros o términos de búsqueda
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
                className="text-sm font-medium text-[#143F3B] dark:text-[#6B9B7A] hover:underline"
              >
                Limpiar filtros
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#143F3B]/10 dark:bg-[#143F3B]/20 mb-3">
                <Send className="w-6 h-6 text-[#143F3B] dark:text-[#6B9B7A]" />
              </div>
              <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 mb-1">
                Crea tu primera campaña
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 max-w-sm mx-auto">
                Envía comunicaciones masivas a los alumnos de tus cursos usando tus templates.
              </p>
              <button
                onClick={onCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Campaña</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
