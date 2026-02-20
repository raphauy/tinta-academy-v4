'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Globe,
  Lock,
  Pencil,
  Trash2,
  Users,
  Mail,
  MoreHorizontal,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteFilterAction } from '@/app/educator/filters/actions'
import type { AudienceFilterWithEducator } from '@/types/audience-filter'

interface FilterCardProps {
  filter: AudienceFilterWithEducator
  currentEducatorId: string
  studentCount?: number | null
  loadingCount?: boolean
  onDeleted?: () => void
}

export function FilterCard({
  filter,
  currentEducatorId,
  studentCount = null,
  loadingCount = false,
  onDeleted,
}: FilterCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = filter.educatorId === currentEducatorId
  const campaignsCount = filter._count?.campaigns || 0

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const result = await deleteFilterAction({ id: filter.id })

      if (result.success) {
        toast.success('Filtro eliminado correctamente')
        onDeleted?.()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error al eliminar el filtro')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Link href={isOwner ? `/educator/filters/${filter.id}/edit` : `/educator/filters/${filter.id}`} className="block h-full">
        <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full flex flex-col">
          <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold leading-none">{filter.name}</h3>
                {filter.isPublic ? (
                  <Badge variant="secondary" className="gap-1">
                    <Globe className="h-3 w-3" />
                    Público
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Privado
                  </Badge>
                )}
              </div>
              {filter.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {filter.description}
                </p>
              )}
            </div>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/educator/filters/${filter.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault()
                      setShowDeleteDialog(true)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {loadingCount ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <span>{studentCount} estudiantes</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>
                {campaignsCount}{' '}
                {campaignsCount === 1 ? 'campaña' : 'campañas'}
              </span>
            </div>
            {!isOwner && (
              <span className="text-xs">
                Por: {filter.educator.name}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Creado{' '}
            {formatDistanceToNow(new Date(filter.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        </CardContent>
        </Card>
      </Link>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar filtro</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar el filtro &quot;{filter.name}&quot;?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
