'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Wand2, Check, AlertCircle } from 'lucide-react'

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/shared/image-upload'
import { CourseDatesSection } from '@/components/educator/course-dates-section'
import { TagSelector } from '@/components/educator/tag-selector'
import { generateSlug } from '@/lib/utils'
import {
  createCourseAction,
  updateCourseAction,
  checkSlugAction,
  type TagData,
} from '@/app/educator/actions'
import type { Course, Tag } from '@prisma/client'

const courseTypes = ['wset', 'taller', 'cata', 'curso'] as const

const courseFormSchema = z.object({
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
  duration: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  maxCapacity: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  priceUSD: z.coerce.number().nonnegative('El precio no puede ser negativo'),
  imageUrl: z.string().optional(),
})

interface CourseDatesData {
  classDates: Date[]
  startTime: string
  classDuration: number
  examDate?: Date
  registrationDeadline?: Date
}

type CourseFormInput = z.input<typeof courseFormSchema>
type CourseFormOutput = z.output<typeof courseFormSchema>

interface CourseWithTags extends Course {
  tags?: Tag[]
}

interface PresencialCourseFormProps {
  course?: CourseWithTags
  mode: 'create' | 'edit'
  initialTags?: TagData[]
}

export function PresencialCourseForm({
  course,
  mode,
  initialTags = [],
}: PresencialCourseFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    course?.imageUrl ?? undefined
  )
  const [slugStatus, setSlugStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle')
  const [courseDates, setCourseDates] = useState<CourseDatesData>({
    classDates: course?.classDates?.map((d) => new Date(d)) ?? [],
    startTime: course?.startTime ?? '17:00',
    classDuration: course?.classDuration ?? 180,
    examDate: course?.examDate ? new Date(course.examDate) : undefined,
    registrationDeadline: course?.registrationDeadline
      ? new Date(course.registrationDeadline)
      : undefined,
  })
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    course?.tags?.map((t) => t.id) ?? []
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseFormInput, unknown, CourseFormOutput>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title ?? '',
      slug: course?.slug ?? '',
      type: (course?.type as CourseFormInput['type']) ?? undefined,
      wsetLevel: course?.wsetLevel ?? undefined,
      description: course?.description ?? '',
      duration: course?.duration ?? '',
      location: course?.location ?? '',
      address: course?.address ?? '',
      maxCapacity: course?.maxCapacity ?? undefined,
      priceUSD: course?.priceUSD ?? 0,
      imageUrl: course?.imageUrl ?? '',
    },
  })

  const watchType = watch('type')
  const watchSlug = watch('slug')
  const watchTitle = watch('title')

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

  const onSubmit = (data: CourseFormOutput) => {
    if (slugStatus === 'taken') {
      toast.error('El slug ya esta en uso. Por favor elige otro.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()

      formData.append('title', data.title)
      formData.append('slug', data.slug)
      formData.append('type', data.type)
      formData.append('priceUSD', data.priceUSD.toString())

      if (data.wsetLevel && data.type === 'wset') {
        formData.append('wsetLevel', data.wsetLevel.toString())
      }
      if (data.description) formData.append('description', data.description)
      if (data.duration) formData.append('duration', data.duration)
      if (data.location) formData.append('location', data.location)
      if (data.address) formData.append('address', data.address)
      if (data.maxCapacity)
        formData.append('maxCapacity', data.maxCapacity.toString())
      if (imageUrl) formData.append('imageUrl', imageUrl)

      // Class dates data
      if (courseDates.classDates.length > 0) {
        formData.append(
          'classDates',
          JSON.stringify(courseDates.classDates.map((d) => d.toISOString()))
        )
        // Set startDate and endDate based on classDates
        const sortedDates = [...courseDates.classDates].sort(
          (a, b) => a.getTime() - b.getTime()
        )
        formData.append('startDate', sortedDates[0].toISOString())
        formData.append(
          'endDate',
          sortedDates[sortedDates.length - 1].toISOString()
        )
      }
      if (courseDates.startTime) {
        formData.append('startTime', courseDates.startTime)
      }
      if (courseDates.classDuration) {
        formData.append('classDuration', courseDates.classDuration.toString())
      }
      if (courseDates.examDate) {
        formData.append('examDate', courseDates.examDate.toISOString())
      }
      if (courseDates.registrationDeadline) {
        formData.append(
          'registrationDeadline',
          courseDates.registrationDeadline.toISOString()
        )
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
            ? 'Curso creado exitosamente'
            : 'Curso actualizado exitosamente'
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informacion Basica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo *</Label>
            <Input
              id="title"
              placeholder="Ej: WSET Nivel 1 - Marzo 2026"
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
                  placeholder="ej: wset-nivel-1-marzo-2026"
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
              <Label htmlFor="type">Tipo de Curso *</Label>
              <Select
                value={watchType}
                onValueChange={(value) =>
                  setValue('type', value as CourseFormInput['type'], {
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

          {(watchType === 'taller' || watchType === 'cata' || watchType === 'curso') && (
            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                placeholder="Descripcion del curso..."
                rows={8}
                {...register('description')}
              />
            </div>
          )}
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
            Los tags ayudan a los estudiantes a encontrar tu curso. Puedes
            seleccionar tags existentes o crear nuevos.
          </p>
        </CardContent>
      </Card>

      {/* Course Image */}
      <Card>
        <CardHeader>
          <CardTitle>Imagen del Curso</CardTitle>
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

      {/* Class Dates */}
      <CourseDatesSection
        classDates={courseDates.classDates}
        startTime={courseDates.startTime}
        classDuration={courseDates.classDuration}
        examDate={courseDates.examDate}
        registrationDeadline={courseDates.registrationDeadline}
        showExamDate={watchType === 'wset'}
        onChange={setCourseDates}
      />

      {/* Total Duration */}
      <Card>
        <CardHeader>
          <CardTitle>Duracion Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="duration">Duracion del Curso</Label>
            <Input
              id="duration"
              placeholder="Ej: 16 horas presenciales + 12 horas de estudio"
              {...register('duration')}
            />
            <p className="text-xs text-muted-foreground">
              Describe la duracion total del curso incluyendo horas presenciales
              y de estudio si aplica.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Ubicacion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Lugar</Label>
            <Input
              id="location"
              placeholder="Ej: Sinergia Faro"
              {...register('location')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Direccion</Label>
            <Input
              id="address"
              placeholder="Ej: Av. 18 de Julio 1234, Montevideo"
              {...register('address')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Capacity and Price */}
      <Card>
        <CardHeader>
          <CardTitle>Capacidad y Precio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Capacidad Maxima</Label>
              <Input
                id="maxCapacity"
                type="number"
                min="1"
                placeholder="Ej: 20"
                {...register('maxCapacity')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceUSD">Precio (USD) *</Label>
              <Input
                id="priceUSD"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 150"
                {...register('priceUSD')}
              />
              {errors.priceUSD && (
                <p className="text-sm text-destructive">
                  {errors.priceUSD.message}
                </p>
              )}
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
          {mode === 'create' ? 'Crear Curso' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  )
}
