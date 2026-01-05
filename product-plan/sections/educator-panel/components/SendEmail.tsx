import { useState } from 'react'
import {
  Send,
  Clock,
  Users,
  Mail,
  ChevronDown,
  Check,
  Calendar,
  Eye
} from 'lucide-react'
import type { SendEmailProps } from '@/../product/sections/educator-panel/types'

export function SendEmail({
  courses,
  templates,
  onSend,
  onCancel
}: SendEmailProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now')
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [scheduledTime, setScheduledTime] = useState<string>('09:00')
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false)

  const selectedCourse = courses.find(c => c.id === selectedCourseId)
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  // Get recipient count from selected course
  const recipientCount = selectedCourse?.modality === 'online'
    ? selectedCourse.totalStudents || 0
    : selectedCourse?.enrolledCount || 0

  // Check if form is valid
  const isValid = selectedCourseId && selectedTemplateId && (
    scheduleType === 'now' || (scheduleType === 'scheduled' && scheduledDate)
  )

  // Handle send
  const handleSend = () => {
    if (!isValid) return

    const scheduledAt = scheduleType === 'scheduled' && scheduledDate
      ? `${scheduledDate}T${scheduledTime}:00`
      : null

    onSend?.(selectedCourseId, selectedTemplateId, scheduledAt)
  }

  // Preview email body with sample values
  const getPreviewBody = (body: string) => {
    return body
      .replace(/\{\{nombre\}\}/g, 'Juan')
      .replace(/\{\{curso\}\}/g, selectedCourse?.title || '[Curso]')
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-0.5">
          Enviar Comunicación
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Envía un email masivo a los alumnos de un curso
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Course Selection */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
            <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-3">
              Destinatarios
            </label>

            <div className="relative">
              <button
                onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-left hover:border-stone-300 dark:hover:border-stone-600 transition-colors"
              >
                {selectedCourse ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#143F3B]/10 dark:bg-[#143F3B]/20 flex-shrink-0">
                      <Users className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {selectedCourse.title}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {recipientCount} {recipientCount === 1 ? 'alumno' : 'alumnos'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-stone-400">Selecciona un curso...</span>
                )}
                <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
              </button>

              {showCourseDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCourseDropdown(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                    {courses.filter(c => c.status === 'published').map(course => {
                      const count = course.modality === 'online'
                        ? course.totalStudents || 0
                        : course.enrolledCount || 0
                      return (
                        <button
                          key={course.id}
                          onClick={() => {
                            setSelectedCourseId(course.id)
                            setShowCourseDropdown(false)
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${
                            selectedCourseId === course.id ? 'bg-[#143F3B]/5 dark:bg-[#143F3B]/10' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                              {course.title}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              {count} {count === 1 ? 'alumno' : 'alumnos'} · {course.modality}
                            </p>
                          </div>
                          {selectedCourseId === course.id && (
                            <Check className="w-4 h-4 text-[#143F3B] dark:text-[#6B9B7A]" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
            <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-3">
              Template de Email
            </label>

            <div className="relative">
              <button
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-left hover:border-stone-300 dark:hover:border-stone-600 transition-colors"
              >
                {selectedTemplate ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#143F3B]/10 dark:bg-[#143F3B]/20 flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {selectedTemplate.name}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                        {selectedTemplate.subject}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-stone-400">Selecciona un template...</span>
                )}
                <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
              </button>

              {showTemplateDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowTemplateDropdown(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setSelectedTemplateId(template.id)
                          setShowTemplateDropdown(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${
                          selectedTemplateId === template.id ? 'bg-[#143F3B]/5 dark:bg-[#143F3B]/10' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                            {template.name}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                            {template.subject}
                          </p>
                        </div>
                        {selectedTemplateId === template.id && (
                          <Check className="w-4 h-4 text-[#143F3B] dark:text-[#6B9B7A]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Schedule Options */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
            <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-3">
              Programación
            </label>

            <div className="space-y-3">
              {/* Send Now */}
              <button
                onClick={() => setScheduleType('now')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                  scheduleType === 'now'
                    ? 'border-[#143F3B] bg-[#143F3B]/5 dark:bg-[#143F3B]/10'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
              >
                <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${
                  scheduleType === 'now'
                    ? 'border-[#143F3B] bg-[#143F3B]'
                    : 'border-stone-300 dark:border-stone-600'
                }`}>
                  {scheduleType === 'now' && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-stone-500" />
                  <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    Enviar ahora
                  </span>
                </div>
              </button>

              {/* Schedule */}
              <button
                onClick={() => setScheduleType('scheduled')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                  scheduleType === 'scheduled'
                    ? 'border-[#143F3B] bg-[#143F3B]/5 dark:bg-[#143F3B]/10'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
              >
                <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${
                  scheduleType === 'scheduled'
                    ? 'border-[#143F3B] bg-[#143F3B]'
                    : 'border-stone-300 dark:border-stone-600'
                }`}>
                  {scheduleType === 'scheduled' && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-500" />
                  <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    Programar envío
                  </span>
                </div>
              </button>

              {/* Date/Time Picker */}
              {scheduleType === 'scheduled' && (
                <div className="flex gap-3 pt-2">
                  <div className="flex-1">
                    <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      min={today}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">
                      Hora
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-lg text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={!isValid}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isValid
                  ? 'bg-[#143F3B] hover:bg-[#1a524d] text-white'
                  : 'bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed'
              }`}
            >
              {scheduleType === 'now' ? (
                <>
                  <Send className="w-4 h-4" />
                  Enviar ahora
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Programar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 h-fit lg:sticky lg:top-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-stone-400" />
            <h2 className="text-sm font-medium text-stone-900 dark:text-stone-100">
              Vista previa
            </h2>
          </div>

          {selectedTemplate ? (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Asunto:</p>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  {selectedTemplate.subject
                    .replace(/\{\{curso\}\}/g, selectedCourse?.title || '[Curso]')}
                </p>
              </div>

              {/* Body */}
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Mensaje:</p>
                <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                    {getPreviewBody(selectedTemplate.body)}
                  </p>
                </div>
              </div>

              {/* Variables Note */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <span className="text-amber-500 text-sm">ℹ️</span>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Las variables <code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1 rounded">{'{{nombre}}'}</code> y <code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1 rounded">{'{{curso}}'}</code> se reemplazarán automáticamente para cada alumno.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 mb-3">
                <Mail className="w-6 h-6 text-stone-400" />
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Selecciona un template para ver la vista previa
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
