import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getFilterById, getAllTags } from '@/services/audience-filter-service'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { EditFilterClient } from './edit-filter-client'

interface EditFilterPageProps {
  params: Promise<{ filterId: string }>
}

export default async function EditFilterPage({ params }: EditFilterPageProps) {
  const { filterId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  if (session.user.role !== 'educator' && session.user.role !== 'superadmin') {
    redirect('/')
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    redirect('/')
  }

  const filter = await getFilterById(filterId, educator.id)

  if (!filter) {
    notFound()
  }

  // Only owner can edit
  if (filter.educatorId !== educator.id) {
    redirect('/educator/filters')
  }

  const tags = await getAllTags()

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/educator/filters">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title="Editar Filtro de Audiencia"
          description={`Editando filtro: ${filter.name}`}
        />
      </div>

      <EditFilterClient filter={filter} tags={tags} />
    </div>
  )
}
