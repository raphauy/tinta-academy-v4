import { Suspense } from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AdminBankDataClient } from './admin-bank-data-client'
import { AdminBankDataSkeleton } from '@/components/admin/admin-skeletons'

export const metadata: Metadata = {
  title: 'Datos Bancarios - Admin',
}

async function BankDataContent() {
  const accounts = await prisma.bankAccount.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return <AdminBankDataClient accounts={accounts} />
}

export default function AdminBankDataPage() {
  return (
    <Suspense fallback={<AdminBankDataSkeleton />}>
      <BankDataContent />
    </Suspense>
  )
}
