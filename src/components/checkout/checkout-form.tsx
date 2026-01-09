'use client'

import Image from 'next/image'
import { Calendar, MapPin, Clock, User } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CheckoutContext } from '@/services/checkout-service'

interface CheckoutFormProps {
  context: CheckoutContext
}

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

export function CheckoutForm({ context }: CheckoutFormProps) {
  const { course, pricing } = context

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Left Column - Payment Options (placeholder for 6.17-6.20) */}
      <div className="lg:col-span-3 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Finalizar compra</h1>
          <p className="text-muted-foreground mt-1">
            Completa tu inscripcion a {course.title}
          </p>
        </div>

        {/* Payment methods placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metodo de pago</CardTitle>
            <CardDescription>
              Selecciona como deseas realizar el pago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
              <p className="text-muted-foreground">
                Los metodos de pago se implementaran en la siguiente iteracion
                (PRD 6.17-6.20)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Order Summary */}
      <div className="lg:col-span-2">
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
              <div className="flex justify-between text-sm">
                <span>Precio (USD)</span>
                <span>USD {pricing.originalPriceUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Precio (UYU)</span>
                <span>$ {pricing.originalPriceUYU.toLocaleString('es-UY')}</span>
              </div>
              {pricing.discountPercent > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento ({pricing.discountPercent}%)</span>
                  <span>-USD {pricing.discountAmountUSD.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span>USD {pricing.finalPriceUSD.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
