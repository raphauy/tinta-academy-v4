import { Suspense } from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AdminCouponsClient } from './admin-coupons-client'
import { AdminCouponsSkeleton } from '@/components/admin/admin-skeletons'

export const metadata: Metadata = {
  title: 'Cupones - Admin',
}

async function CouponsContent() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return <AdminCouponsClient coupons={coupons} />
}

export default function AdminCouponsPage() {
  return (
    <Suspense fallback={<AdminCouponsSkeleton />}>
      <CouponsContent />
    </Suspense>
  )
}
