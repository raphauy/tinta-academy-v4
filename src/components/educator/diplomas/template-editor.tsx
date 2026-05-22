'use client'

import { useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import type { Course, DiplomaTemplate } from '@prisma/client'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import {
  diplomaTemplateSchema,
  type DiplomaTemplateInput,
} from '@/lib/validations/diploma'
import { upsertDiplomaTemplateAction } from '@/app/educator/courses/[id]/diploma/actions'
import { DiplomaPreview } from './diploma-preview'
import { ImageBaseUpload, type DiplomaBaseImage } from './image-base-upload'
import { ColorPicker } from './color-picker'
import { FontSelector } from './font-selector'
import { DateFormatSelector } from './date-format-selector'
import { TemplateSampleActions } from './template-sample-actions'

type Props = {
  course: Pick<Course, 'id' | 'title' | 'classDates' | 'endDate' | 'startDate'>
  initialTemplate: DiplomaTemplate | null
  initialBaseImage: DiplomaBaseImage
  /**
   * Hay un lote `generated`/`failed` que se descartará al guardar la plantilla.
   * Muestra un AlertDialog de confirmación antes del submit.
   */
  hasInvalidatableBatch?: boolean
  /** Email del usuario logueado, usado como default para enviar muestras. */
  sessionEmail: string
}

const NAME_DEFAULTS = {
  nameFontFamily: 'Geist' as const,
  nameFontWeight: 700,
  nameFontSize: 10,
  nameColor: '#525252',
  nameX: 34.5,
  nameY: 30,
  nameMaxWidth: 63,
  nameAnchor: 'left' as const,
}

const DATE_DEFAULTS = {
  dateFontFamily: 'Geist' as const,
  dateFontWeight: 500,
  dateFontSize: 2.5,
  dateColor: '#525252',
  dateX: 78,
  dateY: 8,
  dateMaxWidth: 20,
  dateAnchor: 'left' as const,
  dateFormat: "d 'de' MMMM 'de' yyyy",
}

function buildDefaults(
  base: DiplomaBaseImage,
  template: DiplomaTemplate | null
): DiplomaTemplateInput {
  if (template) {
    return {
      baseImageUrl: template.baseImageUrl,
      baseImageWidth: template.baseImageWidth,
      baseImageHeight: template.baseImageHeight,
      nameFontFamily:
        template.nameFontFamily as DiplomaTemplateInput['nameFontFamily'],
      nameFontWeight: template.nameFontWeight,
      nameFontSize: template.nameFontSize,
      nameColor: template.nameColor,
      nameX: template.nameX,
      nameY: template.nameY,
      nameMaxWidth: template.nameMaxWidth,
      nameAnchor: template.nameAnchor,
      dateEnabled: template.dateEnabled,
      dateFontFamily: (template.dateFontFamily ??
        null) as DiplomaTemplateInput['dateFontFamily'],
      dateFontWeight: template.dateFontWeight,
      dateFontSize: template.dateFontSize,
      dateColor: template.dateColor,
      dateX: template.dateX,
      dateY: template.dateY,
      dateMaxWidth: template.dateMaxWidth,
      dateAnchor: template.dateAnchor,
      dateFormat: template.dateFormat,
      dateMode: template.dateMode,
      dateCustomValue: template.dateCustomValue,
    }
  }
  return {
    baseImageUrl: base.url,
    baseImageWidth: base.width,
    baseImageHeight: base.height,
    ...NAME_DEFAULTS,
    dateEnabled: false,
    dateFontFamily: null,
    dateFontWeight: null,
    dateFontSize: null,
    dateColor: null,
    dateX: null,
    dateY: null,
    dateMaxWidth: null,
    dateAnchor: null,
    dateFormat: null,
    dateMode: 'last_class',
    dateCustomValue: null,
  }
}

function resolveSampleDate(
  course: Pick<Course, 'classDates' | 'endDate' | 'startDate'>,
  dateMode: 'last_class' | 'custom',
  dateCustomValue: Date | null
): Date | null {
  if (dateMode === 'custom') return dateCustomValue
  if (course.classDates.length > 0) {
    return new Date(
      Math.max(...course.classDates.map((d) => new Date(d).getTime()))
    )
  }
  if (course.endDate) return new Date(course.endDate)
  if (course.startDate) return new Date(course.startDate)
  return null
}

export function TemplateEditor({
  course,
  initialTemplate,
  initialBaseImage,
  hasInvalidatableBatch = false,
  sessionEmail,
}: Props) {
  const router = useRouter()
  const [sampleName, setSampleName] = useState('Lorenzo Musetti')
  const [baseImage, setBaseImage] = useState<DiplomaBaseImage>(initialBaseImage)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const pendingDataRef = useRef<DiplomaTemplateInput | null>(null)

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<DiplomaTemplateInput>({
    resolver: zodResolver(diplomaTemplateSchema),
    defaultValues: buildDefaults(initialBaseImage, initialTemplate),
  })

  const values = watch()

  // Al activar el toggle de fecha, rellenar defaults si están vacíos
  const handleToggleDate = (next: boolean) => {
    setValue('dateEnabled', next, { shouldDirty: true })
    if (next) {
      if (values.dateFontFamily === null) {
        setValue('dateFontFamily', DATE_DEFAULTS.dateFontFamily, {
          shouldDirty: true,
        })
        setValue('dateFontWeight', DATE_DEFAULTS.dateFontWeight, {
          shouldDirty: true,
        })
        setValue('dateFontSize', DATE_DEFAULTS.dateFontSize, {
          shouldDirty: true,
        })
        setValue('dateColor', DATE_DEFAULTS.dateColor, { shouldDirty: true })
        setValue('dateX', DATE_DEFAULTS.dateX, { shouldDirty: true })
        setValue('dateY', DATE_DEFAULTS.dateY, { shouldDirty: true })
        setValue('dateMaxWidth', DATE_DEFAULTS.dateMaxWidth, {
          shouldDirty: true,
        })
        setValue('dateAnchor', DATE_DEFAULTS.dateAnchor, { shouldDirty: true })
        setValue('dateFormat', DATE_DEFAULTS.dateFormat, { shouldDirty: true })
      }
    }
  }

  const handleBaseImageChange = (next: DiplomaBaseImage) => {
    setBaseImage(next)
    setValue('baseImageUrl', next.url, { shouldDirty: true })
    setValue('baseImageWidth', next.width, { shouldDirty: true })
    setValue('baseImageHeight', next.height, { shouldDirty: true })
  }

  const persist = async (data: DiplomaTemplateInput) => {
    const result = await upsertDiplomaTemplateAction(course.id, data)
    if (result.success) {
      toast.success('Plantilla guardada')
      if (result.data) reset(buildDefaults(baseImage, result.data))
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    if (hasInvalidatableBatch) {
      pendingDataRef.current = data
      setConfirmOpen(true)
      return
    }
    await persist(data)
  })

  const handleConfirmDiscard = async () => {
    const data = pendingDataRef.current
    pendingDataRef.current = null
    setConfirmOpen(false)
    if (data) await persist(data)
  }

  const sampleDate = resolveSampleDate(
    course,
    values.dateMode,
    values.dateCustomValue
  )

  // Hay errores de validación adicionales que zod no captura solo (ej. last_class sin fechas).
  const lastClassUnresolvable =
    values.dateEnabled &&
    values.dateMode === 'last_class' &&
    !sampleDate

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar el lote pendiente</AlertDialogTitle>
            <AlertDialogDescription>
              Hay un lote de diplomas pendiente de revisión generado con la
              plantilla anterior. Al guardar los cambios se descartará para que
              puedas regenerar con la configuración nueva. Los diplomas ya
              enviados no se tocan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                pendingDataRef.current = null
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>
              Guardar y descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Preview */}
        <div>
          <DiplomaPreview
            baseImageUrl={baseImage.url}
            baseImageWidth={baseImage.width}
            baseImageHeight={baseImage.height}
            config={values}
            sampleName={sampleName}
            sampleDate={sampleDate}
            draggable
            onMoveName={(x, y) => {
              setValue('nameX', round2(x), { shouldDirty: true })
              setValue('nameY', round2(y), { shouldDirty: true })
            }}
            onMoveDate={(x, y) => {
              setValue('dateX', round2(x), { shouldDirty: true })
              setValue('dateY', round2(y), { shouldDirty: true })
            }}
            onResizeName={({ fontSize, maxWidth }) => {
              setValue('nameFontSize', fontSize, { shouldDirty: true })
              setValue('nameMaxWidth', maxWidth, { shouldDirty: true })
            }}
            onResizeDate={({ fontSize, maxWidth }) => {
              setValue('dateFontSize', fontSize, { shouldDirty: true })
              setValue('dateMaxWidth', maxWidth, { shouldDirty: true })
            }}
          />
          <div className="mt-3 space-y-1">
            <Label className="text-xs" htmlFor="sample-name">
              Nombre de muestra (solo para previsualizar)
            </Label>
            <Input
              id="sample-name"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="mt-4">
            <TemplateSampleActions
              courseId={course.id}
              template={values}
              sampleName={sampleName}
              defaultEmail={sessionEmail}
            />
          </div>
        </div>

        {/* Panel derecho */}
        <div className="space-y-4">
          {/* Nombre del alumno */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Nombre del alumno</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FontSelector
                family={values.nameFontFamily}
                weight={values.nameFontWeight}
                onFamilyChange={(f) =>
                  setValue('nameFontFamily', f, { shouldDirty: true })
                }
                onWeightChange={(w) =>
                  setValue('nameFontWeight', w, { shouldDirty: true })
                }
              />

              <NumberRow
                label="Tamaño (%)"
                value={values.nameFontSize}
                min={1}
                max={25}
                step={0.5}
                onChange={(v) =>
                  setValue('nameFontSize', v, { shouldDirty: true })
                }
              />

              <div className="space-y-1">
                <Label className="text-xs">Color</Label>
                <ColorPicker
                  value={values.nameColor}
                  onChange={(c) => setValue('nameColor', c, { shouldDirty: true })}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <NumberRow
                  label="X (%)"
                  value={values.nameX}
                  min={0}
                  max={100}
                  step={0.5}
                  onChange={(v) => setValue('nameX', v, { shouldDirty: true })}
                />
                <NumberRow
                  label="Y (%)"
                  value={values.nameY}
                  min={0}
                  max={100}
                  step={0.5}
                  onChange={(v) => setValue('nameY', v, { shouldDirty: true })}
                />
                <NumberRow
                  label="Ancho (%)"
                  value={values.nameMaxWidth}
                  min={1}
                  max={100}
                  step={1}
                  onChange={(v) =>
                    setValue('nameMaxWidth', v, { shouldDirty: true })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Fecha (opcional) */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Fecha</CardTitle>
              <Switch
                checked={values.dateEnabled}
                onCheckedChange={handleToggleDate}
              />
            </CardHeader>
            {values.dateEnabled && (
              <CardContent className="space-y-3">
                <FontSelector
                  family={
                    (values.dateFontFamily ??
                      'Geist') as DiplomaTemplateInput['nameFontFamily']
                  }
                  weight={values.dateFontWeight ?? 500}
                  onFamilyChange={(f) =>
                    setValue('dateFontFamily', f, { shouldDirty: true })
                  }
                  onWeightChange={(w) =>
                    setValue('dateFontWeight', w, { shouldDirty: true })
                  }
                />

                <NumberRow
                  label="Tamaño (%)"
                  value={values.dateFontSize ?? 2.5}
                  min={1}
                  max={25}
                  step={0.1}
                  onChange={(v) =>
                    setValue('dateFontSize', v, { shouldDirty: true })
                  }
                />

                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <ColorPicker
                    value={values.dateColor ?? '#2A2A2A'}
                    onChange={(c) =>
                      setValue('dateColor', c, { shouldDirty: true })
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <NumberRow
                    label="X (%)"
                    value={values.dateX ?? DATE_DEFAULTS.dateX}
                    min={0}
                    max={100}
                    step={0.5}
                    onChange={(v) =>
                      setValue('dateX', v, { shouldDirty: true })
                    }
                  />
                  <NumberRow
                    label="Y (%)"
                    value={values.dateY ?? DATE_DEFAULTS.dateY}
                    min={0}
                    max={100}
                    step={0.5}
                    onChange={(v) =>
                      setValue('dateY', v, { shouldDirty: true })
                    }
                  />
                  <NumberRow
                    label="Ancho (%)"
                    value={values.dateMaxWidth ?? DATE_DEFAULTS.dateMaxWidth}
                    min={1}
                    max={100}
                    step={1}
                    onChange={(v) =>
                      setValue('dateMaxWidth', v, { shouldDirty: true })
                    }
                  />
                </div>

                <DateFormatSelector
                  value={values.dateFormat ?? "d 'de' MMMM 'de' yyyy"}
                  onChange={(v) =>
                    setValue('dateFormat', v, { shouldDirty: true })
                  }
                  sampleDate={sampleDate ?? new Date()}
                />

                <div className="space-y-1">
                  <Label className="text-xs">Fecha a mostrar</Label>
                  <Select
                    value={values.dateMode}
                    onValueChange={(v) =>
                      setValue('dateMode', v as 'last_class' | 'custom', {
                        shouldDirty: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_class">
                        Fecha de la última clase
                      </SelectItem>
                      <SelectItem value="custom">Fecha personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                  {lastClassUnresolvable && (
                    <p className="text-xs text-destructive">
                      Este curso no tiene fechas cargadas. Elegí “Fecha
                      personalizada” o cargá las clases del curso primero.
                    </p>
                  )}
                </div>

                {values.dateMode === 'custom' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Elegir fecha</Label>
                    <Controller
                      control={control}
                      name="dateCustomValue"
                      render={({ field }) => (
                        <DatePicker
                          value={field.value ?? undefined}
                          onChange={(d) => field.onChange(d ?? null)}
                          placeholder="Seleccionar fecha"
                        />
                      )}
                    />
                    {errors.dateCustomValue && (
                      <p className="text-xs text-destructive">
                        {errors.dateCustomValue.message}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Imagen base (al final, se usa poco una vez configurada) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Imagen base</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageBaseUpload
                courseId={course.id}
                value={baseImage}
                onChange={handleBaseImageChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
        {isDirty && (
          <span className="text-xs text-muted-foreground">
            {initialTemplate ? 'Tenés cambios sin guardar' : 'Plantilla sin guardar'}
          </span>
        )}
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            lastClassUnresolvable ||
            // Para una plantilla nueva permitimos guardar siempre (los defaults
            // pueden alcanzar tal cual). Para una plantilla ya persistida,
            // solo si hay cambios.
            (initialTemplate !== null && !isDirty)
          }
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Guardando…' : 'Guardar plantilla'}
        </Button>
      </div>
    </form>
  )
}

function round2(n: number): number {
  return Math.round(n * 10) / 10
}

type NumberRowProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

function NumberRow({ label, value, min, max, step, onChange }: NumberRowProps) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = e.target.valueAsNumber
          if (!Number.isNaN(v)) onChange(v)
        }}
      />
    </div>
  )
}
