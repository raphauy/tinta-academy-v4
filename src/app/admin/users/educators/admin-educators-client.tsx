'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { EducatorWithStats, EducatorStats, CreateEducatorInput, UpdateEducatorAsAdminInput } from '@/services/educator-service'
import type { UserWithDetails } from '@/services/user-service'
import { AdminEducators } from '@/components/admin/admin-educators'
import { EducatorDetailDialog } from '@/components/admin/educator-detail-dialog'
import { CreateEducatorDialog } from '@/components/admin/create-educator-dialog'
import { ConfirmationDialog } from '@/components/admin/confirmation-dialog'
import {
  updateEducatorAction,
  createEducatorAction,
  deleteEducatorAction,
  getEligibleEducatorUsersAction,
} from './actions'

interface AdminEducatorsClientProps {
  educators: EducatorWithStats[]
  stats: EducatorStats
}

export function AdminEducatorsClient({ educators, stats }: AdminEducatorsClientProps) {
  const router = useRouter()

  // Detail dialog state
  const [selectedEducator, setSelectedEducator] = useState<EducatorWithStats | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view')
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Create dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [eligibleUsers, setEligibleUsers] = useState<UserWithDetails[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  // Delete dialog state
  const [educatorToDelete, setEducatorToDelete] = useState<EducatorWithStats | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleView = (educatorId: string) => {
    const educator = educators.find((e) => e.id === educatorId)
    if (educator) {
      setSelectedEducator(educator)
      setDialogMode('view')
      setIsDetailDialogOpen(true)
    }
  }

  const handleEdit = (educatorId: string) => {
    const educator = educators.find((e) => e.id === educatorId)
    if (educator) {
      setSelectedEducator(educator)
      setDialogMode('edit')
      setIsDetailDialogOpen(true)
    }
  }

  const handleDelete = (educatorId: string) => {
    const educator = educators.find((e) => e.id === educatorId)
    if (educator) {
      setEducatorToDelete(educator)
      setIsDeleteDialogOpen(true)
    }
  }

  const handleCreate = async () => {
    setIsCreateDialogOpen(true)
    setIsLoadingUsers(true)

    const result = await getEligibleEducatorUsersAction()

    if (result.success) {
      setEligibleUsers(result.data)
    } else {
      toast.error(result.error)
    }

    setIsLoadingUsers(false)
  }

  const handleSaveEdit = async (data: UpdateEducatorAsAdminInput) => {
    if (!selectedEducator) return

    const result = await updateEducatorAction(selectedEducator.id, data)

    if (result.success) {
      toast.success('Educador actualizado correctamente')
      setIsDetailDialogOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleSaveCreate = async (data: CreateEducatorInput) => {
    const result = await createEducatorAction(data)

    if (result.success) {
      toast.success('Educador creado correctamente')
      setIsCreateDialogOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleConfirmDelete = async () => {
    if (!educatorToDelete) return

    const result = await deleteEducatorAction(educatorToDelete.id)

    if (result.success) {
      toast.success('Educador eliminado correctamente')
      router.refresh()
    } else {
      toast.error(result.error)
      throw new Error(result.error) // Re-throw to keep dialog open
    }
  }

  return (
    <>
      <AdminEducators
        educators={educators}
        stats={stats}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <EducatorDetailDialog
        educator={selectedEducator}
        mode={dialogMode}
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        onEdit={() => setDialogMode('edit')}
        onSave={handleSaveEdit}
      />

      <CreateEducatorDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={handleSaveCreate}
        eligibleUsers={eligibleUsers}
        isLoadingUsers={isLoadingUsers}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) setEducatorToDelete(null)
        }}
        type="delete"
        title="Eliminar educador"
        description={
          educatorToDelete
            ? `¿Estas seguro de eliminar a ${educatorToDelete.name}? ${
                educatorToDelete.coursesCount > 0
                  ? `Este educador tiene ${educatorToDelete.coursesCount} curso(s) asociado(s).`
                  : 'Esta accion no se puede deshacer.'
              }`
            : ''
        }
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
