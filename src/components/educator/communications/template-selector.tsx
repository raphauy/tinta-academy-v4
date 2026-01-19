'use client'

import { useMemo } from 'react'
import { FileText } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TemplatePreview } from '../templates/template-preview'

export interface TemplateForSelection {
  id: string
  name: string
  subject: string
  body: string
}

interface TemplateSelectorProps {
  templates: TemplateForSelection[]
  value: string | null
  onChange: (templateId: string | null) => void
}

export function TemplateSelector({
  templates,
  value,
  onChange,
}: TemplateSelectorProps) {
  // Find the selected template
  const selectedTemplate = useMemo(() => {
    if (!value) return null
    return templates.find((t) => t.id === value) || null
  }, [templates, value])

  const handleValueChange = (newValue: string) => {
    onChange(newValue || null)
  }

  return (
    <div className="space-y-4">
      <Select value={value || ''} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full max-w-md">
          <SelectValue placeholder="Seleccionar plantilla..." />
        </SelectTrigger>
        <SelectContent>
          {templates.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No hay plantillas disponibles
            </div>
          ) : (
            templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {template.name}
                </span>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Preview section */}
      {selectedTemplate ? (
        <TemplatePreview
          subject={selectedTemplate.subject}
          body={selectedTemplate.body}
        />
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Selecciona una plantilla para ver la vista previa
          </p>
        </div>
      )}
    </div>
  )
}
