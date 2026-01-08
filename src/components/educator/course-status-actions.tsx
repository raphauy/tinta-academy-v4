'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  publishCourseAction,
  unpublishCourseAction,
} from '@/app/educator/actions'
import type { CourseStatus } from '@prisma/client'

interface CourseStatusActionsProps {
  courseId: string
  status: CourseStatus
}

const statusConfig: Record<
  CourseStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  announced: { label: 'Anunciado', variant: 'default' },
  enrolling: { label: 'Inscripciones Abiertas', variant: 'default' },
  full: { label: 'Cupo Lleno', variant: 'destructive' },
  in_progress: { label: 'En Curso', variant: 'default' },
  finished: { label: 'Finalizado', variant: 'outline' },
  available: { label: 'Disponible', variant: 'default' },
}

// Status values that are considered "published" (visible to public)
const publishedStatuses: CourseStatus[] = [
  'announced',
  'enrolling',
  'full',
  'in_progress',
  'available',
]

export function CourseStatusActions({
  courseId,
  status,
}: CourseStatusActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handlePublish = () => {
    startTransition(async () => {
      const result = await publishCourseAction(courseId)
      if (result.success) {
        toast.success('Curso publicado', {
          description: 'El curso ahora es visible para el público.',
        })
        router.refresh()
      } else {
        toast.error('Error al publicar', {
          description: result.error,
        })
      }
    })
  }

  const handleUnpublish = () => {
    startTransition(async () => {
      const result = await unpublishCourseAction(courseId)
      if (result.success) {
        toast.success('Curso despublicado', {
          description: 'El curso ha vuelto a estado borrador.',
        })
        router.refresh()
      } else {
        toast.error('Error al despublicar', {
          description: result.error,
        })
      }
    })
  }

  const config = statusConfig[status]
  const isPublished = publishedStatuses.includes(status)
  const canPublish = status === 'draft'
  const canUnpublish = isPublished

  return (
    <div className="flex items-center gap-3">
      <Badge variant={config.variant}>{config.label}</Badge>

      {canPublish && (
        <Button
          onClick={handlePublish}
          disabled={isPending}
          size="sm"
          className="gap-2"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Eye className="size-4" />
          )}
          Publicar
        </Button>
      )}

      {canUnpublish && (
        <Button
          onClick={handleUnpublish}
          disabled={isPending}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <EyeOff className="size-4" />
          )}
          Despublicar
        </Button>
      )}
    </div>
  )
}
