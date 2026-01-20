import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getAllTags } from '@/services/audience-filter-service'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { NewFilterClient } from './new-filter-client'

export default async function NewFilterPage() {
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
          title="Nuevo Filtro de Audiencia"
          description="Crea un filtro para segmentar estudiantes basandote en su historial de cursos"
        />
      </div>

      <NewFilterClient tags={tags} />
    </div>
  )
}
