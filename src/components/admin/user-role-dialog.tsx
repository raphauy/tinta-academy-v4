'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Shield,
  User as UserIcon,
  GraduationCap,
  BookOpen,
  Info,
} from 'lucide-react'
import type { UserWithDetails } from '@/services/user-service'

// Only superadmin and user roles can be assigned manually
type AssignableRole = 'superadmin' | 'user'

interface UserRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithDetails | null
  onSubmit: (userId: string, data: { name?: string; role?: AssignableRole }) => Promise<void>
}

const roleConfig = {
  superadmin: {
    label: 'Administrador',
    description: 'Acceso total a la plataforma',
    icon: Shield,
  },
  user: {
    label: 'Usuario',
    description: 'Usuario sin rol especial',
    icon: UserIcon,
  },
}

const readOnlyRoleConfig = {
  educator: {
    label: 'Educador',
    description: 'Puede crear y gestionar cursos',
    icon: GraduationCap,
  },
  student: {
    label: 'Estudiante',
    description: 'Usuario inscrito en cursos',
    icon: BookOpen,
  },
}

export function UserRoleDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserRoleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState<AssignableRole>('user')

  const isEducatorOrStudent = user?.role === 'educator' || user?.role === 'student'

  useEffect(() => {
    if (user && open) {
      setName(user.name || '')
      // Only set role for users that can have their role changed
      if (!isEducatorOrStudent) {
        setSelectedRole(user.role === 'superadmin' ? 'superadmin' : 'user')
      }
    }
  }, [user, open, isEducatorOrStudent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const data: { name?: string; role?: AssignableRole } = {
        name: name.trim() || undefined,
      }
      // Only include role if it can be changed
      if (!isEducatorOrStudent) {
        data.role = selectedRole
      }
      await onSubmit(user.id, data)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const displayName = user.name || user.email.split('@')[0]

  // Get current role config for display
  const currentRoleKey = user.role as keyof typeof readOnlyRoleConfig
  const currentReadOnlyRole = readOnlyRoleConfig[currentRoleKey]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos de <strong>{displayName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del usuario"
              className="bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600"
            />
          </div>

          {isEducatorOrStudent && currentReadOnlyRole ? (
            // Show read-only role info for educators and students
            <div className="space-y-2">
              <Label>Rol</Label>
              <div className="py-3 px-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#143F3B]/10 dark:bg-[#143F3B]/20 flex items-center justify-center">
                    <currentReadOnlyRole.icon className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">
                      {currentReadOnlyRole.label}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {currentReadOnlyRole.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-stone-500 dark:text-stone-400">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <p>
                  El rol de {currentReadOnlyRole.label} no se puede cambiar desde aqui.
                  {user.role === 'educator'
                    ? ' Para quitar el rol, elimina el perfil de educador.'
                    : ' Este rol se asigna automaticamente al comprar un curso.'}
                </p>
              </div>
            </div>
          ) : (
            // Show editable role selector for superadmin and regular users
            <>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as AssignableRole)}
                >
                  <SelectTrigger id="role" className="bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(roleConfig) as AssignableRole[]).map((role) => {
                      const config = roleConfig[role]
                      const RoleIcon = config.icon
                      return (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            <RoleIcon className="w-4 h-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="py-3 px-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                {(() => {
                  const config = roleConfig[selectedRole]
                  const RoleIcon = config.icon
                  return (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#143F3B]/10 dark:bg-[#143F3B]/20 flex items-center justify-center">
                        <RoleIcon className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
                      </div>
                      <div>
                        <p className="font-medium text-stone-900 dark:text-stone-100">
                          {config.label}
                        </p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#143F3B] hover:bg-[#0e2c29] text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
