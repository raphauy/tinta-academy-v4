import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Mail } from "lucide-react"

import { auth } from "@/lib/auth"
import { getEducatorByUserId } from "@/services/educator-service"
import { getTemplatesByEducator } from "@/services/email-template-service"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TemplateActions } from "./components/template-actions"

export const metadata = {
  title: "Plantillas de Email | Tinta Academy",
}

export default async function TemplatesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  if (
    session.user.role !== "educator" &&
    session.user.role !== "superadmin"
  ) {
    redirect("/")
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    redirect("/")
  }

  const templates = await getTemplatesByEducator(educator.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plantillas de Email</h1>
          <p className="text-muted-foreground">
            Gestiona tus plantillas para comunicaciones con estudiantes
          </p>
        </div>
        <Button asChild>
          <Link href="/educator/templates/create">
            <Plus className="mr-2 h-4 w-4" />
            Crear plantilla
          </Link>
        </Button>
      </div>

      {/* Content */}
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Mail className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">
            No hay plantillas todavía
          </h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
            Las plantillas te permiten crear emails reutilizables con variables
            dinámicas para comunicarte con tus estudiantes.
          </p>
          <Button asChild className="mt-4">
            <Link href="/educator/templates/create">
              <Plus className="mr-2 h-4 w-4" />
              Crear tu primera plantilla
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Fecha de creación</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/educator/templates/${template.id}/edit`}
                      className="hover:underline"
                    >
                      {template.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {template.subject}
                  </TableCell>
                  <TableCell>
                    {template.createdAt.toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <TemplateActions
                      templateId={template.id}
                      templateName={template.name}
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
