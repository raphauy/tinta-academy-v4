'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CourseWorkflowCard } from './course-workflow-card'
import { AddWorkflowDialog } from './add-workflow-dialog'
import { Mail, Workflow } from 'lucide-react'
import type { CourseWorkflowStatus, WorkflowTriggerType } from '@prisma/client'

interface Step {
  id: string
  order: number
  triggerType: WorkflowTriggerType
  triggerOffset: number
  triggerClassIndex: number | null
  template: {
    id: string
    name: string
    subject: string
  }
}

interface CourseWorkflow {
  id: string
  status: CourseWorkflowStatus
  createdAt: Date
  workflowTemplate: {
    id: string
    name: string
    description: string | null
    steps: Step[]
  }
  _count: {
    executions: number
  }
}

interface CourseWorkflowsSectionProps {
  courseId: string
  courseName: string
  enrolledCount: number
  courseWorkflows: CourseWorkflow[]
}

export function CourseWorkflowsSection({
  courseId,
  courseName,
  enrolledCount,
  courseWorkflows,
}: CourseWorkflowsSectionProps) {
  const assignedWorkflowIds = courseWorkflows.map(
    (cw) => cw.workflowTemplate.id
  )

  const activeCount = courseWorkflows.filter((cw) => cw.status === 'active').length
  const totalExecutions = courseWorkflows.reduce(
    (sum, cw) => sum + cw._count.executions,
    0
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Workflows automáticos
            </CardTitle>
            <CardDescription>
              Emails que se envían automáticamente según las fechas del curso
            </CardDescription>
          </div>
          <AddWorkflowDialog
            courseId={courseId}
            courseName={courseName}
            enrolledCount={enrolledCount}
            assignedWorkflowIds={assignedWorkflowIds}
          />
        </div>
      </CardHeader>
      <CardContent>
        {courseWorkflows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Sin workflows asignados</p>
            <p className="text-sm">
              Agrega un workflow para enviar emails automáticos a los estudiantes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pb-2 border-b">
              <span>
                {activeCount} workflow{activeCount !== 1 ? 's' : ''} activo
                {activeCount !== 1 ? 's' : ''}
              </span>
              <span>
                {totalExecutions} email{totalExecutions !== 1 ? 's' : ''}{' '}
                programado{totalExecutions !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Workflow Cards */}
            <div className="space-y-3">
              {courseWorkflows.map((courseWorkflow) => (
                <CourseWorkflowCard
                  key={courseWorkflow.id}
                  courseWorkflow={courseWorkflow}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
