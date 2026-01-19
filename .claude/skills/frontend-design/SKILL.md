---
name: frontend-design
description: Crea interfaces UI para Tinta Academy con Next.js 16, Server Actions, Shadcn UI, react-hook-form y zod. Usa este skill cuando implementes componentes de categoría "ui" o páginas en los paneles admin, educator o student.
---

# Frontend Design para Tinta Academy

Skill para crear interfaces de usuario siguiendo los patrones y convenciones del proyecto.

## Stack Tecnológico

- **Framework**: Next.js 16 + React 19
- **UI Library**: Shadcn UI
- **Forms**: react-hook-form + zod
- **Styling**: Tailwind CSS 4
- **Notifications**: sonner
- **Icons**: lucide-react

## Arquitectura de Capas

```
┌─────────────────────────────────────────┐
│  UI (Client Components)                 │
└─────────────────┬───────────────────────┘
                  │ calls (mutations)
┌─────────────────▼───────────────────────┐
│  Server Actions (actions.ts)            │
│  - Validation (Zod)                     │
│  - Call services for mutations          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│  RSC / Pages (page.tsx)                 │────┐
│  - Can call services directly (reads)   │    │
└─────────────────────────────────────────┘    │ calls
                                               │
┌──────────────────────────────────────────────▼┐
│  Services (src/services/*.ts)                 │
│  - Business logic                             │
│  - Prisma calls                               │
└───────────────────────────────────────────────┘
```

**Reglas clave:**
- Solo services acceden a Prisma directamente
- RSC/Pages llaman services para leer datos
- Server Actions son para mutations (forms, buttons) → llaman services
- Client Components llaman Server Actions para mutations

## Paneles de la Aplicación

| Panel | Ruta | Usuario | Descripción |
|-------|------|---------|-------------|
| Admin | `/admin/*` | superadmin | Gestión global, usuarios, cursos, órdenes |
| Educator | `/educator/*` | educator | Gestión de cursos propios, estudiantes |
| Student | `/student/*` | student | Portal de aprendizaje, mis cursos |
| Public | `/(public)/*` | anónimo | Landing, catálogo público |

## Patrones de Código

### 1. ActionResult Type

Todas las server actions retornan este tipo:

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

### 2. Server Actions con Autenticación

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// Helper de autenticación reutilizable
async function requireEducator(): Promise<{ error: string } | { educatorId: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "No autenticado" }
  }
  if (session.user.role !== "educator") {
    return { error: "Acceso denegado" }
  }
  return { educatorId: session.user.id }
}

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  subject: z.string().min(1, "El asunto es requerido"),
})

export async function createTemplateAction(
  data: z.input<typeof schema>
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireEducator()
  if ("error" in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const validated = schema.parse(data)

    // Llamar al service para la lógica de negocio
    const result = await createTemplate({
      ...validated,
      educatorId: authResult.educatorId,
    })

    revalidatePath("/educator/templates")
    return { success: true, data: { id: result.id } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error("Error creating template:", error)
    return { success: false, error: "Error al crear la plantilla" }
  }
}
```

### 3. Formularios con react-hook-form + Zod

```typescript
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTemplateAction } from "./actions"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  subject: z.string().min(1, "El asunto es requerido").max(200),
})

type FormData = z.infer<typeof formSchema>

interface Props {
  defaultValues?: Partial<FormData>
  onSuccess?: () => void
}

export function TemplateForm({ defaultValues, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      ...defaultValues,
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    const result = await createTemplateAction(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Plantilla creada correctamente")
      reset()
      onSuccess?.()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Nombre de la plantilla"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Asunto</Label>
        <Input
          id="subject"
          {...register("subject")}
          placeholder="Asunto del email"
        />
        {errors.subject && (
          <p className="text-sm text-destructive">{errors.subject.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar
      </Button>
    </form>
  )
}
```

### 4. Diálogos con Formularios

```typescript
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function CreateTemplateDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva plantilla
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear plantilla</DialogTitle>
          <DialogDescription>
            Completa los campos para crear una nueva plantilla de email.
          </DialogDescription>
        </DialogHeader>
        <TemplateForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
```

### 5. Confirmación de Acciones Destructivas

```typescript
"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { deleteTemplateAction } from "./actions"

interface Props {
  templateId: string
  templateName: string
}

export function DeleteTemplateButton({ templateId, templateName }: Props) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTemplateAction(templateId)
    setIsDeleting(false)

    if (result.success) {
      toast.success("Plantilla eliminada")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar plantilla</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de eliminar "{templateName}"? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### 6. Tablas con Shadcn Table

**IMPORTANTE**: El nombre/campo principal debe ser un link clickeable a editar (además del menú ⋯).

```typescript
import Link from "next/link"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"

interface Template { id: string; name: string; subject: string; createdAt: Date }

export function TemplatesTable({ templates }: { templates: Template[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Asunto</TableHead>
          <TableHead>Creada</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.id}>
            {/* Nombre como link a editar - acceso rápido */}
            <TableCell>
              <Link
                href={`/educator/templates/${template.id}/edit`}
                className="font-medium hover:underline"
              >
                {template.name}
              </Link>
            </TableCell>
            <TableCell>{template.subject}</TableCell>
            <TableCell>{template.createdAt.toLocaleDateString("es")}</TableCell>
            {/* Menú ⋯ con todas las acciones */}
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/educator/templates/${template.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### 7. Páginas RSC con Data Fetching

```typescript
// app/educator/templates/page.tsx
import { getTemplates } from "@/services/email-template-service"
import { requireEducatorSession } from "@/lib/auth"
import { TemplatesTable } from "./components/templates-table"
import { CreateTemplateDialog } from "./components/create-template-dialog"

export default async function TemplatesPage() {
  const session = await requireEducatorSession()
  const templates = await getTemplates(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plantillas de Email</h1>
          <p className="text-muted-foreground">
            Gestiona tus plantillas para comunicaciones
          </p>
        </div>
        <CreateTemplateDialog />
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay plantillas todavía</p>
        </div>
      ) : (
        <TemplatesTable templates={templates} />
      )}
    </div>
  )
}
```

### 8. Skeletons para Estados de Carga

```typescript
import { Skeleton } from "@/components/ui/skeleton"

export function TemplatesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="border rounded-lg">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 9. Páginas con Suspense

```typescript
import { Suspense } from "react"
import { TemplatesTableSkeleton } from "./components/templates-skeleton"

async function TemplatesContent() {
  const session = await requireEducatorSession()
  const templates = await getTemplates(session.user.id)
  return <TemplatesTable templates={templates} />
}

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Plantillas de Email</h1>
        <CreateTemplateDialog />
      </div>
      <Suspense fallback={<TemplatesTableSkeleton />}>
        <TemplatesContent />
      </Suspense>
    </div>
  )
}
```

## Componentes UI Disponibles

### Shadcn UI (en src/components/ui/)
- **Inputs**: Button, Input, Textarea, Select, Switch
- **Feedback**: Badge, Skeleton, Toast (sonner)
- **Overlay**: Dialog, AlertDialog, Sheet, Popover, Tooltip, DropdownMenu
- **Data Display**: Card, Table, Avatar, Calendar
- **Layout**: ScrollArea, Accordion

### Componentes Compartidos (en src/components/shared/)
- `ImageUpload` - Subida de imágenes
- `SearchFilterBar` - Barra de búsqueda y filtros
- `FiltersPanel` - Panel de filtros

## Colores Semánticos

```typescript
// Texto
text-foreground        // Principal
text-muted-foreground  // Secundario

// Fondos
bg-background          // Fondo principal
bg-card                // Fondo de cards
bg-muted               // Fondo secundario

// Estados
text-destructive       // Error/eliminar
bg-destructive         // Botón destructivo

// Bordes
border                 // Borde por defecto
border-input           // Borde de inputs
```

## Checklist de UI

Antes de entregar código UI, verificar:

- [ ] Componente marcado como `"use client"` si tiene interactividad
- [ ] Usa componentes Shadcn UI, NO elementos HTML nativos
- [ ] **Tablas**: campo principal es link a editar (+ menú ⋯)
- [ ] Formularios con validación Zod
- [ ] Estados de loading con `isSubmitting` y `Loader2`
- [ ] Toast notifications para feedback (sonner)
- [ ] Manejo de errores con `toast.error()`
- [ ] ActionResult type para server actions
- [ ] Accesibilidad: Labels en inputs
- [ ] Textos en español
- [ ] Usa colores semánticos de Tailwind (no colores hardcodeados)
