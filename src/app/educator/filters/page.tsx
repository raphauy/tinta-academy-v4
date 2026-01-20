import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, HelpCircle } from 'lucide-react'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getFiltersByEducator } from '@/services/audience-filter-service'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { FiltersListClient } from './filters-list-client'

export default async function FiltersPage() {
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

  const filters = await getFiltersByEducator(educator.id)

  return (
    <div className="container py-6 space-y-6">
      <PageHeader
        title="Filtros de Audiencia"
        description="Crea filtros para segmentar estudiantes basandote en su historial de cursos"
      >
        <Button variant="ghost" size="sm" asChild>
          <Link href="/educator/communications/docs#filtros">
            <HelpCircle className="h-4 w-4 mr-1" />
            Cómo funcionan
          </Link>
        </Button>
        <Button asChild>
          <Link href="/educator/filters/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo filtro
          </Link>
        </Button>
      </PageHeader>

      <FiltersListClient
        initialFilters={filters}
        currentEducatorId={educator.id}
      />
    </div>
  )
}
