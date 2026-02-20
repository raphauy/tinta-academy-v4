import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getFilterById } from '@/services/audience-filter-service'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { ViewFilterClient } from './view-filter-client'

interface ViewFilterPageProps {
  params: Promise<{ filterId: string }>
}

export default async function ViewFilterPage({ params }: ViewFilterPageProps) {
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

  const isOwner = filter.educatorId === educator.id

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/educator/filters">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={filter.name}
          description={`Creado por ${filter.educator.name}`}
        />
        {isOwner && (
          <Button asChild className="ml-auto">
            <Link href={`/educator/filters/${filter.id}/edit`}>
              Editar
            </Link>
          </Button>
        )}
      </div>

      <ViewFilterClient filter={filter} />
    </div>
  )
}
