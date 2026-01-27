import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getTemplatesByEducator } from '@/services/email-template-service'
import { Button } from '@/components/ui/button'
import { CreateWorkflowClient } from './create-workflow-client'

export const metadata = {
  title: 'Crear Workflow | Tinta Academy',
}

export default async function CreateWorkflowPage() {
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

  // Get templates for the form
  const templates = await getTemplatesByEducator(educator.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/educator/workflows">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Crear Workflow</h1>
          <p className="text-muted-foreground">
            Define cuándo se enviarán los emails automáticamente
          </p>
        </div>
      </div>

      <CreateWorkflowClient
        templates={templates.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  )
}
