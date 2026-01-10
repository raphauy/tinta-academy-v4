'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Gift, Calendar, MapPin, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { initiateCheckoutAction } from '@/app/checkout/actions'
import type { CheckoutContext } from '@/services/checkout-service'

interface FreeCheckoutProps {
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

export function FreeCheckout({ context }: FreeCheckoutProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const { course, coupon, pricing } = context

  const handleEnroll = async () => {
    setIsLoading(true)

    try {
      const result = await initiateCheckoutAction(
        course.id,
        'free',
        'USD',
        coupon?.code
      )

      if (!result.success) {
        toast.error('Error al inscribirte', {
          description: result.error,
        })
        setIsLoading(false)
        return
      }

      // Update session if a new role was assigned
      if (result.data?.newRole) {
        await updateSession({ role: result.data.newRole })
      }

      toast.success('Inscripcion completada', {
        description: 'Te has inscrito exitosamente al curso',
      })

      // Redirect to success page
      router.push(`/checkout/success/${result.data?.orderId}`)
    } catch {
      toast.error('Error inesperado', {
        description: 'Por favor intenta de nuevo',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-8">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-xl">Curso Gratuito</CardTitle>
          <CardDescription className="text-base">
            {coupon
              ? `Con tu cupon ${coupon.code} este curso es gratuito`
              : 'Este curso no tiene costo de inscripcion'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Course Card */}
          <div className="rounded-lg border bg-card overflow-hidden">
            {course.imageUrl && (
              <div className="relative aspect-video">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {courseTypeLabels[course.type] || course.type}
                </Badge>
                {course.wsetLevel && (
                  <Badge variant="outline">Nivel {course.wsetLevel}</Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg">{course.title}</h3>
              <p className="text-sm text-muted-foreground">
                {course.educator.name}
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pt-2 border-t">
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
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-4 h-4" />
                    <span>{course.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          {coupon && (
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span>Precio original</span>
                <span className="line-through text-muted-foreground">
                  USD {pricing.originalPriceUSD.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-green-700">
                <span>Descuento ({pricing.discountPercent}%)</span>
                <span>-USD {pricing.discountAmountUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-semibold mt-2 pt-2 border-t border-green-200">
                <span>Total</span>
                <span className="text-green-700">Gratis</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleEnroll}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              'Inscribirme ahora'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
