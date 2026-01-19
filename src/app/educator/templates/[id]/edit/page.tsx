import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { getTemplateById } from "@/services/email-template-service"
import { getEducatorByUserId } from "@/services/educator-service"
import { EditTemplateClient } from "./edit-template-client"

interface EditTemplatePageProps {
  params: Promise<{ id: string }>
}

export default async function EditTemplatePage({
  params,
}: EditTemplatePageProps) {
  const { id } = await params

  const session = await auth()

  if (!session?.user?.id) {
    notFound()
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    notFound()
  }

  const template = await getTemplateById(id, educator.id)

  if (!template) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/educator/templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Plantilla</h1>
          <p className="text-muted-foreground">{template.name}</p>
        </div>
      </div>

      <EditTemplateClient
        templateId={template.id}
        defaultValues={{
          name: template.name,
          subject: template.subject,
          body: template.body,
        }}
      />
    </div>
  )
}
