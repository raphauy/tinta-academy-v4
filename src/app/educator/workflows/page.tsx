import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, GitBranch, Search, HelpCircle } from 'lucide-react'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getWorkflowsByEducator } from '@/services/workflow-template-service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { WorkflowActions } from './components/workflow-actions'
import { WorkflowSearch } from './components/workflow-search'

export const metadata = {
  title: 'Workflows | Tinta Academy',
}

interface WorkflowsPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function WorkflowsPage({
  searchParams,
}: WorkflowsPageProps) {
  const { q: search } = await searchParams
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  if (
    session.user.role !== 'educator' &&
    session.user.role !== 'superadmin'
  ) {
    redirect('/')
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    redirect('/')
  }

  const workflows = await getWorkflowsByEducator(educator.id, search)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">
            Automatiza el envío de emails basados en fechas del curso
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/educator/communications/docs#workflows">
              <HelpCircle className="mr-2 h-4 w-4" />
              Ayuda
            </Link>
          </Button>
          <Button asChild>
            <Link href="/educator/workflows/create">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo workflow
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <WorkflowSearch />

      {/* Content */}
      {workflows.length === 0 && !search ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <GitBranch className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">
            No hay workflows todavía
          </h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
            Los workflows te permiten programar envíos automáticos de emails
            basados en las fechas de tus cursos.
          </p>
          <Button asChild className="mt-4">
            <Link href="/educator/workflows/create">
              <Plus className="mr-2 h-4 w-4" />
              Crear tu primer workflow
            </Link>
          </Button>
        </div>
      ) : workflows.length === 0 && search ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Search className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">
            No se encontraron workflows
          </h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
            No hay workflows que coincidan con &quot;{search}&quot;. Intenta con
            otro término de búsqueda.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Descripción
                </TableHead>
                <TableHead className="text-center">Pasos</TableHead>
                <TableHead className="text-center hidden md:table-cell">
                  Cursos
                </TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="hidden lg:table-cell">Creado</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/educator/workflows/${workflow.id}/edit`}
                      className="hover:underline"
                    >
                      {workflow.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell max-w-[200px] truncate text-muted-foreground">
                    {workflow.description || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {workflow.steps.length}
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    {workflow.courseWorkflows.length > 0 ? (
                      <Badge variant="secondary">
                        {workflow.courseWorkflows.length}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {workflow.isActive ? (
                      <Badge variant="default">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {workflow.createdAt.toLocaleDateString('es', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <WorkflowActions
                      workflowId={workflow.id}
                      workflowName={workflow.name}
                      isActive={workflow.isActive}
                      coursesCount={workflow.courseWorkflows.length}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
