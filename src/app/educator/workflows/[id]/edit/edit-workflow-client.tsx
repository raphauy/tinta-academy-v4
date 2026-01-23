'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { WorkflowForm } from '@/components/educator/workflows/workflow-form'
import { updateWorkflowAction } from '../../actions'
import type { CreateWorkflowFormData } from '@/lib/validations/workflow'
import type { WorkflowTriggerType } from '@prisma/client'

interface EditWorkflowClientProps {
  workflowId: string
  defaultValues: {
    name: string
    description?: string
    sendAtHour: number
    sendAtMinute: number
    sendAtTimezone: string
    steps: {
      templateId: string
      triggerType: WorkflowTriggerType
      triggerOffset: number
      triggerClassIndex?: number
      order: number
      templateName?: string
    }[]
  }
  templates: { id: string; name: string }[]
}

export function EditWorkflowClient({
  workflowId,
  defaultValues,
  templates,
}: EditWorkflowClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CreateWorkflowFormData) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('description', data.description || '')
      formData.append('sendAtHour', data.sendAtHour.toString())
      formData.append('sendAtMinute', data.sendAtMinute.toString())
      formData.append('sendAtTimezone', data.sendAtTimezone)
      formData.append('steps', JSON.stringify(data.steps))

      const result = await updateWorkflowAction(workflowId, formData)

      if (result.success) {
        toast.success('Workflow actualizado correctamente')
        router.push('/educator/workflows')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error al actualizar el workflow')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <WorkflowForm
      defaultValues={defaultValues}
      templates={templates}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitLabel="Guardar cambios"
    />
  )
}
