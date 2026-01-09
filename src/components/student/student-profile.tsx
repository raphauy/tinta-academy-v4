'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  User,
  MapPin,
  Receipt,
  Bell,
  Loader2,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/shared/image-upload'
import {
  updateStudentProfileAction,
  updateNotificationPreferencesAction,
  updateStudentAvatarAction,
} from '@/app/student/actions'

// Zod schema for form validation
const profileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  identityDocument: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  billingName: z.string().optional(),
  billingTaxId: z.string().optional(),
  billingAddress: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface StudentProfileProps {
  profile: {
    id: string
    firstName: string | null
    lastName: string | null
    identityDocument: string | null
    phone: string | null
    dateOfBirth: Date | null
    address: string | null
    city: string | null
    zip: string | null
    country: string | null
    billingName: string | null
    billingTaxId: string | null
    billingAddress: string | null
    notifyNewCourses: boolean
    notifyPromotions: boolean
    notifyCourseUpdates: boolean
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
    }
  }
  readOnly?: boolean
}

// Section wrapper component
function ProfileSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#143F3B]/10 dark:bg-[#143F3B]/20">
          <Icon className="w-4 h-4 text-[#143F3B] dark:text-[#6B9B7A]" />
        </div>
        <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

export function StudentProfile({ profile, readOnly = false }: StudentProfileProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [isPending, startTransition] = useTransition()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.user.image)

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    notifyNewCourses: profile.notifyNewCourses,
    notifyPromotions: profile.notifyPromotions,
    notifyCourseUpdates: profile.notifyCourseUpdates,
  })
  const [notificationsDirty, setNotificationsDirty] = useState(false)

  // State for "use personal data for billing" switch
  const [usePersonalForBilling, setUsePersonalForBilling] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      identityDocument: profile.identityDocument || '',
      phone: profile.phone || '',
      dateOfBirth: profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
        : '',
      address: profile.address || '',
      city: profile.city || '',
      zip: profile.zip || '',
      country: profile.country || '',
      billingName: profile.billingName || '',
      billingTaxId: profile.billingTaxId || '',
      billingAddress: profile.billingAddress || '',
    },
  })

  // Watch personal data fields for copying to billing
  const watchFirstName = watch('firstName')
  const watchLastName = watch('lastName')
  const watchIdentityDocument = watch('identityDocument')
  const watchAddress = watch('address')
  const watchCity = watch('city')
  const watchZip = watch('zip')
  const watchCountry = watch('country')

  // Handle "use personal data for billing" toggle
  const handleUsePersonalForBilling = (checked: boolean) => {
    setUsePersonalForBilling(checked)
    if (checked) {
      // Copy personal data to billing fields
      const fullName = `${watchFirstName} ${watchLastName}`.trim()
      const fullAddress = [watchAddress, watchCity, watchZip, watchCountry]
        .filter(Boolean)
        .join(', ')
      setValue('billingName', fullName, { shouldDirty: true })
      setValue('billingTaxId', watchIdentityDocument || '', { shouldDirty: true })
      setValue('billingAddress', fullAddress, { shouldDirty: true })
    }
  }

  const hasChanges = isDirty || notificationsDirty

  const onSubmit = async (data: ProfileFormData) => {
    startTransition(async () => {
      // Update profile data
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      const profileResult = await updateStudentProfileAction(formData)

      if (!profileResult.success) {
        toast.error(profileResult.error)
        return
      }

      // Update notification preferences if changed
      if (notificationsDirty) {
        const notifResult = await updateNotificationPreferencesAction(notifications)
        if (!notifResult.success) {
          toast.error(notifResult.error)
          return
        }
        setNotificationsDirty(false)
      }

      // Update session with new name if changed
      const newName = `${data.firstName} ${data.lastName}`.trim()
      if (newName !== profile.user.name) {
        await updateSession({ name: newName })
      }

      toast.success('Perfil actualizado correctamente')
      router.refresh()
    })
  }

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
    setNotificationsDirty(true)
  }

  const handleAvatarChange = async (url: string | null) => {
    setAvatarUrl(url)

    // Save avatar to database immediately
    const result = await updateStudentAvatarAction(url)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    // Update session so the avatar shows in the header
    await updateSession({ image: url })

    // Refresh to update server components (header avatar)
    router.refresh()

    toast.success(url ? 'Foto de perfil actualizada' : 'Foto de perfil eliminada')
  }

  const handleAvatarError = (error: string) => {
    toast.error(error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
          Mi Perfil
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Administra tu información personal y preferencias
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-800">
        <div className="h-20 w-20 shrink-0">
          <ImageUpload
            value={avatarUrl ?? undefined}
            onChange={handleAvatarChange}
            onError={handleAvatarError}
            aspectRatio="square"
            className="rounded-full"
            disabled={readOnly}
          />
        </div>
        <div className="text-center sm:text-left">
          <p className="font-medium text-stone-900 dark:text-stone-100">
            {profile.firstName || ''} {profile.lastName || ''}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {profile.user.email}
          </p>
          {!readOnly && (
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
              Haz clic en la imagen para cambiar tu foto
            </p>
          )}
        </div>
      </div>

      {/* Personal Info Section */}
      <ProfileSection icon={User} title="Informacion Personal">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              placeholder="Tu nombre"
              {...register('firstName')}
              disabled={isPending || readOnly}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido *</Label>
            <Input
              id="lastName"
              placeholder="Tu apellido"
              {...register('lastName')}
              disabled={isPending || readOnly}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="identityDocument">Cedula de Identidad (CI)</Label>
            <Input
              id="identityDocument"
              placeholder="1.234.567-8"
              {...register('identityDocument')}
              disabled={isPending || readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              El email no puede ser modificado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+598 99 123 456"
              {...register('phone')}
              disabled={isPending || readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...register('dateOfBirth')}
              disabled={isPending || readOnly}
            />
          </div>
        </div>
      </ProfileSection>

      {/* Address Section */}
      <ProfileSection icon={MapPin} title="Direccion">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Direccion</Label>
            <Input
              id="address"
              placeholder="Calle y numero"
              {...register('address')}
              disabled={isPending || readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              placeholder="Montevideo"
              {...register('city')}
              disabled={isPending || readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">Codigo Postal</Label>
            <Input
              id="zip"
              placeholder="11000"
              {...register('zip')}
              disabled={isPending || readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Pais</Label>
            <Input
              id="country"
              placeholder="Uruguay"
              {...register('country')}
              disabled={isPending || readOnly}
            />
          </div>
        </div>
      </ProfileSection>

      {/* Billing Section */}
      <ProfileSection icon={Receipt} title="Datos de Facturacion">
        <div className="space-y-4">
          {/* Use personal data switch */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-700">
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                Usar mis datos personales
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Copiar nombre, CI y direccion a los datos de facturacion
              </p>
            </div>
            <Switch
              checked={usePersonalForBilling}
              onCheckedChange={handleUsePersonalForBilling}
              disabled={isPending || readOnly}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingName">Nombre o Razon Social</Label>
              <Input
                id="billingName"
                placeholder="Nombre para factura"
                {...register('billingName')}
                disabled={isPending || readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingTaxId">RUT / CI</Label>
              <Input
                id="billingTaxId"
                placeholder="12.345.678-9"
                {...register('billingTaxId')}
                disabled={isPending || readOnly}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingAddress">Direccion de Facturacion</Label>
            <Textarea
              id="billingAddress"
              placeholder="Direccion completa para facturacion"
              {...register('billingAddress')}
              disabled={isPending || readOnly}
              rows={2}
            />
          </div>
        </div>
      </ProfileSection>

      {/* Notifications Section */}
      <ProfileSection icon={Bell} title="Preferencias de Notificaciones">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                Nuevos cursos
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Recibe avisos cuando se anuncien nuevos cursos
              </p>
            </div>
            <Switch
              checked={notifications.notifyNewCourses}
              onCheckedChange={(checked) =>
                handleNotificationChange('notifyNewCourses', checked)
              }
              disabled={isPending || readOnly}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                Actualizaciones de cursos
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Recibe avisos sobre cambios en tus cursos inscritos
              </p>
            </div>
            <Switch
              checked={notifications.notifyCourseUpdates}
              onCheckedChange={(checked) =>
                handleNotificationChange('notifyCourseUpdates', checked)
              }
              disabled={isPending || readOnly}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                Promociones
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Recibe ofertas especiales y descuentos
              </p>
            </div>
            <Switch
              checked={notifications.notifyPromotions}
              onCheckedChange={(checked) =>
                handleNotificationChange('notifyPromotions', checked)
              }
              disabled={isPending || readOnly}
            />
          </div>
        </div>
      </ProfileSection>

      {/* Save Button - only show if not read-only and has changes */}
      {!readOnly && (
        <div
          className={`
            sticky bottom-4 flex justify-end transition-opacity duration-200
            ${hasChanges ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          <Button
            type="submit"
            disabled={isPending || !hasChanges}
            className="shadow-lg"
            size="lg"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar cambios
          </Button>
        </div>
      )}

      {/* Read-only notice */}
      {readOnly && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Estas viendo el perfil de otro estudiante (modo lectura)
        </div>
      )}
    </form>
  )
}
