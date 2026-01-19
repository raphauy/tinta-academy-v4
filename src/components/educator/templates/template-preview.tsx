"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  renderTemplate,
  type TemplateVariables,
} from "@/lib/email/template-variables"

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

interface TemplatePreviewProps {
  subject: string
  body: string
}

export function TemplatePreview({ subject, body }: TemplatePreviewProps) {
  const renderedSubject = renderTemplate(subject, SAMPLE_VARIABLES)
  const renderedBody = renderTemplate(body, SAMPLE_VARIABLES)

  // Preserve empty paragraphs by adding a non-breaking space
  const preservedBody = renderedBody
    .replace(/<p><\/p>/g, '<p>&nbsp;</p>')
    .replace(/<p><br><\/p>/g, '<p>&nbsp;</p>')
    .replace(/<p><br\/><\/p>/g, '<p>&nbsp;</p>')

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

        {/* Body preview */}
        <div className="rounded-md border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Contenido
          </p>
          {preservedBody ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-0 [&>p]:min-h-[1.5em]"
              dangerouslySetInnerHTML={{ __html: preservedBody }}
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
