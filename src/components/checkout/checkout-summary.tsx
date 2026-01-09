import Image from 'next/image'
import { Calendar, MapPin, Clock, User, Tag } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Pricing } from '@/services/checkout-service'
import type { Coupon } from '@prisma/client'

// ============================================
// TYPES
// ============================================

interface CourseForSummary {
  title: string
  type: string
  wsetLevel: number | null
  imageUrl: string | null
  startDate: Date | null
  duration: string | null
  location: string | null
  educator: {
    name: string
  }
}

export interface CheckoutSummaryProps {
  course: CourseForSummary
  pricing: Pricing
  coupon?: Coupon | null
  /** Currency determines which price to show. 'UYU' for MercadoPago, 'USD' for bank transfer */
  currency: 'UYU' | 'USD'
}

// ============================================
// HELPERS
// ============================================

function formatDate(date: Date | null): string {
  if (!date) return 'Por definir'
  return new Intl.DateTimeFormat('es-UY', {
    dateStyle: 'long',
  }).format(new Date(date))
}

const courseTypeLabels: Record<string, string> = {
  wset: 'WSET',
  taller: 'Taller',
  cata: 'Cata',
  curso: 'Curso',
}

// ============================================
// CHECKOUT SUMMARY COMPONENT
// ============================================

export function CheckoutSummary({
  course,
  pricing,
  coupon,
  currency,
}: CheckoutSummaryProps) {
  const displayPrice =
    currency === 'UYU'
      ? `$ ${pricing.finalPriceUYU.toLocaleString('es-UY')}`
      : `USD ${pricing.finalPriceUSD.toFixed(2)}`

  const originalPrice =
    currency === 'UYU'
      ? `$ ${pricing.originalPriceUYU.toLocaleString('es-UY')}`
      : `USD ${pricing.originalPriceUSD.toFixed(2)}`

  const discountAmount =
    currency === 'UYU'
      ? `$ ${pricing.discountAmountUYU.toLocaleString('es-UY')}`
      : `USD ${pricing.discountAmountUSD.toFixed(2)}`

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="text-lg">Resumen del pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course Image */}
        {course.imageUrl && (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Course Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {courseTypeLabels[course.type] || course.type}
            </Badge>
            {course.wsetLevel && (
              <Badge variant="outline">Nivel {course.wsetLevel}</Badge>
            )}
          </div>
          <h3 className="font-semibold">{course.title}</h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{course.educator.name}</span>
          </div>
        </div>

        {/* Course Details */}
        <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(course.startDate)}</span>
          </div>
          {course.duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{course.location}</span>
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="border-t pt-4 space-y-2">
          {pricing.discountPercent > 0 ? (
            <>
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="line-through text-muted-foreground">
                  {originalPrice}
                </span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Descuento ({coupon?.code || `${pricing.discountPercent}%`})
                </span>
                <span>-{discountAmount}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{originalPrice}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-verde-uva-700">{displayPrice}</span>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {currency === 'UYU' ? 'Pesos uruguayos' : 'Dolares americanos'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
