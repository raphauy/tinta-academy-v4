'use client'

import { useState, useTransition, useRef } from 'react'
import { toast } from 'sonner'
import {
  Loader2,
  Plus,
  Trash2,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  ExternalLink,
  Upload,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ImageUpload } from '@/components/shared/image-upload'
import {
  addMaterialAction,
  deleteMaterialAction,
} from '@/app/educator/actions'
import { uploadFile } from '@/services/upload-service'
import type { CourseMaterial, MaterialType } from '@prisma/client'

interface MaterialsSectionProps {
  courseId: string
  materials: CourseMaterial[]
}

const materialTypeLabels: Record<MaterialType, string> = {
  link: 'Link',
  image: 'Imagen',
  document: 'Documento',
  video: 'Video',
  other: 'Otro',
}

const materialTypeIcons: Record<MaterialType, React.ReactNode> = {
  link: <LinkIcon className="size-4" />,
  image: <ImageIcon className="size-4" />,
  document: <FileText className="size-4" />,
  video: <Video className="size-4" />,
  other: <File className="size-4" />,
}

export function MaterialsSection({
  courseId,
  materials: initialMaterials,
}: MaterialsSectionProps) {
  const [materials, setMaterials] = useState(initialMaterials)
  const [isAdding, setIsAdding] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state for new material
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    type: 'document' as MaterialType,
    url: '',
    description: '',
  })

  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.url) {
      toast.error('Nombre y URL son requeridos')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('courseId', courseId)
      formData.append('name', newMaterial.name)
      formData.append('type', newMaterial.type)
      formData.append('url', newMaterial.url)
      if (newMaterial.description) {
        formData.append('description', newMaterial.description)
      }

      const result = await addMaterialAction(formData)

      if (result.success && result.data) {
        toast.success('Material agregado')
        // Add to local state
        setMaterials([
          ...materials,
          {
            id: result.data.id,
            courseId,
            name: newMaterial.name,
            type: newMaterial.type,
            url: newMaterial.url,
            description: newMaterial.description || null,
            order: materials.length,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ])
        // Reset form
        resetForm()
        setIsAdding(false)
      } else {
        toast.error('error' in result ? result.error : 'Error al agregar material')
      }
    })
  }

  const handleDeleteMaterial = (id: string) => {
    startTransition(async () => {
      const result = await deleteMaterialAction(id)

      if (result.success) {
        toast.success('Material eliminado')
        setMaterials(materials.filter((m) => m.id !== id))
      } else {
        toast.error(result.error || 'Error al eliminar material')
      }
      setDeleteId(null)
    })
  }

  const handleImageUpload = (url: string | null) => {
    if (url) {
      setNewMaterial({ ...newMaterial, url })
    }
  }

  const handleImageError = (error: string) => {
    toast.error(error)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadType = newMaterial.type === 'video' ? 'video' : 'document'
      const result = await uploadFile(formData, uploadType)

      if (result.success) {
        setNewMaterial({ ...newMaterial, url: result.url })
        setUploadedFileName(file.name)
        toast.success('Archivo subido correctamente')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error al subir el archivo')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getAcceptedFileTypes = () => {
    if (newMaterial.type === 'document') {
      return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'
    }
    if (newMaterial.type === 'video') {
      return '.mp4,.webm,.mov,.avi'
    }
    return '*'
  }

  const resetForm = () => {
    setNewMaterial({
      name: '',
      type: 'document',
      url: '',
      description: '',
    })
    setUploadedFileName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Materiales del Curso</span>
          {!isAdding && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="mr-2 size-4" />
              Agregar Material
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* List of existing materials */}
        {materials.length === 0 && !isAdding && (
          <p className="text-center text-muted-foreground py-4">
            No hay materiales agregados. Los materiales estaran disponibles para
            los alumnos inscritos.
          </p>
        )}

        {materials.map((material) => (
          <div
            key={material.id}
            className="flex items-start gap-3 rounded-lg border p-3"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              {materialTypeIcons[material.type]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{material.name}</p>
                <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs">
                  {materialTypeLabels[material.type]}
                </span>
              </div>
              {material.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {material.description}
                </p>
              )}
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Ver recurso
                <ExternalLink className="size-3" />
              </a>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteId(material.id)}
              disabled={isPending}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}

        {/* Add material form */}
        {isAdding && (
          <div className="space-y-4 rounded-lg border border-dashed p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  placeholder="Ej: Guia de estudio"
                  value={newMaterial.name}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={newMaterial.type}
                  onValueChange={(value) => {
                    setNewMaterial({
                      ...newMaterial,
                      type: value as MaterialType,
                      url: '', // Reset URL when type changes
                    })
                    setUploadedFileName(null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Documento</SelectItem>
                    <SelectItem value="image">Imagen</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File/URL input - different based on type */}
            {newMaterial.type === 'image' && (
              <div className="space-y-2">
                <Label>Imagen *</Label>
                <ImageUpload
                  value={newMaterial.url || undefined}
                  onChange={handleImageUpload}
                  onError={handleImageError}
                  aspectRatio="auto"
                  className="max-w-sm"
                />
              </div>
            )}

            {(newMaterial.type === 'document' || newMaterial.type === 'video') && (
              <div className="space-y-2">
                <Label>
                  {newMaterial.type === 'document' ? 'Documento' : 'Video'} *
                </Label>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAcceptedFileTypes()}
                    onChange={handleFileUpload}
                    className="hidden"
                    id="material-file-upload"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="shrink-0"
                    >
                      {isUploading ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 size-4" />
                      )}
                      {isUploading ? 'Subiendo...' : 'Subir archivo'}
                    </Button>
                    {uploadedFileName && (
                      <span className="truncate text-sm text-muted-foreground">
                        {uploadedFileName}
                      </span>
                    )}
                  </div>
                  {newMaterial.url && (
                    <p className="text-xs text-green-600">
                      Archivo subido correctamente
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {newMaterial.type === 'document' &&
                      'Formatos permitidos: PDF, Word, Excel, PowerPoint, texto. Max 10MB.'}
                    {newMaterial.type === 'video' &&
                      'Formatos permitidos: MP4, WebM, MOV, AVI. Max 100MB.'}
                  </p>
                </div>
              </div>
            )}

            {newMaterial.type === 'link' && (
              <div className="space-y-2">
                <Label>URL *</Label>
                <Input
                  type="url"
                  placeholder="https://ejemplo.com/recurso"
                  value={newMaterial.url}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, url: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Link a cualquier recurso web.
                </p>
              </div>
            )}

            {newMaterial.type === 'other' && (
              <div className="space-y-2">
                <Label>URL *</Label>
                <Input
                  type="url"
                  placeholder="https://ejemplo.com/recurso"
                  value={newMaterial.url}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, url: e.target.value })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Descripcion (opcional)</Label>
              <Textarea
                placeholder="Breve descripcion del material..."
                rows={8}
                value={newMaterial.description}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, description: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  resetForm()
                }}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleAddMaterial}
                disabled={isPending || isUploading || !newMaterial.name || !newMaterial.url}
              >
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Agregar
              </Button>
            </div>
          </div>
        )}

        {/* Delete confirmation dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar material</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estas seguro de que deseas eliminar este material? Esta accion
                no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && handleDeleteMaterial(deleteId)}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
