'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { toast } from 'sonner'
import { cn, generateSlug } from '@/lib/utils'
import {
  updateLessonAction,
  getVideoUploadUrlAction,
  getPlaybackTokenAction,
  createLessonMaterialAction,
  deleteLessonMaterialAction,
} from '@/app/educator/courses/[id]/modules/actions'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  FileText,
  Wand2,
  Upload,
  Loader2,
  AlertCircle,
  Video,
  ImageIcon,
  Link2,
  Trash2,
  Plus,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react'

const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), { ssr: false })
const MuxUploader = dynamic(
  () => import('@mux/mux-uploader-react').then((m) => m.default),
  { ssr: false }
)

// ============================================
// TYPES
// ============================================

type LessonMaterial = {
  id: string
  lessonId: string
  name: string
  url: string
  type: string
  order: number
}

type LessonData = {
  id: string
  moduleId: string
  title: string
  slug: string
  summary: string | null
  order: number
  videoDuration: number | null
  videoStatus: 'pending' | 'uploading' | 'processing' | 'ready' | 'errored'
  isFree: boolean
  muxPlaybackId: string | null
  materials: LessonMaterial[]
}

interface LessonEditorProps {
  courseId: string
  lesson: LessonData | null
  onSaved: () => void
  className?: string
}

// ============================================
// HELPERS
// ============================================

const VIDEO_STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendiente', variant: 'secondary' },
  uploading: { label: 'Subiendo', variant: 'outline' },
  processing: { label: 'Procesando', variant: 'outline' },
  ready: { label: 'Listo', variant: 'default' },
  errored: { label: 'Error', variant: 'destructive' },
}

function getMaterialIcon(type: string) {
  switch (type) {
    case 'image':
      return <ImageIcon className="h-4 w-4" />
    case 'link':
      return <Link2 className="h-4 w-4" />
    case 'video':
      return <Video className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

// ============================================
// COMPONENT
// ============================================

export default function LessonEditor({ courseId, lesson, onSaved, className }: LessonEditorProps) {
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Video state
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [playbackToken, setPlaybackToken] = useState<string | null>(null)
  const [tokenForPlaybackId, setTokenForPlaybackId] = useState<string | null>(null)

  // Material form state
  const [isAddingMaterial, setIsAddingMaterial] = useState(false)
  const [materialName, setMaterialName] = useState('')
  const [materialUrl, setMaterialUrl] = useState('')
  const [materialType, setMaterialType] = useState('document')

  // Reset form state when lesson changes
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title)
      setSlug(lesson.slug)
      setSummary(lesson.summary || '')
      setIsFree(lesson.isFree)
      setIsAddingMaterial(false)
      setMaterialName('')
      setMaterialUrl('')
      setMaterialType('document')
    }
  }, [lesson?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle video state — runs when lesson changes OR videoStatus changes
  useEffect(() => {
    if (!lesson) return

    setUploadUrl(null)
    setPlaybackToken(null)
    setTokenForPlaybackId(null)

    if (lesson.videoStatus === 'ready' && lesson.muxPlaybackId) {
      const pid = lesson.muxPlaybackId
      getPlaybackTokenAction(pid).then((result) => {
        if (result.success && result.data) {
          setPlaybackToken(result.data.token)
          setTokenForPlaybackId(pid)
        }
      })
    } else if (lesson.videoStatus === 'pending' || lesson.videoStatus === 'uploading' || lesson.videoStatus === 'errored') {
      getVideoUploadUrlAction(courseId, lesson.id).then((result) => {
        if (result.success && result.data) {
          setUploadUrl(result.data.uploadUrl)
        }
      })
    }
  }, [lesson?.id, lesson?.videoStatus, courseId]) // eslint-disable-line react-hooks/exhaustive-deps

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
    ],
    content: summary,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'min-h-[300px] p-3 focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:my-2 [&_a]:text-primary [&_a]:underline',
      },
    },
    onUpdate: ({ editor }) => {
      setSummary(editor.getHTML())
    },
  })

  // Update editor content when lesson changes
  useEffect(() => {
    if (editor && lesson) {
      const currentContent = editor.getHTML()
      const newContent = lesson.summary || ''
      if (currentContent !== newContent) {
        editor.commands.setContent(newContent)
      }
    }
  }, [lesson?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL del enlace:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  // Dirty detection
  const isDirty =
    lesson !== null &&
    (title !== lesson.title ||
      slug !== lesson.slug ||
      summary !== (lesson.summary || '') ||
      isFree !== lesson.isFree)

  // Save handler
  const handleSave = async () => {
    if (!lesson) return
    setIsSaving(true)
    const result = await updateLessonAction(courseId, lesson.id, {
      title,
      slug,
      summary,
      isFree,
    })
    if (result.success) {
      toast.success('Lección guardada')
      onSaved()
    } else {
      toast.error(result.error)
    }
    setIsSaving(false)
  }

  // Video upload handler
  const handleUploadVideo = async () => {
    if (!lesson) return
    const result = await getVideoUploadUrlAction(courseId, lesson.id)
    if (result.success && result.data) {
      setUploadUrl(result.data.uploadUrl)
    } else {
      toast.error('Error al obtener URL de subida')
    }
  }

  // Material handlers
  const handleAddMaterial = async () => {
    if (!lesson || !materialName.trim() || !materialUrl.trim()) return
    const result = await createLessonMaterialAction(courseId, lesson.id, {
      name: materialName.trim(),
      url: materialUrl.trim(),
      type: materialType,
    })
    if (result.success) {
      toast.success('Material agregado')
      setMaterialName('')
      setMaterialUrl('')
      setMaterialType('document')
      setIsAddingMaterial(false)
      router.refresh()
      onSaved()
    } else {
      toast.error(result.error)
    }
  }

  const handleDeleteMaterial = async (materialId: string, materialName: string) => {
    if (!confirm(`¿Eliminar el material "${materialName}"?`)) return
    const result = await deleteLessonMaterialAction(courseId, materialId)
    if (result.success) {
      toast.success('Material eliminado')
      router.refresh()
      onSaved()
    } else {
      toast.error(result.error)
    }
  }

  // ============================================
  // EMPTY STATE
  // ============================================

  if (!lesson) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full text-muted-foreground', className)}>
        <FileText className="h-12 w-12 mb-4" />
        <p className="text-lg">Seleccioná una lección para editarla</p>
      </div>
    )
  }

  // ============================================
  // LESSON EDITOR
  // ============================================

  const statusInfo = VIDEO_STATUS_LABELS[lesson.videoStatus] || VIDEO_STATUS_LABELS.pending

  return (
    <div className={cn('overflow-y-auto p-6 space-y-6', className)}>
      {/* 1. Title + Slug */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="lesson-title">Título</Label>
          <Input
            id="lesson-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la lección"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="lesson-slug">Slug</Label>
          <div className="flex gap-2">
            <Input
              id="lesson-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="slug-de-la-leccion"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setSlug(generateSlug(title))}
              title="Generar slug"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Video Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Video</CardTitle>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </CardHeader>
        <CardContent>
          {lesson.videoStatus === 'ready' && lesson.muxPlaybackId && !uploadUrl ? (
            /* Video ready — show player with signed token */
            <div className="space-y-3">
              {playbackToken && tokenForPlaybackId === lesson.muxPlaybackId ? (
                <MuxPlayer
                  key={lesson.muxPlaybackId}
                  playbackId={lesson.muxPlaybackId}
                  tokens={{ playback: playbackToken }}
                  streamType="on-demand"
                  accentColor="#37635E"
                  className="w-full aspect-video rounded-md"
                />
              ) : (
                <div className="flex items-center justify-center aspect-video rounded-md bg-muted">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleUploadVideo}>
                Cambiar Video
              </Button>
            </div>
          ) : lesson.videoStatus === 'processing' && !uploadUrl ? (
            /* Processing on Mux side */
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Procesando video...</span>
            </div>
          ) : uploadUrl ? (
            /* MuxUploader ready — show drop zone */
            <div className="rounded-lg border-2 border-dashed border-border p-4">
              <MuxUploader
                endpoint={uploadUrl}
                className="w-full"
                onSuccess={() => {
                  // Video uploaded to Mux — wait a few seconds for webhooks to process, then refresh
                  toast.success('Video subido. Procesando...')
                  setUploadUrl(null)
                  setTimeout(() => {
                    router.refresh()
                    onSaved()
                  }, 5000)
                }}
              />
            </div>
          ) : (
            /* Loading upload URL */
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Preparando...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Summary (TipTap Editor) */}
      <div className="space-y-2">
        <Label>Contenido / Resumen</Label>
        <div className="border rounded-md overflow-hidden bg-background">
          <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={cn(editor?.isActive('bold') && 'bg-muted')}
              title="Negrita"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={cn(editor?.isActive('italic') && 'bg-muted')}
              title="Cursiva"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={cn(editor?.isActive('bulletList') && 'bg-muted')}
              title="Lista con viñetas"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={cn(editor?.isActive('orderedList') && 'bg-muted')}
              title="Lista numerada"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={setLink}
              className={cn(editor?.isActive('link') && 'bg-muted')}
              title="Insertar enlace"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            {editor?.isActive('link') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().unsetLink().run()}
                title="Quitar enlace"
              >
                <Unlink className="h-4 w-4" />
              </Button>
            )}
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* 4. Materials Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>Materiales</Label>
          <Badge variant="secondary">{lesson.materials.length}</Badge>
        </div>

        {lesson.materials.length > 0 && (
          <div className="space-y-2">
            {lesson.materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center gap-3 p-2 border rounded-md"
              >
                {getMaterialIcon(material.type)}
                <span className="flex-1 text-sm truncate">{material.name}</span>
                <Badge variant="outline" className="text-xs">
                  {material.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteMaterial(material.id, material.name)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isAddingMaterial ? (
          <div className="space-y-3 p-3 border rounded-md bg-muted/30">
            <div className="space-y-2">
              <Input
                placeholder="Nombre"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
              />
              <Input
                placeholder="URL"
                value={materialUrl}
                onChange={(e) => setMaterialUrl(e.target.value)}
              />
              <Select value={materialType} onValueChange={setMaterialType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Documento</SelectItem>
                  <SelectItem value="link">Enlace</SelectItem>
                  <SelectItem value="image">Imagen</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddMaterial}>
                Agregar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingMaterial(false)
                  setMaterialName('')
                  setMaterialUrl('')
                  setMaterialType('document')
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingMaterial(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Material
          </Button>
        )}
      </div>

      {/* 5. Bottom Bar */}
      <div className="flex items-center justify-between border-t pt-4 mt-4">
        <div className="flex items-center gap-2">
          <Switch
            id="is-free"
            checked={isFree}
            onCheckedChange={setIsFree}
          />
          <Label htmlFor="is-free">Lección gratuita</Label>
        </div>
        <Button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
