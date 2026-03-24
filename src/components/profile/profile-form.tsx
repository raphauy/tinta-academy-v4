'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/shared/image-upload'
import {
  updateProfileAction,
  updateEducatorNotificationsAction,
} from '@/app/profile/actions'
import {
  updateProfileSchema,
  type UpdateProfileData,
} from '@/lib/validations/profile'

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  educatorNotifications?: { notifyOnComments: boolean } | null
}

export function ProfileForm({ user, educatorNotifications }: ProfileFormProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [imageUrl, setImageUrl] = useState<string | null>(user.image)
  const [notifyOnComments, setNotifyOnComments] = useState(
    educatorNotifications?.notifyOnComments ?? true
  )
  const [savingNotifications, setSavingNotifications] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      image: user.image,
    },
  })

  const onSubmit = async (data: UpdateProfileData) => {
    const formData = new FormData()
    formData.append('name', data.name)
    if (imageUrl !== undefined) {
      formData.append('image', imageUrl ?? '')
    }

    const result = await updateProfileAction(formData)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    await updateSession({
      name: result.data.name,
      image: result.data.image,
    })

    toast.success('Perfil actualizado correctamente')

    router.refresh()
    setTimeout(() => {
      router.back()
    }, 500)
  }

  const handleImageChange = (url: string | null) => {
    setImageUrl(url)
  }

  const handleImageError = (error: string) => {
    toast.error(error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="h-36 w-36">
          <ImageUpload
            value={imageUrl ?? undefined}
            onChange={handleImageChange}
            onError={handleImageError}
            aspectRatio="square"
            className="rounded-full"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Haz clic o arrastra una imagen para cambiar tu avatar
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          placeholder="Tu nombre"
          {...register('name')}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          El email no puede ser modificado
        </p>
      </div>

      {/* Educator notification preferences */}
      {educatorNotifications && (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Notificaciones</h3>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="notifyOnComments" className="text-sm">
                Comentarios en mis cursos
              </Label>
              <p className="text-xs text-muted-foreground">
                Recibir un email cuando un estudiante comente en una lección
              </p>
            </div>
            <Switch
              id="notifyOnComments"
              checked={notifyOnComments}
              disabled={savingNotifications}
              onCheckedChange={async (checked) => {
                setNotifyOnComments(checked)
                setSavingNotifications(true)
                const result = await updateEducatorNotificationsAction(checked)
                setSavingNotifications(false)
                if (result.success) {
                  toast.success('Preferencia actualizada')
                } else {
                  setNotifyOnComments(!checked)
                  toast.error(result.error)
                }
              }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Volver
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
