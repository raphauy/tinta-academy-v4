import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getWorkflowById } from '@/services/workflow-template-service'
import { getTemplatesByEducator } from '@/services/email-template-service'
import { Button } from '@/components/ui/button'
import { EditWorkflowClient } from './edit-workflow-client'

export const metadata = {
  title: 'Editar Workflow | Tinta Academy',
}

interface EditWorkflowPageProps {
  params: Promise<{ id: string }>
}

export default async function EditWorkflowPage({
  params,
}: EditWorkflowPageProps) {
  const { id } = await params
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

  const workflow = await getWorkflowById(id, educator.id)

  if (!workflow) {
    notFound()
  }

  // Get templates for the form
  const templates = await getTemplatesByEducator(educator.id)

  // Transform workflow data for the form
  const defaultValues = {
    name: workflow.name,
    description: workflow.description || undefined,
    sendAtHour: workflow.sendAtHour,
    sendAtMinute: workflow.sendAtMinute,
    sendAtTimezone: workflow.sendAtTimezone,
    steps: workflow.steps.map((step) => ({
      id: step.id,
      templateId: step.templateId,
      triggerType: step.triggerType,
      triggerOffset: step.triggerOffset,
      triggerClassIndex: step.triggerClassIndex ?? undefined,
      order: step.order,
      templateName: step.template.name,
    })),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/educator/workflows">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Workflow</h1>
          <p className="text-muted-foreground">{workflow.name}</p>
        </div>
      </div>

      <EditWorkflowClient
        workflowId={id}
        defaultValues={defaultValues}
        templates={templates.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  )
}
