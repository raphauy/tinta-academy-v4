'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Wallet,
  Activity,
  Edit,
  Loader2,
} from 'lucide-react'
import type { StudentWithStats } from '@/services/student-service'
import type { UpdateStudentAsAdminInput } from '@/services/student-service'

interface StudentDetailDialogProps {
  student: StudentWithStats | null
  mode: 'view' | 'edit'
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onSave: (data: UpdateStudentAsAdminInput) => Promise<void>
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getInitials(firstName: string | null, lastName: string | null, email: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

function getDisplayName(firstName: string | null, lastName: string | null, email: string): string {
  if (firstName || lastName) {
    return `${firstName || ''} ${lastName || ''}`.trim()
  }
  return email.split('@')[0]
}

export function StudentDetailDialog({
  student,
  mode,
  isOpen,
  onClose,
  onEdit,
  onSave,
}: StudentDetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateStudentAsAdminInput>({})

  if (!student) return null

  const displayName = getDisplayName(student.firstName, student.lastName, student.user.email)
  const initials = getInitials(student.firstName, student.lastName, student.user.email)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      setFormData({})
    }
  }

  const handleInputChange = (field: keyof UpdateStudentAsAdminInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || undefined,
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {student.user.image ? (
              <img
                src={student.user.image}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#143F3B] dark:bg-[#6B9B7A] flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
            )}
            <div>
              <DialogTitle>{displayName}</DialogTitle>
              <DialogDescription>{student.user.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {mode === 'view' ? (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 text-stone-500 dark:text-stone-400 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  {student.enrollmentsCount}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Inscripciones</p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 text-stone-500 dark:text-stone-400 mb-1">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  {student.completedCourses}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Completados</p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 text-[#143F3B] dark:text-[#6B9B7A] mb-1">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <p className="text-xl font-bold text-[#143F3B] dark:text-[#6B9B7A]">
                  {student.totalSpentUSD > 0 && student.totalSpentUYU > 0
                    ? `${formatNumber(student.totalSpentUSD)} / ${formatNumber(student.totalSpentUYU)}`
                    : student.totalSpentUSD > 0
                      ? `USD ${formatNumber(student.totalSpentUSD)}`
                      : student.totalSpentUYU > 0
                        ? `$ ${formatNumber(student.totalSpentUYU)}`
                        : '-'}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Gastado</p>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-stone-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500 dark:text-stone-400">Nombre completo</p>
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    {student.firstName || '-'} {student.lastName || ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-stone-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500 dark:text-stone-400">Email</p>
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    {student.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-stone-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500 dark:text-stone-400">Telefono</p>
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    {student.phone || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500 dark:text-stone-400">Ubicacion</p>
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    {[student.city, student.country].filter(Boolean).join(', ') || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-stone-400 mt-0.5" />
                <div className="flex-1 flex justify-between">
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Registrado</p>
                    <p className="font-medium text-stone-900 dark:text-stone-100">
                      {formatDate(student.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-500 dark:text-stone-400">Ultima actividad</p>
                    <p className="text-sm text-stone-600 dark:text-stone-300">
                      {student.lastActivityAt ? formatDate(student.lastActivityAt) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  defaultValue={student.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  defaultValue={student.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                defaultValue={student.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  defaultValue={student.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pais</Label>
                <Input
                  id="country"
                  defaultValue={student.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identityDocument">Documento de identidad</Label>
              <Input
                id="identityDocument"
                defaultValue={student.identityDocument || ''}
                onChange={(e) => handleInputChange('identityDocument', e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cerrar
          </Button>
          {mode === 'view' ? (
            <Button onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar cambios
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
