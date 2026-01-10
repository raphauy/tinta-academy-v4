import { Suspense } from 'react'
import { getAllUsersWithDetails, getUserStats } from '@/services/user-service'
import { AdminUsersSkeleton } from '@/components/admin/admin-skeletons'
import { AdminUsersClient } from './admin-users-client'

export const metadata = {
  title: 'Usuarios - Admin',
}

async function UsersContent() {
  const [users, stats] = await Promise.all([
    getAllUsersWithDetails(),
    getUserStats(),
  ])

  return <AdminUsersClient users={users} stats={stats} />
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminUsersSkeleton />}>
      <UsersContent />
    </Suspense>
  )
}
