'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { WorkflowForm } from '@/components/educator/workflows/workflow-form'
import { createWorkflowAction } from '../actions'
import type { CreateWorkflowFormData } from '@/lib/validations/workflow'

interface CreateWorkflowClientProps {
  templates: { id: string; name: string }[]
}

export function CreateWorkflowClient({ templates }: CreateWorkflowClientProps) {
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

      const result = await createWorkflowAction(formData)

      if (result.success) {
        toast.success('Workflow creado correctamente')
        router.push('/educator/workflows')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error al crear el workflow')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <WorkflowForm
      templates={templates}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitLabel="Crear workflow"
    />
  )
}
