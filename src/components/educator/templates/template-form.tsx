"use client"

import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import TemplateEditor, { type TemplateEditorRef } from "./template-editor"
import { VariableInserter } from "./variable-inserter"
import { TemplatePreview } from "./template-preview"

const templateFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  subject: z.string().min(1, "El asunto es requerido"),
  body: z.string().min(1, "El contenido es requerido"),
})

type TemplateFormData = z.infer<typeof templateFormSchema>

interface TemplateFormProps {
  defaultValues?: Partial<TemplateFormData>
  onSubmit: (data: TemplateFormData) => Promise<void>
  isLoading?: boolean
}

export function TemplateForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: TemplateFormProps) {
  const subjectInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<TemplateEditorRef>(null)
  const [bodyContent, setBodyContent] = useState(defaultValues?.body ?? "")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      subject: "",
      body: "",
      ...defaultValues,
    },
  })

  const watchedSubject = watch("subject")
  const watchedBody = watch("body")

  const handleSubjectVariableInsert = (variable: string) => {
    const input = subjectInputRef.current
    if (!input) return

    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? input.value.length
    const currentValue = input.value

    const newValue =
      currentValue.substring(0, start) + variable + currentValue.substring(end)

    setValue("subject", newValue, { shouldValidate: true })

    // Restore cursor position after the inserted variable
    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  }

  const handleBodyVariableInsert = (variable: string) => {
    // Insert variable at cursor position in the editor
    if (editorRef.current) {
      editorRef.current.insertAtCursor(variable)
    }
  }

  const handleBodyChange = (html: string) => {
    setBodyContent(html)
    setValue("body", html, { shouldValidate: true })
  }

  const onFormSubmit = async (data: TemplateFormData) => {
    await onSubmit(data)
  }

  // Get the subject ref from register while keeping our ref
  const { ref: registerRef, ...subjectRegister } = register("subject")

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form fields - left column */}
        <div className="space-y-4">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la plantilla</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ej: Bienvenida al curso"
              className="bg-background"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Subject field with variable inserter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="subject">Asunto del email</Label>
              <VariableInserter onInsert={handleSubjectVariableInsert} />
            </div>
            <Input
              id="subject"
              {...subjectRegister}
              ref={(e) => {
                registerRef(e)
                ;(subjectInputRef as React.MutableRefObject<HTMLInputElement | null>).current = e
              }}
              placeholder="Ej: Bienvenido a {{courseName}}"
              className="bg-background"
            />
            {errors.subject && (
              <p className="text-sm text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Body field with variable inserter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Contenido del email</Label>
              <VariableInserter onInsert={handleBodyVariableInsert} />
            </div>
            <TemplateEditor
              ref={editorRef}
              content={bodyContent}
              onChange={handleBodyChange}
              placeholder="Escribe el contenido del email..."
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>

          {/* Submit button */}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar plantilla
          </Button>
        </div>

        {/* Preview - right column */}
        <div className="lg:sticky lg:top-4">
          <TemplatePreview subject={watchedSubject} body={watchedBody} />
        </div>
      </div>
    </form>
  )
}
