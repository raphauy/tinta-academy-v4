import { useState } from 'react'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
  FileEdit,
  Users,
  Mail,
  MailOpen
} from 'lucide-react'
import type { EmailCampaign } from '@/../product/sections/educator-panel/types'

interface EmailCampaignCardProps {
  campaign: EmailCampaign
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
}

export function EmailCampaignCard({
  campaign,
  onView,
  onEdit,
  onDelete,
  onDuplicate
}: EmailCampaignCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Format datetime
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Status config
  const statusConfig = {
    draft: {
      label: 'Borrador',
      icon: <FileEdit className="w-3.5 h-3.5" />,
      className: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
    },
    scheduled: {
      label: 'Programada',
      icon: <Clock className="w-3.5 h-3.5" />,
      className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    },
    sent: {
      label: 'Enviada',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
    }
  }

  const status = statusConfig[campaign.status]

  return (
    <div className="group bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ${status.className}`}>
              {status.icon}
              {status.label}
            </span>

            <div className="min-w-0 flex-1">
              {/* Subject */}
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1 truncate">
                {campaign.subject}
              </h3>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {campaign.templateName}
                </span>
                <span>→</span>
                <span>{campaign.courseName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 lg:gap-8">
          {/* Recipients */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-stone-400" />
            <div className="text-right">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {campaign.status === 'sent' ? campaign.sentCount : campaign.recipientCount}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {campaign.status === 'sent' ? 'enviados' : 'destinatarios'}
              </p>
            </div>
          </div>

          {/* Open Rate (only for sent) */}
          {campaign.status === 'sent' && campaign.openRate !== null && (
            <div className="flex items-center gap-2">
              <MailOpen className="w-4 h-4 text-stone-400" />
              <div className="text-right">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {campaign.openRate}%
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  apertura
                </p>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="text-right min-w-[100px]">
            {campaign.status === 'sent' && campaign.sentAt ? (
              <>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {formatDateTime(campaign.sentAt)}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">enviado</p>
              </>
            ) : campaign.status === 'scheduled' && campaign.scheduledAt ? (
              <>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {formatDateTime(campaign.scheduledAt)}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">programado</p>
              </>
            ) : (
              <p className="text-sm text-stone-400 dark:text-stone-500">Sin programar</p>
            )}
          </div>

          {/* Actions */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 py-1">
                  <button
                    onClick={() => {
                      onView?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalles
                  </button>
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => {
                        onEdit?.()
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDuplicate?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </button>
                  {campaign.status !== 'sent' && (
                    <>
                      <hr className="my-1 border-stone-200 dark:border-stone-700" />
                      <button
                        onClick={() => {
                          onDelete?.()
                          setShowMenu(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
