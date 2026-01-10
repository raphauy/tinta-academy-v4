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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, UserPlus, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/shared/image-upload'
import type { UserWithDetails } from '@/services/user-service'
import type { CreateEducatorInput } from '@/services/educator-service'

interface CreateEducatorDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateEducatorInput) => Promise<void>
  eligibleUsers: UserWithDetails[]
  isLoadingUsers?: boolean
}

export function CreateEducatorDialog({
  isOpen,
  onClose,
  onSave,
  eligibleUsers,
  isLoadingUsers = false,
}: CreateEducatorDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
  })

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId('')
      setImageUrl(null)
      setFormData({
        name: '',
        title: '',
        bio: '',
      })
    }
  }, [isOpen])

  // When user is selected, pre-fill name from user.name if available
  useEffect(() => {
    if (selectedUserId) {
      const user = eligibleUsers.find((u) => u.id === selectedUserId)
      if (user?.name && !formData.name) {
        setFormData((prev) => ({
          ...prev,
          name: user.name || '',
        }))
      }
    }
  }, [selectedUserId, eligibleUsers, formData.name])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  const handleImageChange = (url: string | null) => {
    setImageUrl(url)
  }

  const handleImageError = (error: string) => {
    toast.error(error)
  }

  const handleSave = async () => {
    if (!selectedUserId || !formData.name.trim()) return

    setLoading(true)
    try {
      await onSave({
        userId: selectedUserId,
        name: formData.name.trim(),
        title: formData.title.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        imageUrl: imageUrl || undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = selectedUserId && formData.name.trim()

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
            Nuevo Educador
          </DialogTitle>
          <DialogDescription>
            Selecciona un usuario existente para promoverlo a educador
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="user">Usuario</Label>
            {isLoadingUsers ? (
              <div className="flex items-center gap-2 py-2 text-stone-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Cargando usuarios...</span>
              </div>
            ) : eligibleUsers.length === 0 ? (
              <div className="flex items-center gap-2 py-3 px-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                  No hay usuarios disponibles para promover a educador
                </span>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span>{user.name || user.email.split('@')[0]}</span>
                        <span className="text-xs text-stone-500">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Solo se muestran usuarios que no son educadores actualmente
            </p>
          </div>

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
            <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
              Haz clic o arrastra una imagen
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre de educador <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre completo"
              className="bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titulo profesional</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Sommelier certificado, Enologa"
              className="bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Breve descripcion profesional..."
              rows={3}
              className="bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !canSubmit}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Crear Educador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
