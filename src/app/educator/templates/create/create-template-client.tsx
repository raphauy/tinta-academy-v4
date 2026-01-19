"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { TemplateForm } from "@/components/educator/templates/template-form"
import { createTemplateAction } from "../actions"

export function CreateTemplateClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: {
    name: string
    subject: string
    body: string
  }) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("subject", data.subject)
      formData.append("body", data.body)

      const result = await createTemplateAction(formData)

      if (result.success) {
        toast.success("Plantilla creada correctamente")
        router.push("/educator/templates")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al crear la plantilla")
    } finally {
      setIsLoading(false)
    }
  }

  return <TemplateForm onSubmit={handleSubmit} isLoading={isLoading} />
}
