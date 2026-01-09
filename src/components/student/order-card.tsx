'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, CreditCard, Building2, Gift, BookOpen, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface OrderCardProps {
  order: {
    id: string
    orderNumber: string
    finalAmount: number
    currency: string
    paymentMethod: string
    status: string
    createdAt: Date
    paidAt: Date | null
    course: {
      id: string
      title: string
      type: string
      imageUrl: string | null
    }
  }
  viewAs?: string
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  created: { label: 'Creada', variant: 'secondary' },
  pending_payment: { label: 'Pendiente de pago', variant: 'outline' },
  payment_processing: { label: 'Procesando', variant: 'default' },
  paid: { label: 'Pagada', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
  refunded: { label: 'Reembolsada', variant: 'secondary' },
  rejected: { label: 'Rechazada', variant: 'destructive' },
}

const paymentMethodConfig: Record<string, { label: string; icon: typeof CreditCard }> = {
  mercadopago: { label: 'MercadoPago', icon: CreditCard },
  bank_transfer: { label: 'Transferencia', icon: Building2 },
  free: { label: 'Gratuito', icon: Gift },
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-UY', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

function formatAmount(amount: number, currency: string): string {
  if (currency === 'UYU') {
    return `$ ${amount.toLocaleString('es-UY')}`
  }
  return `USD ${amount.toFixed(2)}`
}

export function OrderCard({ order, viewAs }: OrderCardProps) {
  const status = statusConfig[order.status] || {
    label: order.status,
    variant: 'secondary' as const,
  }
  const paymentMethod = paymentMethodConfig[order.paymentMethod] || {
    label: order.paymentMethod,
    icon: CreditCard,
  }
  const PaymentIcon = paymentMethod.icon

  const showTransferButton =
    order.status === 'pending_payment' && order.paymentMethod === 'bank_transfer'
  const showCourseButton = order.status === 'paid'

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Course Image */}
          <div className="relative w-full sm:w-32 h-32 sm:h-auto flex-shrink-0">
            {order.course.imageUrl ? (
              <Image
                src={order.course.imageUrl}
                alt={order.course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="flex-1 p-4 space-y-3">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-mono">
                  {order.orderNumber}
                </p>
                <h3 className="font-semibold line-clamp-1">{order.course.title}</h3>
              </div>
              <Badge
                variant={status.variant}
                className={
                  order.status === 'paid'
                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                    : order.status === 'pending_payment'
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                      : ''
                }
              >
                {status.label}
              </Badge>
            </div>

            {/* Details Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PaymentIcon className="w-4 h-4" />
                <span>{paymentMethod.label}</span>
              </div>
              <div className="font-medium text-foreground">
                {formatAmount(order.finalAmount, order.currency)}
              </div>
            </div>

            {/* Action Button */}
            {(showTransferButton || showCourseButton) && (
              <div className="pt-2">
                {showTransferButton && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/checkout/pending/${order.id}`}>
                      Ver datos de transferencia
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
                {showCourseButton && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/student/courses/${order.course.id}${viewAs ? `?viewAs=${viewAs}` : ''}`}
                    >
                      Ver curso
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
