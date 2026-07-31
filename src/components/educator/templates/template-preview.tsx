"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  renderTemplate,
  type TemplateVariables,
} from "@/lib/email/template-variables"
import {
  emailContentTypography,
  prepareEmailContentHtml,
} from "@/lib/email/email-content-html"
import { emailTheme } from "@/components/emails/email-theme"

// Sample data for preview - uses example values from AVAILABLE_VARIABLES
const SAMPLE_VARIABLES: TemplateVariables = {
  studentName: "María García",
  studentFirstName: "María",
  studentEmail: "maria@example.com",
  courseName: "WSET Nivel 1 en Vinos",
  courseStartDate: "15 de marzo de 2025",
  courseEndDate: "20 de marzo de 2025",
  examDate: "20 de marzo de 2025",
  educatorName: "Gabriela Zimmer",
  courseUrl: "https://academy.tinta.wine/student/courses/abc123",
}

// Placeholder values when no course is selected
export const NO_COURSE_VARIABLES: TemplateVariables = {
  studentName: "María García",
  studentFirstName: "María",
  studentEmail: "maria@example.com",
  courseName: "[Sin curso]",
  courseStartDate: "[Sin fecha]",
  courseEndDate: "[Sin fecha]",
  examDate: "[Sin fecha]",
  educatorName: "Gabriela Zimmer",
  courseUrl: "[Sin URL]",
}

interface TemplatePreviewProps {
  subject: string
  body: string
  /** Optional custom variables. If not provided, uses sample data */
  variables?: TemplateVariables
}

export function TemplatePreview({ subject, body, variables }: TemplatePreviewProps) {
  const vars = variables || SAMPLE_VARIABLES
  const renderedSubject = renderTemplate(subject, vars)

  // Exactamente el mismo HTML que recibe el destinatario: misma limpieza,
  // mismos estilos inline. Si acá se ve una viñeta, en el email va a haber
  // una viñeta.
  const previewBody = prepareEmailContentHtml(renderTemplate(body, vars))

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Vista previa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subject preview */}
        <div className="rounded-md border bg-background p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Asunto
          </p>
          <p className="text-sm font-medium">
            {renderedSubject || (
              <span className="text-muted-foreground italic">
                Sin asunto
              </span>
            )}
          </p>
        </div>

        {/* Body preview: se muestra con el fondo y la tipografía del email */}
        <div className="rounded-md border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Contenido
          </p>
          {previewBody ? (
            <div
              className="rounded-md p-4"
              style={{
                backgroundColor: emailTheme.colors.background,
                ...emailContentTypography,
              }}
              dangerouslySetInnerHTML={{ __html: previewBody }}
            />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Sin contenido
            </p>
          )}
        </div>

        {/* Sample data notice */}
        <p className="text-xs text-muted-foreground">
          Los datos mostrados son de ejemplo. Las variables se reemplazarán con
          datos reales al enviar.
        </p>
      </CardContent>
    </Card>
  )
}
