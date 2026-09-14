'use client'

import { useState, useTransition, useEffect, useCallback, useRef } from 'react'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ImageUpload } from '@/components/shared/image-upload'
import {
  CourseDatesSection,
  type CourseDatesData,
} from '@/components/educator/course-dates-section'
import { TagSelector } from '@/components/educator/tag-selector'
import { RecalculateDatesDialog } from '@/components/educator/courses/recalculate-dates-dialog'
import { generateSlug } from '@/lib/utils'
import { keepClassesOnDates } from '@/lib/course-modality'
import { CLASS_ICONS, MODALITY_ICONS } from '@/components/course/modality-icons'
import { validateSemipresencialSchedule } from '@/lib/validations/course'
import {
  createCourseAction,
  updateCourseAction,
  checkSlugAction,
  type TagData,
} from '@/app/educator/actions'
import { countAffectedExecutionsAction } from '@/app/educator/workflows/actions'
import type { Course, Tag, VirtualClass } from '@prisma/client'

const courseTypes = ['wset', 'taller', 'cata', 'curso', 'experiencia'] as const

const SemipresencialIcon = MODALITY_ICONS.semipresencial
const PresencialClassIcon = CLASS_ICONS.presencial

const semipresencialFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(
      /^[a-z0-9-]+$/,
      'El slug solo puede contener letras minúsculas, números y guiones'
    ),
  type: z.enum(courseTypes, {
    error: (iss) =>
      iss.input === undefined
        ? 'Seleccioná el tipo de curso'
        : 'Tipo de curso inválido',
  }),
  wsetLevel: z.coerce.number().int().min(1).max(4).optional(),
  description: z.string().optional(),
  duration: z.string().optional(),
  // Lugar de las clases presenciales
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
  priceUYU: z.coerce
    .number()
    .nonnegative('El precio no puede ser negativo')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  imageUrl: z.string().optional(),
})

type SemipresencialFormInput = z.input<typeof semipresencialFormSchema>
type SemipresencialFormOutput = z.output<typeof semipresencialFormSchema>

interface CourseWithRelations extends Course {
  tags?: Tag[]
  virtualClasses?: VirtualClass[]
}

interface SemipresencialCourseFormProps {
  course?: CourseWithRelations
  mode: 'create' | 'edit'
  initialTags?: TagData[]
  hasActiveWorkflows?: boolean
}

export function SemipresencialCourseForm({
  course,
  mode,
  initialTags = [],
  hasActiveWorkflows = false,
}: SemipresencialCourseFormProps) {
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
    virtualClasses:
      course?.virtualClasses?.map((vc) => ({
        date: new Date(vc.date),
        streamingUrl: vc.streamingUrl ?? '',
        streamingPassword: vc.streamingPassword ?? '',
      })) ?? [],
    startTime: course?.startTime ?? '17:00',
    classDuration: course?.classDuration ?? 180,
    examDate: course?.examDate ? new Date(course.examDate) : undefined,
    examTime: course?.examTime ?? '',
    registrationDeadline: course?.registrationDeadline
      ? new Date(course.registrationDeadline)
      : undefined,
  })
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    course?.tags?.map((t) => t.id) ?? []
  )

  // State for recalculate dates dialog
  const [showRecalculateDialog, setShowRecalculateDialog] = useState(false)
  const [affectedExecutionsCount, setAffectedExecutionsCount] = useState(0)
  const pendingFormDataRef = useRef<FormData | null>(null)

  // Store original dates for comparison (only in edit mode)
  const originalDatesRef = useRef({
    classDates: course?.classDates?.map((d) => new Date(d).toISOString()) ?? [],
    examDate: course?.examDate ? new Date(course.examDate).toISOString() : null,
    registrationDeadline: course?.registrationDeadline
      ? new Date(course.registrationDeadline).toISOString()
      : null,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SemipresencialFormInput, unknown, SemipresencialFormOutput>({
    resolver: zodResolver(semipresencialFormSchema),
    defaultValues: {
      title: course?.title ?? '',
      slug: course?.slug ?? '',
      type: (course?.type as SemipresencialFormInput['type']) ?? undefined,
      wsetLevel: course?.wsetLevel ?? undefined,
      description: course?.description ?? '',
      duration: course?.duration ?? '',
      location: course?.location ?? '',
      address: course?.address ?? '',
      maxCapacity: course?.maxCapacity ?? undefined,
      priceUSD: course?.priceUSD ?? 0,
      priceUYU: course?.priceUYU ?? undefined,
      imageUrl: course?.imageUrl ?? '',
    },
  })

  const watchType = watch('type')
  const watchSlug = watch('slug')
  const watchTitle = watch('title')

  // Clases virtuales de fechas que siguen en el calendario, una por fecha
  const virtualClasses = keepClassesOnDates(
    courseDates.virtualClasses ?? [],
    courseDates.classDates
  )

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
      toast.error('Primero ingresá un título')
      return
    }

    const newSlug = generateSlug(watchTitle)
    setValue('slug', newSlug, { shouldValidate: true })
  }

  // Check if relevant dates have changed for workflow recalculation.
  // startDate/endDate se derivan de classDates; marcar una clase como virtual o
  // cambiar su link no cambia fechas, así que no dispara el recálculo.
  const haveDatesChanged = useCallback(() => {
    const original = originalDatesRef.current

    const newClassDates = courseDates.classDates.map((d) => d.toISOString()).sort()
    const oldClassDates = [...original.classDates].sort()
    if (JSON.stringify(newClassDates) !== JSON.stringify(oldClassDates)) {
      return true
    }

    const newExamDate = courseDates.examDate?.toISOString() ?? null
    if (newExamDate !== original.examDate) {
      return true
    }

    const newRegistrationDeadline =
      courseDates.registrationDeadline?.toISOString() ?? null
    if (newRegistrationDeadline !== original.registrationDeadline) {
      return true
    }

    return false
  }, [courseDates])

  const handleImageChange = (url: string | null) => {
    setImageUrl(url ?? undefined)
    setValue('imageUrl', url ?? '', { shouldValidate: true })
  }

  const handleImageError = (error: string) => {
    toast.error(error)
  }

  // Build FormData from current form state
  const buildFormData = (data: SemipresencialFormOutput): FormData => {
    const formData = new FormData()

    formData.append('title', data.title)
    formData.append('slug', data.slug)
    formData.append('type', data.type)
    formData.append('modality', 'semipresencial')
    formData.append('priceUSD', data.priceUSD.toString())
    if (data.priceUYU !== undefined && data.priceUYU !== null) {
      formData.append('priceUYU', data.priceUYU.toString())
    }

    if (data.wsetLevel && data.type === 'wset') {
      formData.append('wsetLevel', data.wsetLevel.toString())
    }
    if (data.description) formData.append('description', data.description)
    if (data.duration) formData.append('duration', data.duration)
    if (data.location) formData.append('location', data.location)
    if (data.address) formData.append('address', data.address)
    if (data.maxCapacity) {
      formData.append('maxCapacity', data.maxCapacity.toString())
    }
    if (imageUrl) formData.append('imageUrl', imageUrl)

    // Class dates: start and end derive from the first and last class
    const sortedDates = [...courseDates.classDates].sort(
      (a, b) => a.getTime() - b.getTime()
    )
    formData.append(
      'classDates',
      JSON.stringify(sortedDates.map((d) => d.toISOString()))
    )
    // Siempre se envía (aunque esté vacía): reemplaza las clases virtuales guardadas
    formData.append(
      'virtualClasses',
      JSON.stringify(
        virtualClasses.map((vc) => ({
          date: vc.date.toISOString(),
          streamingUrl: vc.streamingUrl.trim() || undefined,
          streamingPassword: vc.streamingPassword.trim() || undefined,
        }))
      )
    )
    if (sortedDates.length > 0) {
      formData.append('startDate', sortedDates[0].toISOString())
      formData.append('endDate', sortedDates[sortedDates.length - 1].toISOString())
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
    if (courseDates.examTime) {
      formData.append('examTime', courseDates.examTime)
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

    return formData
  }

  // Execute the actual form submission
  const executeSubmit = async (formData: FormData) => {
    let result

    if (mode === 'create') {
      result = await createCourseAction(formData)
    } else {
      result = await updateCourseAction(course!.id, formData)
    }

    if (result.success) {
      toast.success(
        mode === 'create'
          ? 'Curso semipresencial creado exitosamente'
          : 'Curso actualizado exitosamente'
      )
      router.push('/educator/courses')
    } else {
      toast.error(result.error)
    }
  }

  const onSubmit = (data: SemipresencialFormOutput) => {
    if (slugStatus === 'taken') {
      toast.error('El slug ya está en uso. Por favor elegí otro.')
      return
    }

    const scheduleError = validateSemipresencialSchedule({
      classDates: courseDates.classDates,
      virtualClasses,
    })
    if (scheduleError) {
      toast.error(scheduleError)
      return
    }

    const formData = buildFormData(data)

    // Check if we need to show recalculate dialog
    if (mode === 'edit' && hasActiveWorkflows && haveDatesChanged()) {
      pendingFormDataRef.current = formData
      startTransition(async () => {
        const countResult = await countAffectedExecutionsAction(course!.id)
        if (countResult.success && countResult.data && countResult.data.count > 0) {
          setAffectedExecutionsCount(countResult.data.count)
          setShowRecalculateDialog(true)
        } else {
          await executeSubmit(formData)
        }
      })
    } else {
      startTransition(async () => {
        await executeSubmit(formData)
      })
    }
  }

  // Handle recalculate dialog callbacks: in both cases the course is saved
  const handleAfterRecalculateDialog = () => {
    if (pendingFormDataRef.current) {
      startTransition(async () => {
        await executeSubmit(pendingFormDataRef.current!)
        pendingFormDataRef.current = null
      })
    }
  }

  const typeOptions = [
    { value: 'wset', label: 'WSET' },
    { value: 'taller', label: 'Taller' },
    { value: 'cata', label: 'Cata' },
    { value: 'curso', label: 'Curso' },
    { value: 'experiencia', label: 'Experiencia' },
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
          <CardTitle className="flex items-center gap-2">
            <SemipresencialIcon className="h-5 w-5" />
            Información Básica
          </CardTitle>
          <CardDescription>
            Un curso semipresencial combina clases con fecha, presenciales o
            virtuales, con contenido grabado a ritmo propio. Los módulos y
            lecciones se cargan desde &ldquo;Contenido&rdquo; una vez creado el
            curso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ej: Formación Básica en Vinos - Octubre 2026"
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
                  placeholder="ej: formacion-basica-vinos-octubre-2026"
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
                Este slug ya está en uso. Por favor elegí otro.
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
                  setValue('type', value as SemipresencialFormInput['type'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Seleccioná el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer"
                    >
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
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Seleccioná el nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {wsetLevelOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="cursor-pointer"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción del curso..."
              rows={8}
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
            Los tags ayudan a los estudiantes a encontrar tu curso. Podés
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
            Recomendado: imagen de 1200x630px (proporción 16:9)
          </p>
        </CardContent>
      </Card>

      {/* Class Dates, each one presencial or virtual */}
      <CourseDatesSection
        classDates={courseDates.classDates}
        virtualClasses={courseDates.virtualClasses}
        startTime={courseDates.startTime}
        classDuration={courseDates.classDuration}
        examDate={courseDates.examDate}
        examTime={courseDates.examTime}
        registrationDeadline={courseDates.registrationDeadline}
        showExamDate={watchType === 'wset'}
        allowVirtualClasses
        onChange={setCourseDates}
      />

      {/* Total Duration */}
      <Card>
        <CardHeader>
          <CardTitle>Duración Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="duration">Duración del Curso</Label>
            <Input
              id="duration"
              placeholder="Ej: 12 horas de clases + 6 horas de contenido grabado"
              {...register('duration')}
            />
            <p className="text-xs text-muted-foreground">
              Describí la duración total del curso, sumando clases y contenido
              grabado si aplica.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location for presencial classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PresencialClassIcon className="h-5 w-5" />
            Ubicación
          </CardTitle>
          <CardDescription>
            Lugar de las clases presenciales. Es el mismo para todas y podés
            completarlo más adelante.
          </CardDescription>
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
            <Label htmlFor="address">Dirección</Label>
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
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Capacidad Máxima</Label>
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

            <div className="space-y-2">
              <Label htmlFor="priceUYU">Precio (UYU)</Label>
              <Input
                id="priceUYU"
                type="number"
                min="0"
                step="1"
                placeholder="Ej: 6300"
                {...register('priceUYU')}
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Se calcula auto (USD × 42).
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
        <Button
          type="submit"
          disabled={isPending || slugStatus === 'taken'}
        >
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {mode === 'create' ? 'Crear Curso' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* Recalculate Dates Dialog */}
      {course && (
        <RecalculateDatesDialog
          open={showRecalculateDialog}
          onOpenChange={setShowRecalculateDialog}
          courseId={course.id}
          affectedCount={affectedExecutionsCount}
          onRecalculated={handleAfterRecalculateDialog}
          onKeepOriginal={handleAfterRecalculateDialog}
        />
      )}
    </form>
  )
}
