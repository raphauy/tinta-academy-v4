'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Play,
  Search,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Eye,
  BookOpen,
  GitBranch,
  User,
  Calendar,
  Mail,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminMetricCard } from '@/components/admin/admin-metric-card'
import { formatTriggerDescription } from '@/lib/constants/workflow'
import { getCourseWorkflowExecutionsAction } from './actions'
import type {
  CourseWorkflowForAdmin,
  ActiveWorkflowsAdminStats,
  ExecutionWithDetails,
  CourseWorkflowStats,
} from '@/services/workflow-execution-service'

type SortField = 'course' | 'workflow' | 'educator' | 'status' | 'createdAt'
type SortDirection = 'asc' | 'desc'
type StatusFilter = 'all' | 'active' | 'paused' | 'completed'

interface EducatorOption {
  id: string
  name: string
  _count: {
    workflowTemplates: number
  }
}

export interface AdminActiveWorkflowsClientProps {
  courseWorkflows: CourseWorkflowForAdmin[]
  stats: ActiveWorkflowsAdminStats
  educators: EducatorOption[]
}

export function AdminActiveWorkflowsClient({
  courseWorkflows,
  stats,
  educators,
}: AdminActiveWorkflowsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [educatorFilter, setEducatorFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Dialog state
  const [selectedCourseWorkflow, setSelectedCourseWorkflow] = useState<{
    id: string
    courseName: string
    workflowName: string
  } | null>(null)

  const filteredWorkflows = useMemo(() => {
    let result = [...courseWorkflows]

    if (statusFilter !== 'all') {
      result = result.filter((cw) => cw.status === statusFilter)
    }

    if (educatorFilter !== 'all') {
      result = result.filter((cw) => cw.workflowTemplate.educator.id === educatorFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (cw) =>
          cw.course.title.toLowerCase().includes(query) ||
          cw.workflowTemplate.name.toLowerCase().includes(query) ||
          cw.workflowTemplate.educator.name.toLowerCase().includes(query)
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'course':
          comparison = a.course.title.localeCompare(b.course.title)
          break
        case 'workflow':
          comparison = a.workflowTemplate.name.localeCompare(b.workflowTemplate.name)
          break
        case 'educator':
          comparison = a.workflowTemplate.educator.name.localeCompare(
            b.workflowTemplate.educator.name
          )
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [courseWorkflows, searchQuery, statusFilter, educatorFilter, sortField, sortDirection])

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

  const getStatusBadge = (cw: CourseWorkflowForAdmin) => {
    if (cw.status === 'paused') {
      return (
        <Badge variant="secondary">
          <Pause className="w-3 h-3 mr-1" />
          Pausado
        </Badge>
      )
    }
    if (cw.status === 'completed') {
      return (
        <Badge variant="default">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completado
        </Badge>
      )
    }
    if (cw.stats.pending > 0) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">
          <Clock className="w-3 h-3 mr-1" />
          {cw.stats.pending} pendientes
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        Sin actividad
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          Workflows
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Workflows asignados a cursos con su actividad de ejecuciones
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <AdminMetricCard
          label="Activos"
          value={stats.active}
          icon={<Play className="w-4 h-4" />}
          variant="primary"
        />
        <AdminMetricCard
          label="Pausados"
          value={stats.paused}
          icon={<Pause className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Completados"
          value={stats.completed}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Pendientes"
          value={stats.totalPending}
          icon={<Clock className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Enviados"
          value={stats.totalSent}
          icon={<Mail className="w-4 h-4" />}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <Input
            type="text"
            placeholder="Buscar por curso o workflow..."
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
            <SelectItem value="paused">Pausado</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
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
            courseWorkflows.length !== filteredWorkflows.length && (
              <span className="text-stone-400 dark:text-stone-500">
                {' '}de {courseWorkflows.length} totales
              </span>
            )}
        </p>

        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 dark:text-stone-500">
            Ordenar por:
          </span>
          <div className="flex items-center gap-3">
            {renderSortButton('course', 'Curso')}
            {renderSortButton('workflow', 'Workflow')}
            {renderSortButton('educator', 'Educador')}
            {renderSortButton('status', 'Estado')}
            {renderSortButton('createdAt', 'Fecha')}
          </div>
        </div>
      </div>

      {filteredWorkflows.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
            <div className="col-span-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Curso
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Workflow
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Educador
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Estado
            </div>
            <div className="col-span-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-center">
              Progreso
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
              Acciones
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {filteredWorkflows.map((cw) => (
              <CourseWorkflowRow
                key={cw.id}
                courseWorkflow={cw}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                onViewExecutions={() =>
                  setSelectedCourseWorkflow({
                    id: cw.id,
                    courseName: cw.course.title,
                    workflowName: cw.workflowTemplate.name,
                  })
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            Sin resultados
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
            {searchQuery || statusFilter !== 'all' || educatorFilter !== 'all'
              ? 'No se encontraron workflows con los filtros aplicados'
              : 'No hay workflows asignados a cursos'}
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
      <CourseWorkflowExecutionsDialog
        open={selectedCourseWorkflow !== null}
        onOpenChange={(open) => !open && setSelectedCourseWorkflow(null)}
        courseWorkflowId={selectedCourseWorkflow?.id ?? ''}
        courseName={selectedCourseWorkflow?.courseName ?? ''}
        workflowName={selectedCourseWorkflow?.workflowName ?? ''}
      />
    </div>
  )
}

interface CourseWorkflowRowProps {
  courseWorkflow: CourseWorkflowForAdmin
  formatDate: (date: Date) => string
  getStatusBadge: (cw: CourseWorkflowForAdmin) => React.ReactNode
  onViewExecutions: () => void
}

function CourseWorkflowRow({
  courseWorkflow,
  formatDate,
  getStatusBadge,
  onViewExecutions,
}: CourseWorkflowRowProps) {
  const { stats } = courseWorkflow
  const progress = stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0

  return (
    <div className="px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* Desktop view */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
        <div className="col-span-3 space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#143F3B] dark:text-[#6B9B7A]" />
            <span className="font-medium text-stone-900 dark:text-stone-100 truncate">
              {courseWorkflow.course.title}
            </span>
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex items-center gap-1 text-sm text-stone-700 dark:text-stone-300">
            <GitBranch className="w-3.5 h-3.5" />
            <span className="truncate">{courseWorkflow.workflowTemplate.name}</span>
          </div>
        </div>

        <div className="col-span-2">
          <p className="text-sm text-stone-700 dark:text-stone-300 truncate">
            {courseWorkflow.workflowTemplate.educator.name}
          </p>
        </div>

        <div className="col-span-2">
          {getStatusBadge(courseWorkflow)}
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {formatDate(courseWorkflow.createdAt)}
          </p>
        </div>

        <div className="col-span-1 text-center">
          <div className="text-sm font-medium text-stone-700 dark:text-stone-300">
            {stats.sent}/{stats.total}
          </div>
          <div className="text-xs text-stone-500">{progress}%</div>
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
            <div className="w-10 h-10 rounded-xl bg-[#143F3B]/10 dark:bg-[#6B9B7A]/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-stone-900 dark:text-stone-100">
                {courseWorkflow.course.title}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                {courseWorkflow.workflowTemplate.name}
              </p>
            </div>
          </div>
          {getStatusBadge(courseWorkflow)}
        </div>

        <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-4">
            <span>{courseWorkflow.workflowTemplate.educator.name}</span>
            <span>
              {stats.sent}/{stats.total} ({progress}%)
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

// Dialog Component

interface CourseWorkflowExecutionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseWorkflowId: string
  courseName: string
  workflowName: string
}

function CourseWorkflowExecutionsDialog({
  open,
  onOpenChange,
  courseWorkflowId,
  courseName,
  workflowName,
}: CourseWorkflowExecutionsDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg px-6">
        <SheetHeader>
          <SheetTitle>{courseName}</SheetTitle>
          <SheetDescription>
            Ejecuciones del workflow: {workflowName}
          </SheetDescription>
        </SheetHeader>

        {open && (
          <CourseWorkflowExecutionsContent
            key={courseWorkflowId}
            courseWorkflowId={courseWorkflowId}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

interface CourseWorkflowExecutionsContentProps {
  courseWorkflowId: string
}

function CourseWorkflowExecutionsContent({
  courseWorkflowId,
}: CourseWorkflowExecutionsContentProps) {
  const [isPending, startTransition] = useTransition()
  const [data, setData] = useState<{
    pending: ExecutionWithDetails[]
    history: ExecutionWithDetails[]
    stats: CourseWorkflowStats
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    startTransition(async () => {
      const result = await getCourseWorkflowExecutionsAction(courseWorkflowId)
      if (result.success && result.data) {
        setData(result.data)
      } else if (!result.success) {
        setError(result.error)
      }
    })
  }, [courseWorkflowId])

  const formatStudentName = (student: {
    firstName: string | null
    lastName: string | null
  }) => {
    const name = [student.firstName, student.lastName].filter(Boolean).join(' ')
    return name || 'Sin nombre'
  }

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "d 'de' MMMM, HH:mm", { locale: es })
  }

  return (
    <div className="mt-6">
      {/* Stats Summary */}
      {isPending ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-2xl font-bold">{data.stats.pending}</span>
            <span className="text-xs text-muted-foreground">Pendientes</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-2xl font-bold">{data.stats.sent}</span>
            <span className="text-xs text-muted-foreground">Enviados</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <XCircle className="h-5 w-5 text-destructive mb-1" />
            <span className="text-2xl font-bold">{data.stats.failed}</span>
            <span className="text-xs text-muted-foreground">Fallidos</span>
          </div>
        </div>
      ) : null}

      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pending" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Programados
            {data && data.stats.pending > 0 && (
              <Badge variant="secondary" className="ml-1">
                {data.stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Mail className="h-4 w-4" />
            Historial
            {data && data.stats.sent + data.stats.failed > 0 && (
              <Badge variant="secondary" className="ml-1">
                {data.stats.sent + data.stats.failed}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <ScrollArea className="h-[400px] pr-4">
            {isPending ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : data?.pending && data.pending.length > 0 ? (
              <div className="space-y-3">
                {data.pending.map((execution) => (
                  <ExecutionCard
                    key={execution.id}
                    execution={execution}
                    type="pending"
                    formatStudentName={formatStudentName}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={Clock} message="No hay emails programados" />
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ScrollArea className="h-[400px] pr-4">
            {isPending ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : data?.history && data.history.length > 0 ? (
              <div className="space-y-3">
                {data.history.map((execution) => (
                  <ExecutionCard
                    key={execution.id}
                    execution={execution}
                    type="history"
                    formatStudentName={formatStudentName}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={Mail} message="No hay emails enviados" />
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ExecutionCardProps {
  execution: ExecutionWithDetails
  type: 'pending' | 'history'
  formatStudentName: (student: {
    firstName: string | null
    lastName: string | null
  }) => string
  formatDate: (date: Date | string) => string
}

function ExecutionCard({
  execution,
  type,
  formatStudentName,
  formatDate,
}: ExecutionCardProps) {
  const { workflowStep, student } = execution

  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {workflowStep.template.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {formatTriggerDescription(
              workflowStep.triggerType,
              workflowStep.triggerOffset,
              workflowStep.triggerClassIndex
            )}
          </p>
        </div>
        {type === 'history' && (
          <Badge
            variant={
              ['sent', 'delivered', 'opened', 'clicked'].includes(
                execution.status
              )
                ? 'default'
                : 'destructive'
            }
            className="shrink-0"
          >
            {['sent', 'delivered', 'opened', 'clicked'].includes(
              execution.status
            )
              ? 'Enviado'
              : 'Fallido'}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {formatStudentName(student)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {type === 'pending'
            ? formatDate(execution.scheduledAt)
            : execution.sentAt
              ? formatDate(execution.sentAt)
              : formatDate(execution.scheduledAt)}
        </span>
      </div>

      {execution.status === 'failed' && execution.errorMessage && (
        <p className="mt-2 text-xs text-destructive">
          Error: {execution.errorMessage}
        </p>
      )}
    </div>
  )
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  message: string
}

function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Icon className="h-12 w-12 mb-4 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
