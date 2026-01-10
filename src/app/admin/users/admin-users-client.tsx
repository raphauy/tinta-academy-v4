'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { AdminUsers } from '@/components/admin/admin-users'
import { UserRoleDialog } from '@/components/admin/user-role-dialog'
import { ConfirmationDialog } from '@/components/admin/confirmation-dialog'
import { updateUserAction, deleteUserAction, toggleUserStatusAction } from './actions'
import type { UserWithDetails, UserStats } from '@/services/user-service'

interface AdminUsersClientProps {
  users: UserWithDetails[]
  stats: UserStats
}

export function AdminUsersClient({ users, stats }: AdminUsersClientProps) {
  // Edit user state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserWithDetails | null>(null)

  // Toggle status confirmation state
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false)
  const [userToToggle, setUserToToggle] = useState<UserWithDetails | null>(null)

  const handleEditRole = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setEditDialogOpen(true)
    }
  }

  const handleUserSubmit = async (
    userId: string,
    data: { name?: string; role?: 'superadmin' | 'user' }
  ) => {
    const result = await updateUserAction(userId, data)

    if (result.success) {
      toast.success('Usuario actualizado correctamente')
    } else {
      toast.error(result.error)
    }
  }

  const handleDeleteClick = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setUserToDelete(user)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    const result = await deleteUserAction(userToDelete.id)

    if (result.success) {
      toast.success('Usuario eliminado correctamente')
    } else {
      toast.error(result.error)
    }
  }

  const handleToggleStatusClick = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setUserToToggle(user)
      setToggleStatusDialogOpen(true)
    }
  }

  const handleToggleStatusConfirm = async () => {
    if (!userToToggle) return

    const result = await toggleUserStatusAction(userToToggle.id)

    if (result.success) {
      const action = userToToggle.isActive ? 'desactivado' : 'activado'
      toast.success(`Usuario ${action} correctamente`)
    } else {
      toast.error(result.error)
    }
  }

  const deleteDisplayName = userToDelete?.name || userToDelete?.email.split('@')[0] || 'usuario'
  const toggleDisplayName = userToToggle?.name || userToToggle?.email.split('@')[0] || 'usuario'
  const isUserActive = userToToggle?.isActive ?? true

  return (
    <>
      <AdminUsers
        users={users}
        stats={stats}
        onEditRole={handleEditRole}
        onDelete={handleDeleteClick}
        onToggleStatus={handleToggleStatusClick}
      />

      <UserRoleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
        onSubmit={handleUserSubmit}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        type="delete"
        title="Eliminar usuario"
        description={`¿Estas seguro de que deseas eliminar a "${deleteDisplayName}"? Solo se pueden eliminar usuarios sin ordenes. Para usuarios con historial, usa la opcion de Desactivar.`}
        confirmLabel="Eliminar usuario"
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmationDialog
        open={toggleStatusDialogOpen}
        onOpenChange={setToggleStatusDialogOpen}
        type={isUserActive ? 'deactivate' : 'custom'}
        title={isUserActive ? 'Desactivar usuario' : 'Activar usuario'}
        description={
          isUserActive
            ? `¿Estas seguro de que deseas desactivar a "${toggleDisplayName}"? El usuario no podra iniciar sesion pero su historial se mantendra.`
            : `¿Estas seguro de que deseas reactivar a "${toggleDisplayName}"? El usuario podra volver a iniciar sesion.`
        }
        confirmLabel={isUserActive ? 'Desactivar' : 'Activar'}
        onConfirm={handleToggleStatusConfirm}
      />
    </>
  )
}
