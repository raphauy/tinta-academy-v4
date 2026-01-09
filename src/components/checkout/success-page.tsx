'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  ArrowRight,
  User,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Confetti from 'react-confetti'

interface OrderData {
  id: string
  orderNumber: string
  finalAmount: number
  currency: string
  paymentMethod: string
  paidAt: Date | null
  course: {
    id: string
    title: string
    type: string
    wsetLevel: number | null
    imageUrl: string | null
    startDate: Date | null
    duration: string | null
    location: string | null
    modality: string
    educator: {
      name: string | null
    }
  }
}

interface SuccessPageProps {
  order: OrderData
  showDataBanner: boolean
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

const paymentMethodLabels: Record<string, string> = {
  mercadopago: 'MercadoPago',
  bank_transfer: 'Transferencia Bancaria',
  free: 'Gratuito',
}

// Hook to get window dimensions using useSyncExternalStore
function useWindowSize() {
  const getSnapshot = () =>
    typeof window !== 'undefined'
      ? JSON.stringify({ width: window.innerWidth, height: window.innerHeight })
      : JSON.stringify({ width: 0, height: 0 })

  const getServerSnapshot = () => JSON.stringify({ width: 0, height: 0 })

  const subscribe = (callback: () => void) => {
    window.addEventListener('resize', callback)
    return () => window.removeEventListener('resize', callback)
  }

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return JSON.parse(snapshot) as { width: number; height: number }
}

export function SuccessPage({ order, showDataBanner }: SuccessPageProps) {
  const windowSize = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(true)
  const { course } = order

  useEffect(() => {
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
          colors={['#722F37', '#8B4513', '#DAA520', '#228B22', '#4169E1']}
        />
      )}

      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-green-700">
            Inscripcion Confirmada
          </h1>
          <p className="text-muted-foreground">
            Tu inscripcion al curso ha sido procesada exitosamente
          </p>
        </div>

        {/* WSET Data Banner */}
        {showDataBanner && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base text-amber-800">
                    Completa tus datos personales
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    Para cursos WSET necesitamos tu informacion completa para el
                    registro oficial. Por favor completa tu perfil antes del
                    inicio del curso.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                asChild
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                <Link href="/student/profile">
                  <User className="w-4 h-4 mr-2" />
                  Completar mis datos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Order Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalles de tu compra</CardTitle>
            <CardDescription>Orden #{order.orderNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Course Info */}
            <div className="flex gap-4">
              {course.imageUrl ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">
                    {courseTypeLabels[course.type] || course.type}
                  </Badge>
                  {course.wsetLevel && (
                    <Badge variant="outline">Nivel {course.wsetLevel}</Badge>
                  )}
                </div>
                <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                {course.educator.name && (
                  <p className="text-sm text-muted-foreground">
                    {course.educator.name}
                  </p>
                )}
              </div>
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(course.startDate)}</span>
              </div>
              {course.duration && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
              )}
              {course.location && (
                <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                  <MapPin className="w-4 h-4" />
                  <span>{course.location}</span>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Metodo de pago</span>
                <span>{paymentMethodLabels[order.paymentMethod]}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total pagado</span>
                <span>
                  {order.paymentMethod === 'free'
                    ? 'Gratis'
                    : `${order.currency} ${order.finalAmount.toFixed(2)}`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1" size="lg">
            <Link href={`/student/courses/${course.id}`}>
              <BookOpen className="w-4 h-4 mr-2" />
              Ir a mi curso
            </Link>
          </Button>
          {showDataBanner && (
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/student/profile">
                <User className="w-4 h-4 mr-2" />
                Completar mis datos
              </Link>
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <p className="text-center text-sm text-muted-foreground">
          Recibiras un email de confirmacion con todos los detalles del curso.
          Si tienes alguna pregunta, no dudes en contactarnos.
        </p>
      </div>
    </div>
  )
}
