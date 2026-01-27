'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Wand2, Check, AlertCircle, Video, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ImageUpload } from '@/components/shared/image-upload'
import { TagSelector } from '@/components/educator/tag-selector'
import { DatePicker } from '@/components/ui/date-picker'
import { generateSlug } from '@/lib/utils'
import {
  createCourseAction,
  updateCourseAction,
  checkSlugAction,
  type TagData,
} from '@/app/educator/actions'
import type { Course, Tag } from '@prisma/client'

const courseTypes = ['wset', 'taller', 'cata', 'curso'] as const

const webinarFormSchema = z.object({
  title: z.string().min(3, 'El titulo debe tener al menos 3 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(
      /^[a-z0-9-]+$/,
      'El slug solo puede contener letras minusculas, numeros y guiones'
    ),
  type: z.enum(courseTypes, {
    error: (iss) =>
      iss.input === undefined
        ? 'Selecciona el tipo de curso'
        : 'Tipo de curso invalido',
  }),
  wsetLevel: z.coerce.number().int().min(1).max(4).optional(),
  description: z.string().optional(),
  // Streaming fields
  streamingUrl: z
    .string()
    .url('Ingresa una URL valida (ej: https://zoom.us/j/...)')
    .or(z.literal('')),
  streamingPassword: z.string().optional(),
  // Capacity and pricing
  maxCapacity: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  priceUSD: z.coerce.number().nonnegative('El precio no puede ser negativo'),
  priceUYU: z.coerce
    .number()
    .nonnegative('El precio no puede ser negativo')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  imageUrl: z.string().optional(),
})

type WebinarFormInput = z.input<typeof webinarFormSchema>
type WebinarFormOutput = z.output<typeof webinarFormSchema>

interface CourseWithTags extends Course {
  tags?: Tag[]
}

interface WebinarCourseFormProps {
  course?: CourseWithTags
  mode: 'create' | 'edit'
  initialTags?: TagData[]
}

export function WebinarCourseForm({
  course,
  mode,
  initialTags = [],
}: WebinarCourseFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    course?.imageUrl ?? undefined
  )
  const [slugStatus, setSlugStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    course?.tags?.map((t) => t.id) ?? []
  )

  // Webinar date/time state
  const [eventDate, setEventDate] = useState<Date | undefined>(
    course?.classDates?.[0] ? new Date(course.classDates[0]) : undefined
  )
  const [startTime, setStartTime] = useState(course?.startTime ?? '18:00')
  const [duration, setDuration] = useState(course?.classDuration ?? 60)
  const [registrationDeadline, setRegistrationDeadline] = useState<Date | undefined>(
    course?.registrationDeadline ? new Date(course.registrationDeadline) : undefined
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WebinarFormInput, unknown, WebinarFormOutput>({
    resolver: zodResolver(webinarFormSchema),
    defaultValues: {
      title: course?.title ?? '',
      slug: course?.slug ?? '',
      type: (course?.type as WebinarFormInput['type']) ?? 'taller',
      wsetLevel: course?.wsetLevel ?? undefined,
      description: course?.description ?? '',
      streamingUrl: course?.streamingUrl ?? '',
      streamingPassword: course?.streamingPassword ?? '',
      maxCapacity: course?.maxCapacity ?? undefined,
      priceUSD: course?.priceUSD ?? 0,
      priceUYU: course?.priceUYU ?? undefined,
      imageUrl: course?.imageUrl ?? '',
    },
  })

  const watchType = watch('type')
  const watchSlug = watch('slug')
  const watchTitle = watch('title')
  const watchStreamingUrl = watch('streamingUrl')

  // Check slug availability with debounce
  const checkSlugAvailability = useCallback(
    async (slug: string) => {
      if (!slug || slug.length < 3) {
        setSlugStatus('idle')
        return
      }

      setSlugStatus('checking')

      try {
        const result = await checkSlugAction(slug, course?.id)
        if (result.success && result.data) {
          setSlugStatus(result.data.exists ? 'taken' : 'available')
        } else {
          setSlugStatus('idle')
        }
      } catch {
        setSlugStatus('idle')
      }
    },
    [course?.id]
  )

  // Debounced slug check
  useEffect(() => {
    const timer = setTimeout(() => {
      checkSlugAvailability(watchSlug)
    }, 500)

    return () => clearTimeout(timer)
  }, [watchSlug, checkSlugAvailability])

  const handleGenerateSlug = () => {
    if (!watchTitle) {
      toast.error('Primero ingresa un titulo')
      return
    }

    const newSlug = generateSlug(watchTitle)
    setValue('slug', newSlug, { shouldValidate: true })
  }

  const handleImageChange = (url: string | null) => {
    setImageUrl(url ?? undefined)
    setValue('imageUrl', url ?? '', { shouldValidate: true })
  }

  const handleImageError = (error: string) => {
    toast.error(error)
  }

  const onSubmit = (data: WebinarFormOutput) => {
    if (slugStatus === 'taken') {
      toast.error('El slug ya esta en uso. Por favor elige otro.')
      return
    }

    if (!eventDate) {
      toast.error('Selecciona la fecha del webinar')
      return
    }

    startTransition(async () => {
      const formData = new FormData()

      formData.append('title', data.title)
      formData.append('slug', data.slug)
      formData.append('type', data.type)
      formData.append('modality', 'webinar')
      formData.append('priceUSD', data.priceUSD.toString())
      if (data.priceUYU !== undefined && data.priceUYU !== null) {
        formData.append('priceUYU', data.priceUYU.toString())
      }

      if (data.wsetLevel && data.type === 'wset') {
        formData.append('wsetLevel', data.wsetLevel.toString())
      }
      if (data.description) formData.append('description', data.description)
      if (data.maxCapacity) formData.append('maxCapacity', data.maxCapacity.toString())
      if (imageUrl) formData.append('imageUrl', imageUrl)

      // Streaming fields
      if (data.streamingUrl) formData.append('streamingUrl', data.streamingUrl)
      if (data.streamingPassword) formData.append('streamingPassword', data.streamingPassword)

      // Date fields - use single date for webinar
      formData.append('classDates', JSON.stringify([eventDate.toISOString()]))
      formData.append('startDate', eventDate.toISOString())
      formData.append('endDate', eventDate.toISOString())
      formData.append('startTime', startTime)
      formData.append('classDuration', duration.toString())

      if (registrationDeadline) {
        formData.append('registrationDeadline', registrationDeadline.toISOString())
      }

      // Tags
      if (selectedTagIds.length > 0) {
        formData.append('tagIds', JSON.stringify(selectedTagIds))
      }

      let result
      if (mode === 'create') {
        result = await createCourseAction(formData)
      } else {
        result = await updateCourseAction(course!.id, formData)
      }

      if (result.success) {
        toast.success(
          mode === 'create'
            ? 'Webinar creado exitosamente'
            : 'Webinar actualizado exitosamente'
        )
        router.push('/educator/courses')
      } else {
        toast.error(result.error)
      }
    })
  }

  const typeOptions = [
    { value: 'wset', label: 'WSET' },
    { value: 'taller', label: 'Taller' },
    { value: 'cata', label: 'Cata' },
    { value: 'curso', label: 'Curso' },
  ]

  const wsetLevelOptions = [
    { value: '1', label: 'Nivel 1' },
    { value: '2', label: 'Nivel 2' },
    { value: '3', label: 'Nivel 3' },
    { value: '4', label: 'Nivel 4 (Diploma)' },
  ]

  const durationOptions = [
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1.5 horas' },
    { value: 120, label: '2 horas' },
    { value: 180, label: '3 horas' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Informacion del Webinar
          </CardTitle>
          <CardDescription>
            Un webinar es un evento en vivo transmitido por Zoom, Meet u otra plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo *</Label>
            <Input
              id="title"
              placeholder="Ej: Introduccion a los vinos de Borgona"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL) *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="slug"
                  placeholder="ej: intro-vinos-borgona"
                  {...register('slug')}
                  className="pr-10"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  {slugStatus === 'checking' && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                  {slugStatus === 'available' && (
                    <Check className="size-4 text-green-500" />
                  )}
                  {slugStatus === 'taken' && (
                    <AlertCircle className="size-4 text-destructive" />
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateSlug}
                disabled={!watchTitle}
              >
                <Wand2 className="mr-2 size-4" />
                Generar
              </Button>
            </div>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
            {slugStatus === 'taken' && (
              <p className="text-sm text-destructive">
                Este slug ya esta en uso. Por favor elige otro.
              </p>
            )}
            {slugStatus === 'available' && (
              <p className="text-sm text-green-600">Slug disponible</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={watchType}
                onValueChange={(value) =>
                  setValue('type', value as WebinarFormInput['type'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            {watchType === 'wset' && (
              <div className="space-y-2">
                <Label htmlFor="wsetLevel">Nivel WSET *</Label>
                <Select
                  value={watch('wsetLevel')?.toString() ?? ''}
                  onValueChange={(value) =>
                    setValue('wsetLevel', parseInt(value), {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {wsetLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              placeholder="Describe el contenido del webinar..."
              rows={5}
              {...register('description')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <TagSelector
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
            initialTags={initialTags}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Los tags ayudan a los estudiantes a encontrar tu webinar.
          </p>
        </CardContent>
      </Card>

      {/* Course Image */}
      <Card>
        <CardHeader>
          <CardTitle>Imagen del Webinar</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={imageUrl}
            onChange={handleImageChange}
            onError={handleImageError}
            aspectRatio="auto"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Recomendado: imagen de 1200x630px (proporcion 16:9)
          </p>
        </CardContent>
      </Card>

      {/* Event Date and Time */}
      <Card>
        <CardHeader>
          <CardTitle>Fecha y Hora del Evento</CardTitle>
          <CardDescription>
            Selecciona cuando sera el webinar en vivo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Fecha del Webinar *</Label>
              <DatePicker
                value={eventDate}
                onChange={setEventDate}
                placeholder="Seleccionar fecha"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de Inicio *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Duracion *</Label>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fecha Limite de Inscripcion</Label>
            <DatePicker
              value={registrationDeadline}
              onChange={setRegistrationDeadline}
              placeholder="Opcional"
            />
            <p className="text-xs text-muted-foreground">
              Si no se especifica, los estudiantes podran inscribirse hasta el dia del evento.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Streaming Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Acceso al Streaming
          </CardTitle>
          <CardDescription>
            Ingresa el link de Zoom, Google Meet u otra plataforma de streaming.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="streamingUrl">Link de Acceso *</Label>
            <Input
              id="streamingUrl"
              type="url"
              placeholder="https://zoom.us/j/123456789 o https://meet.google.com/xxx-xxxx-xxx"
              {...register('streamingUrl')}
            />
            {errors.streamingUrl && (
              <p className="text-sm text-destructive">{errors.streamingUrl.message}</p>
            )}
            {watchStreamingUrl && !errors.streamingUrl && (
              <p className="text-xs text-muted-foreground">
                Este link se enviara a los estudiantes en el email de confirmacion.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="streamingPassword">Contrasena de Acceso</Label>
            <Input
              id="streamingPassword"
              placeholder="Opcional - contrasena de la reunion"
              {...register('streamingPassword')}
            />
            <p className="text-xs text-muted-foreground">
              Si tu reunion tiene contrasena, ingresala aqui para incluirla en el email.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Capacity and Price */}
      <Card>
        <CardHeader>
          <CardTitle>Capacidad y Precio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Cupos Disponibles</Label>
              <Input
                id="maxCapacity"
                type="number"
                min="1"
                placeholder="Ej: 100"
                {...register('maxCapacity')}
              />
              <p className="text-xs text-muted-foreground">
                Deja vacio para cupos ilimitados.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceUSD">Precio (USD) *</Label>
              <Input
                id="priceUSD"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 25"
                {...register('priceUSD')}
              />
              {errors.priceUSD && (
                <p className="text-sm text-destructive">
                  {errors.priceUSD.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceUYU">Precio (UYU)</Label>
              <Input
                id="priceUYU"
                type="number"
                min="0"
                step="1"
                placeholder="Ej: 1050"
                {...register('priceUYU')}
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Se calcula auto (USD x 42).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/educator/courses')}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || slugStatus === 'taken'}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {mode === 'create' ? 'Crear Webinar' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  )
}
