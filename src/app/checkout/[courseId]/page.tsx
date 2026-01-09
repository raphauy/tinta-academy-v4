import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getCheckoutContext } from '@/services/checkout-service'
import { getCourseById } from '@/services/course-service'
import { CannotEnroll, FreeCheckout, CheckoutForm } from '@/components/checkout'
import { Loader2 } from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getCourseById(courseId)

  return {
    title: course ? `Checkout - ${course.title}` : 'Checkout - Tinta Academy',
  }
}

function CheckoutSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-verde-uva-600" />
        <p className="text-muted-foreground">Cargando checkout...</p>
      </div>
    </div>
  )
}

interface CheckoutContentProps {
  courseId: string
  couponCode?: string
}

async function CheckoutContent({ courseId, couponCode }: CheckoutContentProps) {
  // Get session
  const session = await auth()

  // If not logged in, redirect to login with returnUrl
  if (!session?.user?.id) {
    redirect(`/login?returnUrl=/checkout/${courseId}`)
  }

  // Get course to check if it exists first
  const course = await getCourseById(courseId)

  if (!course) {
    notFound()
  }

  // Get checkout context
  const context = await getCheckoutContext(session.user.id, courseId, couponCode)

  // If cannot enroll, show the reason
  if (!context.canEnroll && context.enrollmentBlockReason) {
    return (
      <CannotEnroll
        reason={context.enrollmentBlockReason}
        courseName={course.title}
        courseSlug={course.slug}
      />
    )
  }

  // If free, show free checkout
  if (context.pricing.isFree) {
    return <FreeCheckout context={context} />
  }

  // Otherwise, show full checkout form
  return <CheckoutForm context={context} />
}

interface CheckoutPageProps {
  params: Promise<{ courseId: string }>
  searchParams: Promise<{ coupon?: string; error?: string }>
}

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { courseId } = await params
  const { coupon } = await searchParams

  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent courseId={courseId} couponCode={coupon} />
    </Suspense>
  )
}
