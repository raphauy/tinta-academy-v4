import { useState, useEffect } from 'react'
import {
  X,
  Mail,
  Copy,
  Check,
  Search,
  Calendar,
  Send,
  Users,
  ExternalLink
} from 'lucide-react'
import type { CourseObserver } from '@/../product/sections/admin/types'

interface CourseObserversModalProps {
  isOpen: boolean
  courseTitle: string
  courseId: string
  observers: CourseObserver[]
  onClose?: () => void
  onSendEmail?: (email: string) => void
  onSendBulkEmail?: (courseId: string, emails: string[]) => void
  onCopyEmails?: (emails: string[]) => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`
  return formatDate(dateString)
}

export function CourseObserversModal({
  isOpen,
  courseTitle,
  courseId,
  observers,
  onClose,
  onSendEmail,
  onSendBulkEmail,
  onCopyEmails
}: CourseObserversModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setCopiedAll(false)
      setCopiedEmail(null)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const filteredObservers = observers.filter(observer =>
    observer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const allEmails = observers.map(o => o.email)
  const filteredEmails = filteredObservers.map(o => o.email)

  const handleCopyAll = async () => {
    const emails = filteredEmails.join(', ')
    try {
      await navigator.clipboard.writeText(emails)
      setCopiedAll(true)
      onCopyEmails?.(filteredEmails)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(email)
      setTimeout(() => setCopiedEmail(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white dark:bg-gris-tinta-900 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-stone-100 dark:border-gris-tinta-700">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-gris-tinta-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="pr-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-verde-uva-100 dark:bg-verde-uva-900/50 flex items-center justify-center">
                <Users className="w-4 h-4 text-verde-uva-600 dark:text-verde-uva-400" />
              </div>
              <span className="text-xs font-medium text-verde-uva-600 dark:text-verde-uva-400 bg-verde-uva-50 dark:bg-verde-uva-950/50 px-2 py-0.5 rounded-full">
                {observers.length} {observers.length === 1 ? 'interesado' : 'interesados'}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 line-clamp-2">
              {courseTitle}
            </h2>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-gris-tinta-700 bg-stone-50/50 dark:bg-gris-tinta-800/50">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
              <input
                type="text"
                placeholder="Buscar por email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gris-tinta-900 border border-stone-200 dark:border-gris-tinta-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-verde-uva-500/20 focus:border-verde-uva-500 transition-all"
              />
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAll}
                disabled={filteredEmails.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-gris-tinta-800 border border-stone-200 dark:border-gris-tinta-600 rounded-xl hover:bg-stone-50 dark:hover:bg-gris-tinta-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-verde-uva-600 dark:text-verde-uva-400" />
                    Copiados
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar emails
                  </>
                )}
              </button>
              <button
                onClick={() => onSendBulkEmail?.(courseId, filteredEmails)}
                disabled={filteredEmails.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-verde-uva-600 hover:bg-verde-uva-700 dark:bg-verde-uva-700 dark:hover:bg-verde-uva-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-verde-uva-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar a todos
              </button>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="max-h-80 overflow-y-auto">
          {filteredObservers.length > 0 ? (
            <ul className="divide-y divide-stone-100 dark:divide-gris-tinta-700">
              {filteredObservers.map(observer => (
                <li
                  key={observer.id}
                  className="group flex items-center justify-between px-6 py-3 hover:bg-stone-50 dark:hover:bg-gris-tinta-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-verde-uva-400 to-verde-uva-600 flex items-center justify-center text-white text-sm font-medium">
                      {observer.email.charAt(0).toUpperCase()}
                    </div>

                    {/* Email & Date */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {observer.email}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatRelativeDate(observer.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyEmail(observer.email)}
                      className="p-2 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-gris-tinta-700 rounded-lg transition-colors"
                      title="Copiar email"
                    >
                      {copiedEmail === observer.email ? (
                        <Check className="w-4 h-4 text-verde-uva-600 dark:text-verde-uva-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onSendEmail?.(observer.email)}
                      className="p-2 text-stone-400 hover:text-verde-uva-600 dark:text-stone-500 dark:hover:text-verde-uva-400 hover:bg-verde-uva-50 dark:hover:bg-verde-uva-950/50 rounded-lg transition-colors"
                      title="Enviar email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-gris-tinta-800 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-stone-400 dark:text-stone-500" />
              </div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                Sin resultados
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
                No se encontraron emails que coincidan con "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 dark:border-gris-tinta-700 bg-stone-50/50 dark:bg-gris-tinta-800/50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {searchQuery && filteredObservers.length !== observers.length
                ? `Mostrando ${filteredObservers.length} de ${observers.length}`
                : `${observers.length} ${observers.length === 1 ? 'interesado' : 'interesados'} en total`}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-gris-tinta-700 rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
