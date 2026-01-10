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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Mail,
  Calendar,
  BookOpen,
  Users,
  Edit,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/shared/image-upload'
import type { EducatorWithStats, UpdateEducatorAsAdminInput } from '@/services/educator-service'

interface EducatorDetailDialogProps {
  educator: EducatorWithStats | null
  mode: 'view' | 'edit'
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onSave: (data: UpdateEducatorAsAdminInput) => Promise<void>
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function EducatorDetailDialog({
  educator,
  mode,
  isOpen,
  onClose,
  onEdit,
  onSave,
}: EducatorDetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateEducatorAsAdminInput>({})
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  // Reset state when educator changes or dialog opens/closes
  useEffect(() => {
    if (educator && isOpen) {
      setImageUrl(educator.imageUrl || null)
      setFormData({})
      setImgError(false)
    }
  }, [educator, isOpen])

  if (!educator) return null

  const initials = getInitials(educator.name)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      setFormData({})
      setImgError(false)
    }
  }

  const handleInputChange = (field: keyof UpdateEducatorAsAdminInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || undefined,
    }))
  }

  const handleImageChange = (url: string | null) => {
    setImageUrl(url)
    setFormData((prev) => ({
      ...prev,
      imageUrl: url || undefined,
    }))
  }

  const handleImageError = (error: string) => {
    toast.error(error)
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
            {educator.imageUrl && !imgError ? (
              <img
                src={educator.imageUrl}
                alt={educator.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#143F3B] to-[#1e5a54] flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
            )}
            <div>
              <DialogTitle>{educator.name}</DialogTitle>
              <DialogDescription>
                {educator.title || 'Educador'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {mode === 'view' ? (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#143F3B]/10 dark:bg-[#143F3B]/20 border border-[#143F3B]/20 dark:border-[#143F3B]/30 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#143F3B] dark:text-[#6B9B7A]" />
                  <span className="text-xl font-bold text-[#143F3B] dark:text-[#6B9B7A]">
                    {educator.coursesCount}
                  </span>
                </div>
                <p className="text-xs text-[#143F3B]/70 dark:text-[#6B9B7A]/70 mt-0.5">
                  Cursos
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {educator.studentsCount}
                  </span>
                </div>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">
                  Alumnos
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-stone-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500 dark:text-stone-400">Email</p>
                  <a
                    href={`mailto:${educator.user.email}`}
                    className="font-medium text-stone-900 dark:text-stone-100 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] transition-colors"
                  >
                    {educator.user.email}
                  </a>
                </div>
              </div>

              {educator.bio && (
                <div className="pt-2">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Bio</p>
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                    {educator.bio}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-stone-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500 dark:text-stone-400">Miembro desde</p>
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    {formatDate(educator.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Foto de perfil</Label>
              <div className="flex justify-center">
                <div className="w-24 h-24">
                  <ImageUpload
                    value={imageUrl ?? undefined}
                    onChange={handleImageChange}
                    onError={handleImageError}
                    aspectRatio="square"
                    className="rounded-full"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                defaultValue={educator.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titulo profesional</Label>
              <Input
                id="title"
                defaultValue={educator.title || ''}
                placeholder="Ej: Sommelier certificado, Enologa"
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                defaultValue={educator.bio || ''}
                placeholder="Breve descripcion profesional..."
                rows={4}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600"
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
