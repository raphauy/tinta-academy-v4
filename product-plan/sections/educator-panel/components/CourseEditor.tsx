import { useState } from 'react'
import {
  Save,
  Send,
  FileText,
  Layers,
  DollarSign,
  Settings,
  Plus,
  ImageIcon,
  Clock,
  MapPin,
  Calendar,
  Users
} from 'lucide-react'
import type { CourseEditorProps, Course } from '@/../product/sections/educator-panel/types'
import { ModuleCard } from './ModuleCard'

type Tab = 'info' | 'content' | 'pricing' | 'settings'

export function CourseEditor({
  course,
  modules,
  lessons,
  onSave,
  onPublish,
  onCreateModule,
  onEditModule,
  onDeleteModule,
  onCreateLesson,
  onEditLesson,
  onDeleteLesson
}: CourseEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const isNew = !course

  // Form state (in real app, this would be more sophisticated)
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    type: course?.type || 'curso',
    modality: course?.modality || 'online',
    duration: course?.duration || '',
    image: course?.image || '',
    priceUSD: course?.priceUSD ?? '',
    priceUYU: course?.priceUYU ?? '',
    location: course?.location || '',
    eventDate: course?.eventDate || '',
    eventTime: course?.eventTime || '',
    maxCapacity: course?.maxCapacity ?? ''
  })

  const tabs: { id: Tab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { id: 'info', label: 'Info Básica', icon: <FileText className="w-4 h-4" />, show: true },
    { id: 'pricing', label: 'Precios', icon: <DollarSign className="w-4 h-4" />, show: true },
    { id: 'settings', label: 'Configuración', icon: <Settings className="w-4 h-4" />, show: true },
    { id: 'content', label: 'Contenido', icon: <Layers className="w-4 h-4" />, show: formData.modality === 'online' }
  ]

  const visibleTabs = tabs.filter(t => t.show)

  // Sort modules by order
  const sortedModules = [...modules].sort((a, b) => a.order - b.order)

  // Get lessons for a module
  const getLessonsForModule = (moduleId: string) => {
    return lessons.filter(l => l.moduleId === moduleId).sort((a, b) => a.order - b.order)
  }

  return (
    <div className="p-6 pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-0.5">
            {isNew ? 'Crear Curso' : 'Editar Curso'}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {isNew ? 'Completa la información de tu nuevo curso' : course?.title}
          </p>
        </div>
        {course?.status === 'draft' && (
          <button
            onClick={onPublish}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Publicar</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 mb-6">
        <div className="flex overflow-x-auto border-b border-stone-200 dark:border-stone-800">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-[#143F3B] text-[#143F3B] dark:text-[#6B9B7A] dark:border-[#6B9B7A]'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                  Título del curso
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: WSET Nivel 2 en Vinos"
                  className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el contenido y objetivos del curso..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B] resize-none"
                />
              </div>

              {/* Type & Modality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                    Tipo de curso
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Course['type'] })}
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                  >
                    <option value="curso">Curso</option>
                    <option value="wset">WSET</option>
                    <option value="taller">Taller</option>
                    <option value="cata">Cata</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                    Modalidad
                  </label>
                  <select
                    value={formData.modality}
                    onChange={(e) => setFormData({ ...formData, modality: e.target.value as Course['modality'] })}
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                  >
                    <option value="online">Online</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </div>
              </div>

              {/* Duration & Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duración
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Ej: 8 semanas o 3 horas"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                    <ImageIcon className="w-4 h-4 inline mr-1" />
                    Imagen de portada
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/courses/mi-curso.jpg"
                      className="flex-1 px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                    />
                    <button className="px-3 py-2.5 bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors">
                      Subir
                    </button>
                  </div>
                </div>
              </div>

              {/* Presencial-specific fields */}
              {formData.modality === 'presencial' && (
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                  <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4">
                    Información del evento
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ej: Bodega Bouza, Montevideo"
                        className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Capacidad máxima
                      </label>
                      <input
                        type="number"
                        value={formData.maxCapacity}
                        onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                        placeholder="20"
                        className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Fecha del evento
                      </label>
                      <input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Horario
                      </label>
                      <input
                        type="text"
                        value={formData.eventTime}
                        onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                        placeholder="18:00 - 21:00"
                        className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => onSave?.(formData as Partial<Course>)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar cambios
                </button>
              </div>
            </div>
          )}

          {/* Content Tab (Online courses only) */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    Módulos y Lecciones
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Organiza el contenido de tu curso en módulos
                  </p>
                </div>
                <button
                  onClick={onCreateModule}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Módulo
                </button>
              </div>

              {sortedModules.length > 0 ? (
                <div className="space-y-3">
                  {sortedModules.map((module, index) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      lessons={getLessonsForModule(module.id)}
                      index={index}
                      onEdit={() => onEditModule?.(module.id)}
                      onDelete={() => onDeleteModule?.(module.id)}
                      onCreateLesson={() => onCreateLesson?.(module.id)}
                      onEditLesson={onEditLesson}
                      onDeleteLesson={onDeleteLesson}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-stone-50 dark:bg-stone-800/50 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#143F3B]/10 dark:bg-[#143F3B]/20 mb-3">
                    <Layers className="w-6 h-6 text-[#143F3B] dark:text-[#6B9B7A]" />
                  </div>
                  <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 mb-1">
                    Sin módulos
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 max-w-sm mx-auto">
                    Comienza agregando el primer módulo para organizar las lecciones de tu curso.
                  </p>
                  <button
                    onClick={onCreateModule}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Módulo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4">
                  Configuración de precios
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                      Precio en USD
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                      <input
                        type="number"
                        value={formData.priceUSD}
                        onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                      />
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Dejar en 0 para curso gratuito
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                      Precio en UYU
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                      <input
                        type="number"
                        value={formData.priceUYU}
                        onChange={(e) => setFormData({ ...formData, priceUYU: e.target.value })}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B]"
                      />
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Precio en pesos uruguayos
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => onSave?.(formData as Partial<Course>)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar cambios
                </button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4">
                  Estado del curso
                </h3>
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    course?.status === 'published'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : course?.status === 'finished'
                        ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    {course?.status === 'published' ? 'Publicado' : course?.status === 'finished' ? 'Finalizado' : 'Borrador'}
                  </div>
                  {course?.publishedAt && (
                    <span className="text-sm text-stone-500 dark:text-stone-400">
                      Publicado el {new Date(course.publishedAt).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              </div>

              {course && (
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                  <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4">
                    Estadísticas
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {course.modality === 'online' ? (
                      <>
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                            {course.totalStudents || 0}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">Alumnos totales</p>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                            {course.activeStudents || 0}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">Alumnos activos</p>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                            {course.averageProgress || 0}%
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">Progreso promedio</p>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                            {course.totalLessons || 0}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">Lecciones</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                            {course.enrolledCount || 0}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">Inscritos</p>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                            {course.maxCapacity || 0}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">Capacidad</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {course?.status === 'published' && (
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                  <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                    Zona de peligro
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
                    Finalizar el curso impedirá nuevas inscripciones. Los alumnos existentes mantendrán acceso.
                  </p>
                  <button className="px-4 py-2 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    Finalizar curso
                  </button>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => onSave?.(formData as Partial<Course>)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar cambios
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
