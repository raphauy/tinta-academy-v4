'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  GitBranch,
  Search,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Eye,
  BookOpen,
  ListOrdered,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminMetricCard } from '@/components/admin/admin-metric-card'
import { AdminWorkflowExecutionsDialog } from '@/components/admin/admin-workflow-executions-dialog'

type SortField = 'name' | 'educator' | 'steps' | 'courses' | 'createdAt' | 'status'
type SortDirection = 'asc' | 'desc'
type StatusFilter = 'all' | 'active' | 'inactive'

interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  totalPending: number
  totalSent: number
  totalFailed: number
}

interface EducatorOption {
  id: string
  name: string
  _count: {
    workflowTemplates: number
  }
}

interface WorkflowWithRelations {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  educator: { id: string; name: string }
  steps: Array<{ id: string }>
  courseWorkflows: Array<{
    id: string
    course: { id: string; title: string }
  }>
}

export interface AdminWorkflowsClientProps {
  workflows: WorkflowWithRelations[]
  stats: WorkflowStats
  educators: EducatorOption[]
}

export function AdminWorkflowsClient({
  workflows,
  stats,
  educators,
}: AdminWorkflowsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [educatorFilter, setEducatorFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Dialog state
  const [selectedWorkflow, setSelectedWorkflow] = useState<{
    id: string
    name: string
  } | null>(null)

  const filteredWorkflows = useMemo(() => {
    let result = [...workflows]

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      result = result.filter((workflow) => workflow.isActive === isActive)
    }

    if (educatorFilter !== 'all') {
      result = result.filter((workflow) => workflow.educator.id === educatorFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (workflow) =>
          workflow.name.toLowerCase().includes(query) ||
          workflow.educator.name.toLowerCase().includes(query) ||
          (workflow.description?.toLowerCase() || '').includes(query)
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'educator':
          comparison = a.educator.name.localeCompare(b.educator.name)
          break
        case 'steps':
          comparison = a.steps.length - b.steps.length
          break
        case 'courses':
          comparison = a.courseWorkflows.length - b.courseWorkflows.length
          break
        case 'status':
          comparison = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0)
          break
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [workflows, searchQuery, statusFilter, educatorFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const renderSortButton = (field: SortField, label: string) => (
    <Button
      key={field}
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className={`h-auto px-1 py-0 text-xs font-medium ${
        sortField === field
          ? 'text-[#143F3B] dark:text-[#6B9B7A]'
          : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
      }`}
    >
      {label}
      {sortField === field && (
        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            sortDirection === 'asc' ? 'rotate-180' : ''
          }`}
        />
      )}
    </Button>
  )

  const formatDate = (date: Date) => {
    return format(new Date(date), "d 'de' MMM, yyyy", { locale: es })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          Workflows
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Gestiona todos los workflows de automatizacion de todos los educadores
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <AdminMetricCard
          label="Total Workflows"
          value={stats.totalWorkflows}
          icon={<GitBranch className="w-4 h-4" />}
          variant="primary"
        />
        <AdminMetricCard
          label="Activos"
          value={stats.activeWorkflows}
          icon={<Play className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Pendientes"
          value={stats.totalPending}
          icon={<Clock className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Enviados"
          value={stats.totalSent}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Fallidos"
          value={stats.totalFailed}
          icon={<XCircle className="w-4 h-4" />}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <Input
            type="text"
            placeholder="Buscar por nombre o educador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-background"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Select value={educatorFilter} onValueChange={setEducatorFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-background">
            <SelectValue placeholder="Educador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los educadores</SelectItem>
            {educators.map((educator) => (
              <SelectItem key={educator.id} value={educator.id}>
                {educator.name} ({educator._count.workflowTemplates})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-40 bg-background">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredWorkflows.length === 0
            ? 'No se encontraron workflows'
            : filteredWorkflows.length === 1
              ? '1 workflow'
              : `${filteredWorkflows.length} workflows`}
          {(searchQuery || statusFilter !== 'all' || educatorFilter !== 'all') &&
            workflows.length !== filteredWorkflows.length && (
              <span className="text-stone-400 dark:text-stone-500">
                {' '}de {workflows.length} totales
              </span>
            )}
        </p>

        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 dark:text-stone-500">
            Ordenar por:
          </span>
          <div className="flex items-center gap-3">
            {renderSortButton('name', 'Nombre')}
            {renderSortButton('educator', 'Educador')}
            {renderSortButton('steps', 'Pasos')}
            {renderSortButton('courses', 'Cursos')}
            {renderSortButton('status', 'Estado')}
            {renderSortButton('createdAt', 'Fecha')}
          </div>
        </div>
      </div>

      {filteredWorkflows.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
            <div className="col-span-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Workflow
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Educador
            </div>
            <div className="col-span-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-center">
              Pasos
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-center">
              Cursos
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Estado
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
              Acciones
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {filteredWorkflows.map((workflow) => (
              <WorkflowRow
                key={workflow.id}
                workflow={workflow}
                formatDate={formatDate}
                onViewExecutions={() =>
                  setSelectedWorkflow({ id: workflow.id, name: workflow.name })
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <GitBranch className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            Sin resultados
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
            {searchQuery || statusFilter !== 'all' || educatorFilter !== 'all'
              ? 'No se encontraron workflows con los filtros aplicados'
              : 'No hay workflows registrados en la plataforma'}
          </p>
          {(searchQuery || statusFilter !== 'all' || educatorFilter !== 'all') && (
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setEducatorFilter('all')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Executions Dialog */}
      <AdminWorkflowExecutionsDialog
        open={selectedWorkflow !== null}
        onOpenChange={(open) => !open && setSelectedWorkflow(null)}
        workflowId={selectedWorkflow?.id ?? ''}
        workflowName={selectedWorkflow?.name ?? ''}
      />
    </div>
  )
}

interface WorkflowRowProps {
  workflow: WorkflowWithRelations
  formatDate: (date: Date) => string
  onViewExecutions: () => void
}

function WorkflowRow({ workflow, formatDate, onViewExecutions }: WorkflowRowProps) {
  return (
    <div className="px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* Desktop view */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
        <div className="col-span-3 space-y-1">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#143F3B] dark:text-[#6B9B7A]" />
            <Button
              variant="link"
              onClick={onViewExecutions}
              className="h-auto p-0 font-medium text-stone-900 dark:text-stone-100 truncate"
            >
              {workflow.name}
            </Button>
          </div>
          {workflow.description && (
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              {workflow.description}
            </p>
          )}
        </div>

        <div className="col-span-2">
          <p className="text-sm text-stone-700 dark:text-stone-300 truncate">
            {workflow.educator.name}
          </p>
        </div>

        <div className="col-span-1 text-center">
          <div className="inline-flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400">
            <ListOrdered className="w-3.5 h-3.5" />
            {workflow.steps.length}
          </div>
        </div>

        <div className="col-span-2 text-center">
          <div className="inline-flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400">
            <BookOpen className="w-3.5 h-3.5" />
            {workflow.courseWorkflows.length}
          </div>
        </div>

        <div className="col-span-2">
          <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
            {workflow.isActive ? (
              <>
                <Play className="w-3 h-3 mr-1" />
                Activo
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Inactivo
              </>
            )}
          </Badge>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {formatDate(workflow.createdAt)}
          </p>
        </div>

        <div className="col-span-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onViewExecutions}>
            <Eye className="w-4 h-4 mr-1" />
            Ver ejecuciones
          </Button>
        </div>
      </div>

      {/* Mobile view */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onViewExecutions}
              className="w-10 h-10 rounded-xl bg-[#143F3B]/10 dark:bg-[#6B9B7A]/10 hover:bg-[#143F3B]/20 dark:hover:bg-[#6B9B7A]/20"
            >
              <GitBranch className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
            </Button>
            <div className="space-y-0.5">
              <Button
                variant="link"
                onClick={onViewExecutions}
                className="h-auto p-0 font-medium text-stone-900 dark:text-stone-100"
              >
                {workflow.name}
              </Button>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {workflow.educator.name}
              </p>
            </div>
          </div>
          <Badge variant={workflow.isActive ? 'default' : 'secondary'} className="shrink-0">
            {workflow.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ListOrdered className="w-3.5 h-3.5" />
              {workflow.steps.length} pasos
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {workflow.courseWorkflows.length} cursos
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewExecutions}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
