'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  Building2,
  Check,
  Loader2,
  ChevronDown,
  Tag,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CheckoutContext, Pricing } from '@/services/checkout-service'
import type { ValidateCouponResult } from '@/services/coupon-service'
import { initiateCheckoutAction, applyCouponAction } from '@/app/checkout/actions'
import { CheckoutSummary } from './checkout-summary'

// ============================================
// TYPES
// ============================================

interface CheckoutFormProps {
  context: CheckoutContext
}

type PaymentMethod = 'mercadopago' | 'bank_transfer'

// ============================================
// PAYMENT METHOD SELECTOR
// ============================================

interface PaymentMethodSelectorProps {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
  pricing: Pricing
}

function PaymentMethodSelector({
  selected,
  onSelect,
  pricing,
}: PaymentMethodSelectorProps) {
  // MercadoPago temporarily disabled
  const isMercadoPagoEnabled = false

  return (
    <div className="space-y-3">
      {/* MercadoPago Option - Temporarily Disabled */}
      <div
        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
          isMercadoPagoEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
        } ${
          selected === 'mercadopago' && isMercadoPagoEnabled
            ? 'border-verde-uva-600 bg-verde-uva-50/50'
            : 'border-muted'
        }`}
        onClick={() => isMercadoPagoEnabled && onSelect('mercadopago')}
        role="button"
        tabIndex={isMercadoPagoEnabled ? 0 : -1}
        aria-disabled={!isMercadoPagoEnabled}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === 'mercadopago' && isMercadoPagoEnabled
                  ? 'border-verde-uva-600 bg-verde-uva-600'
                  : 'border-muted-foreground/50'
              }`}
            >
              {selected === 'mercadopago' && isMercadoPagoEnabled && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">MercadoPago</span>
                {!isMercadoPagoEnabled && (
                  <Badge variant="secondary" className="text-xs">
                    Proximamente
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Tarjeta de credito, debito o efectivo
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold">
              $ {pricing.finalPriceUYU.toLocaleString('es-UY')}
            </span>
            <p className="text-xs text-muted-foreground">UYU</p>
          </div>
        </div>
      </div>

      {/* Bank Transfer Option */}
      <button
        type="button"
        onClick={() => onSelect('bank_transfer')}
        className={`w-full p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
          selected === 'bank_transfer'
            ? 'border-verde-uva-600 bg-verde-uva-50/50'
            : 'border-muted hover:border-muted-foreground/50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === 'bank_transfer'
                  ? 'border-verde-uva-600 bg-verde-uva-600'
                  : 'border-muted-foreground/50'
              }`}
            >
              {selected === 'bank_transfer' && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold">Transferencia Bancaria</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Pago en dolares via transferencia
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold">
              USD {pricing.finalPriceUSD.toFixed(2)}
            </span>
            <p className="text-xs text-muted-foreground">Dolares</p>
          </div>
        </div>
      </button>
    </div>
  )
}

// ============================================
// COUPON INPUT
// ============================================

interface CouponInputProps {
  courseId: string
  appliedCoupon: ValidateCouponResult | null
  onApply: (result: ValidateCouponResult) => void
  onRemove: () => void
  disabled?: boolean
}

function CouponInput({
  courseId,
  appliedCoupon,
  onApply,
  onRemove,
  disabled,
}: CouponInputProps) {
  const [isExpanded, setIsExpanded] = useState(!!appliedCoupon)
  const [couponCode, setCouponCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    if (!couponCode.trim()) {
      setError('Ingresa un codigo de cupon')
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      const result = await applyCouponAction(courseId, couponCode.trim())

      if (!result.success) {
        setError(result.error)
        return
      }

      if (!result.data?.valid) {
        setError(result.data?.errorMessage || 'Cupon no valido')
        return
      }

      onApply(result.data)
      setCouponCode('')
    } catch {
      setError('Error al validar el cupon')
    } finally {
      setIsValidating(false)
    }
  }

  // Show applied coupon badge
  if (appliedCoupon?.valid && appliedCoupon.coupon) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
        <Tag className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-800">
          {appliedCoupon.coupon.code}
        </span>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          -{appliedCoupon.discountPercent}%
        </Badge>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="ml-auto p-1 hover:bg-green-200 rounded-full transition-colors"
          aria-label="Quitar cupon"
        >
          <X className="w-4 h-4 text-green-600" />
        </button>
      </div>
    )
  }

  return (
    <div className="border rounded-lg bg-white">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-sm hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <Tag className="w-4 h-4" />
          Tengo un cupon de descuento
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="p-3 pt-0 space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Codigo de cupon"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase())
                setError(null)
              }}
              disabled={isValidating || disabled}
              className="flex-1 uppercase"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleApply()
                }
              }}
            />
            <Button
              type="button"
              onClick={handleApply}
              disabled={isValidating || disabled || !couponCode.trim()}
              className="bg-verde-uva-600 hover:bg-verde-uva-700 text-white"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Aplicar'
              )}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    </div>
  )
}


// ============================================
// MAIN CHECKOUT FORM
// ============================================

export function CheckoutForm({ context }: CheckoutFormProps) {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResult | null>(
    context.couponValidation
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate updated pricing when coupon changes
  const currentPricing = appliedCoupon?.valid
    ? {
        ...context.pricing,
        discountPercent: appliedCoupon.discountPercent ?? 0,
        discountAmountUSD: appliedCoupon.discountAmount ?? 0,
        discountAmountUYU: Math.round(
          (appliedCoupon.discountAmount ?? 0) * (context.pricing.originalPriceUYU / context.pricing.originalPriceUSD)
        ),
        finalPriceUSD: appliedCoupon.finalAmount ?? context.pricing.originalPriceUSD,
        finalPriceUYU: Math.round(
          (appliedCoupon.finalAmount ?? context.pricing.originalPriceUSD) *
            (context.pricing.originalPriceUYU / context.pricing.originalPriceUSD)
        ),
        isFree: (appliedCoupon.finalAmount ?? 0) === 0,
      }
    : context.pricing

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const currency = paymentMethod === 'mercadopago' ? 'UYU' : 'USD'
      const couponCode = appliedCoupon?.valid ? appliedCoupon.coupon?.code : undefined

      // For bank transfer, use first available bank account
      const bankAccountId =
        paymentMethod === 'bank_transfer' ? context.bankAccounts[0]?.id : undefined

      const result = await initiateCheckoutAction(
        context.course.id,
        paymentMethod,
        currency,
        couponCode,
        bankAccountId
      )

      if (!result.success) {
        toast.error(result.error)
        return
      }

      // Redirect based on payment method
      if (result.data?.redirectUrl) {
        // MercadoPago: redirect to MP checkout
        window.location.href = result.data.redirectUrl
      } else if (result.data?.orderId) {
        // Bank transfer: redirect to pending page
        router.push(`/checkout/pending/${result.data.orderId}`)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Error al procesar el checkout')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCouponApply = (result: ValidateCouponResult) => {
    setAppliedCoupon(result)
    toast.success(`Cupon aplicado: ${result.discountPercent}% de descuento`)
  }

  const handleCouponRemove = () => {
    setAppliedCoupon(null)
    toast.info('Cupon eliminado')
  }

  const submitButtonText = () => {
    if (isSubmitting) return 'Procesando...'
    if (paymentMethod === 'mercadopago') {
      return `Pagar $ ${currentPricing.finalPriceUYU.toLocaleString('es-UY')}`
    }
    return `Pagar USD ${currentPricing.finalPriceUSD.toFixed(2)}`
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Left Column - Payment Options */}
      <div className="lg:col-span-3 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Finalizar compra</h1>
          <p className="text-muted-foreground mt-1">
            Completa tu inscripcion a {context.course.title}
          </p>
        </div>

        {/* Coupon Input */}
        <CouponInput
          courseId={context.course.id}
          appliedCoupon={appliedCoupon}
          onApply={handleCouponApply}
          onRemove={handleCouponRemove}
          disabled={isSubmitting}
        />

        {/* Payment Method Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metodo de pago</CardTitle>
            <CardDescription>
              Selecciona como deseas realizar el pago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentMethodSelector
              selected={paymentMethod}
              onSelect={setPaymentMethod}
              pricing={currentPricing}
            />
          </CardContent>
        </Card>

        {/* Bank Account Info (shown when bank_transfer selected) */}
        {paymentMethod === 'bank_transfer' && context.bankAccounts.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800">
                <strong>Nota:</strong> Al seleccionar transferencia bancaria, te
                mostraremos los datos de la cuenta para realizar el pago. Tu
                inscripcion quedara pendiente hasta confirmar la transferencia.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          size="lg"
          className="w-full bg-verde-uva-600 hover:bg-verde-uva-700"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            submitButtonText()
          )}
        </Button>

        {/* Security Notice */}
        <p className="text-xs text-center text-muted-foreground">
          Tus datos estan protegidos. Al continuar aceptas nuestros terminos y
          condiciones.
        </p>
      </div>

      {/* Right Column - Order Summary */}
      <div className="lg:col-span-2">
        <CheckoutSummary
          course={context.course}
          pricing={currentPricing}
          coupon={appliedCoupon?.coupon}
          currency={paymentMethod === 'mercadopago' ? 'UYU' : 'USD'}
        />
      </div>
    </div>
  )
}
