import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CreateTemplateClient } from "./create-template-client"

export default function CreateTemplatePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/educator/templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Crear Plantilla</h1>
          <p className="text-muted-foreground">
            Crea una nueva plantilla de email para tus comunicaciones
          </p>
        </div>
      </div>

      <CreateTemplateClient />
    </div>
  )
}
