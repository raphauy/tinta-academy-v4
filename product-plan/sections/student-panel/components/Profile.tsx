import { useState } from 'react'
import { User, Mail, Phone, MapPin, Building2, Receipt, Bell, Camera, Save, Calendar } from 'lucide-react'
import type { ProfileProps, Student, NotificationPreferences } from '@/../product/sections/student-panel/types'

interface InputFieldProps {
  label: string
  value: string
  onChange?: (value: string) => void
  disabled?: boolean
  type?: 'text' | 'email' | 'tel'
  icon?: React.ReactNode
  hint?: string
}

function InputField({ label, value, onChange, disabled, type = 'text', icon, hint }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm transition-colors ${
            icon ? 'pl-10' : ''
          } ${
            disabled
              ? 'bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 cursor-not-allowed'
              : 'hover:border-stone-300 dark:hover:border-stone-600 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B] dark:focus:border-[#6B9B7A]'
          }`}
        />
      </div>
      {hint && (
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{hint}</p>
      )}
    </div>
  )
}

interface ToggleProps {
  label: string
  description: string
  checked: boolean
  onChange?: (checked: boolean) => void
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="pt-0.5">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange?.(!checked)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            checked
              ? 'bg-[#143F3B] dark:bg-[#4A7C59]'
              : 'bg-stone-200 dark:bg-stone-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              checked ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-[#143F3B] dark:group-hover:text-[#6B9B7A] transition-colors">
          {label}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400">{description}</p>
      </div>
    </label>
  )
}

interface SectionCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-3">
        <div className="text-stone-400 dark:text-stone-500">
          {icon}
        </div>
        <h2 className="font-semibold text-stone-900 dark:text-stone-100">{title}</h2>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

export function Profile({
  student,
  onSaveProfile,
  onUpdateNotifications
}: ProfileProps) {
  // Local state for form editing
  const [formData, setFormData] = useState<Student>(student)
  const [notifications, setNotifications] = useState<NotificationPreferences>(student.notificationPreferences)
  const [hasChanges, setHasChanges] = useState(false)

  const updateField = (field: keyof Student, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const updateNotification = (field: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...notifications, [field]: value }
    setNotifications(updated)
    onUpdateNotifications?.(updated)
  }

  const handleSave = () => {
    onSaveProfile?.(formData)
    setHasChanges(false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[#143F3B]/10 dark:bg-[#143F3B]/20">
            <User className="w-6 h-6 text-[#143F3B] dark:text-[#6B9B7A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Mi Perfil
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Gestiona tu información personal y preferencias
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Avatar & Basic Info */}
        <SectionCard title="Información Personal" icon={<User className="w-5 h-5" />}>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#143F3B] to-[#2A5A54] flex items-center justify-center text-white text-2xl font-semibold overflow-hidden">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt={`${formData.firstName} ${formData.lastName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : null}
                  <span className="absolute">
                    {formData.firstName[0]}{formData.lastName[0]}
                  </span>
                </div>
                <button
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  title="Cambiar foto"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">JPG o PNG, máx. 2MB</p>
            </div>

            {/* Name & Contact */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Nombre"
                value={formData.firstName}
                onChange={(v) => updateField('firstName', v)}
              />
              <InputField
                label="Apellido"
                value={formData.lastName}
                onChange={(v) => updateField('lastName', v)}
              />
              <InputField
                label="Email"
                value={formData.email}
                type="email"
                disabled
                icon={<Mail className="w-4 h-4" />}
                hint="El email no se puede modificar"
              />
              <InputField
                label="Teléfono"
                value={formData.phone}
                type="tel"
                onChange={(v) => updateField('phone', v)}
                icon={<Phone className="w-4 h-4" />}
              />
              <InputField
                label="Fecha de nacimiento"
                value={formData.birthDate}
                type="text"
                onChange={(v) => updateField('birthDate', v)}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </div>
        </SectionCard>

        {/* Address */}
        <SectionCard title="Dirección" icon={<MapPin className="w-5 h-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <InputField
                label="Dirección"
                value={formData.address}
                onChange={(v) => updateField('address', v)}
                icon={<MapPin className="w-4 h-4" />}
              />
            </div>
            <InputField
              label="Ciudad"
              value={formData.city}
              onChange={(v) => updateField('city', v)}
            />
            <InputField
              label="Código Postal"
              value={formData.postalCode}
              onChange={(v) => updateField('postalCode', v)}
            />
            <InputField
              label="País"
              value={formData.country}
              onChange={(v) => updateField('country', v)}
            />
          </div>
        </SectionCard>

        {/* Billing Info */}
        <SectionCard title="Datos de Facturación" icon={<Receipt className="w-5 h-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Nombre o Razón Social"
              value={formData.billingName}
              onChange={(v) => updateField('billingName', v)}
              icon={<Building2 className="w-4 h-4" />}
            />
            <InputField
              label="RUT / CI"
              value={formData.billingTaxId}
              onChange={(v) => updateField('billingTaxId', v)}
            />
            <div className="sm:col-span-2">
              <InputField
                label="Dirección de Facturación"
                value={formData.billingAddress}
                onChange={(v) => updateField('billingAddress', v)}
                icon={<MapPin className="w-4 h-4" />}
              />
            </div>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Preferencias de Notificación" icon={<Bell className="w-5 h-5" />}>
          <div className="space-y-4">
            <Toggle
              label="Nuevos cursos"
              description="Recibir avisos cuando se publiquen nuevos cursos"
              checked={notifications.emailNewCourses}
              onChange={(v) => updateNotification('emailNewCourses', v)}
            />
            <Toggle
              label="Promociones"
              description="Recibir ofertas y descuentos especiales"
              checked={notifications.emailPromotions}
              onChange={(v) => updateNotification('emailPromotions', v)}
            />
            <Toggle
              label="Actualizaciones de cursos"
              description="Avisos sobre cambios en cursos en los que estás inscrito"
              checked={notifications.emailCourseUpdates}
              onChange={(v) => updateNotification('emailCourseUpdates', v)}
            />
          </div>
        </SectionCard>

        {/* Save Button */}
        {hasChanges && (
          <div className="sticky bottom-6 flex justify-end">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#143F3B] hover:bg-[#0D2926] text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Save className="w-4 h-4" />
              Guardar cambios
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
