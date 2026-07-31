'use client'

import { useState } from 'react'
import { useForm, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, Loader2, Receipt } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  studentProfileFormSchema,
  type StudentProfileFormData,
} from '@/lib/validations/student-profile'

// ============================================
// FIELD
// ============================================

interface FieldProps {
  id: keyof StudentProfileFormData
  label: string
  register: UseFormRegister<StudentProfileFormData>
  placeholder?: string
  type?: string
  error?: string
  className?: string
  disabled?: boolean
}

function Field({
  id,
  label,
  register,
  placeholder,
  type,
  error,
  className,
  disabled,
}: FieldProps) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id)}
        disabled={disabled}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// ============================================
// FORM
// ============================================

interface CheckoutProfileFormProps {
  defaultValues: StudentProfileFormData
  /** Los datos no se guardan aca: viajan al servidor junto con la orden. */
  onSubmit: (data: StudentProfileFormData) => void
  submitLabel?: string
  disabled?: boolean
  /** Muestra spinner en el boton cuando el submit dispara una llamada al servidor. */
  isSubmitting?: boolean
}

export function CheckoutProfileForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Continuar al pago',
  disabled,
  isSubmitting,
}: CheckoutProfileFormProps) {
  const [billingExpanded, setBillingExpanded] = useState(false)
  const [usePersonalForBilling, setUsePersonalForBilling] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileFormSchema),
    defaultValues,
  })

  const handleUsePersonalForBilling = (checked: boolean) => {
    setUsePersonalForBilling(checked)

    if (!checked) return

    const values = getValues()
    const fullName = `${values.firstName} ${values.lastName}`.trim()
    const fullAddress = [values.address, values.city, values.zip, values.country]
      .filter(Boolean)
      .join(', ')

    setValue('billingName', fullName)
    setValue('billingTaxId', values.identityDocument || '')
    setValue('billingAddress', fullAddress)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tus datos</CardTitle>
          <CardDescription>
            Los necesitamos para inscribirte y emitir tu diploma
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Datos personales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              id="firstName"
              label="Nombre *"
              placeholder="Tu nombre"
              register={register}
              error={errors.firstName?.message}
              disabled={disabled}
            />
            <Field
              id="lastName"
              label="Apellido *"
              placeholder="Tu apellido"
              register={register}
              error={errors.lastName?.message}
              disabled={disabled}
            />
            <Field
              id="identityDocument"
              label="Cédula de Identidad (CI) *"
              placeholder="1.234.567-8"
              register={register}
              error={errors.identityDocument?.message}
              disabled={disabled}
            />
            <Field
              id="phone"
              label="Teléfono *"
              type="tel"
              placeholder="+598 99 123 456"
              register={register}
              error={errors.phone?.message}
              disabled={disabled}
            />
            <Field
              id="dateOfBirth"
              label="Fecha de nacimiento *"
              type="date"
              register={register}
              error={errors.dateOfBirth?.message}
              disabled={disabled}
              className="sm:col-span-2"
            />
          </div>

          {/* Direccion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <Field
              id="address"
              label="Dirección *"
              placeholder="Calle y número"
              register={register}
              error={errors.address?.message}
              disabled={disabled}
              className="sm:col-span-2"
            />
            <Field
              id="city"
              label="Ciudad *"
              placeholder="Montevideo"
              register={register}
              error={errors.city?.message}
              disabled={disabled}
            />
            <Field
              id="zip"
              label="Código postal *"
              placeholder="11000"
              register={register}
              error={errors.zip?.message}
              disabled={disabled}
            />
            <Field
              id="country"
              label="País *"
              placeholder="Uruguay"
              register={register}
              error={errors.country?.message}
              disabled={disabled}
              className="sm:col-span-2"
            />
          </div>

          {/* Facturacion (opcional) */}
          <div className="border rounded-lg">
            <button
              type="button"
              onClick={() => setBillingExpanded(!billingExpanded)}
              className="w-full flex items-center justify-between p-3 text-sm hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <Receipt className="w-4 h-4" />
                Datos de facturación (opcional)
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  billingExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {billingExpanded && (
              <div className="p-3 pt-0 space-y-4">
                <div className="flex items-center justify-between gap-4 py-3 border-b">
                  <div>
                    <p className="text-sm font-medium">Usar mis datos personales</p>
                    <p className="text-xs text-muted-foreground">
                      Copiar nombre, CI y dirección
                    </p>
                  </div>
                  <Switch
                    checked={usePersonalForBilling}
                    onCheckedChange={handleUsePersonalForBilling}
                    disabled={disabled}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    id="billingName"
                    label="Nombre o razón social"
                    placeholder="Nombre para factura"
                    register={register}
                    disabled={disabled}
                  />
                  <Field
                    id="billingTaxId"
                    label="RUT / CI"
                    placeholder="12.345.678-9"
                    register={register}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Dirección de facturación</Label>
                  <Textarea
                    id="billingAddress"
                    placeholder="Dirección completa para facturación"
                    {...register('billingAddress')}
                    disabled={disabled}
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-verde-uva-600 hover:bg-verde-uva-700"
        disabled={disabled || isSubmitting}
      >
        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isSubmitting ? 'Procesando...' : submitLabel}
      </Button>
    </form>
  )
}
