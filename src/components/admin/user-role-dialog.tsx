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
  GraduationCap,
  BookOpen,
  User as UserIcon,
} from 'lucide-react'
import type { UserWithDetails } from '@/services/user-service'

type Role = 'superadmin' | 'educator' | 'student' | 'user'

interface UserRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithDetails | null
  onSubmit: (userId: string, role: Role) => Promise<void>
}

const roleConfig: Record<
  Role,
  { label: string; description: string; icon: typeof Shield }
> = {
  superadmin: {
    label: 'Administrador',
    description: 'Acceso total a la plataforma',
    icon: Shield,
  },
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
  user: {
    label: 'Usuario',
    description: 'Usuario sin rol especial',
    icon: UserIcon,
  },
}

export function UserRoleDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserRoleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>('user')

  useEffect(() => {
    if (user) {
      setSelectedRole((user.role as Role) || 'user')
    }
  }, [user, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await onSubmit(user.id, selectedRole)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const displayName = user.name || user.email.split('@')[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
          <DialogDescription>
            Modifica el rol de <strong>{displayName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Nuevo rol</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as Role)}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(roleConfig) as Role[]).map((role) => {
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
