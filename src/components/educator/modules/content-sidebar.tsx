'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  createModuleAction,
  updateModuleAction,
  deleteModuleAction,
  reorderModulesAction,
  createLessonAction,
  deleteLessonAction,
  reorderLessonsAction,
} from '@/app/educator/courses/[id]/modules/actions'

export type ModuleWithLessons = {
  id: string
  courseId: string
  title: string
  order: number
  lessons: {
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
    materials: {
      id: string
      lessonId: string
      name: string
      url: string
      type: string
      order: number
    }[]
  }[]
}

interface ContentSidebarProps {
  courseId: string
  modules: ModuleWithLessons[]
  selectedLessonId: string | null
  onSelectLesson: (lessonId: string) => void
  onModulesChange: (modules: ModuleWithLessons[]) => void
  onLessonCreated: (lessonId: string) => void
  onLessonDeleted: (lessonId: string) => void
  className?: string
}

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60)
  return m + ':' + (s % 60).toString().padStart(2, '0')
}

const VIDEO_STATUS_COLORS: Record<ModuleWithLessons['lessons'][number]['videoStatus'], string> = {
  pending: 'bg-gray-400',
  uploading: 'bg-yellow-400',
  processing: 'bg-blue-400',
  ready: 'bg-green-400',
  errored: 'bg-red-400',
}

// ---------------------------------------------------------------------------
// SortableLessonItem
// ---------------------------------------------------------------------------

function SortableLessonItem({
  courseId,
  lesson,
  isSelected,
  onSelect,
  onDeleted,
}: {
  courseId: string
  lesson: ModuleWithLessons['lessons'][number]
  isSelected: boolean
  onSelect: () => void
  onDeleted: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteLessonAction(courseId, lesson.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success('Lección eliminada')
      onDeleted()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors overflow-hidden',
        isSelected
          ? 'bg-primary/10 border-primary border-l-2'
          : 'hover:bg-accent'
      )}
    >
      <button
        className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <button
        className="min-w-0 flex-1 truncate text-left cursor-pointer"
        onClick={onSelect}
      >
        {lesson.title}
      </button>

      <div className="flex items-center gap-1 shrink-0">
        {lesson.videoStatus !== 'pending' && (
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              VIDEO_STATUS_COLORS[lesson.videoStatus]
            )}
            title={lesson.videoStatus}
          />
        )}

        {lesson.videoDuration != null && (
          <span className="text-muted-foreground text-xs">
            {formatDuration(lesson.videoDuration)}
          </span>
        )}

        {lesson.isFree && (
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
            Gratis
          </Badge>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="text-muted-foreground hover:text-destructive cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
              disabled={isDeleting}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar lección</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará la lección &quot;{lesson.title}&quot; y todo su
                contenido. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SortableModule
// ---------------------------------------------------------------------------

function SortableModule({
  courseId,
  mod,
  selectedLessonId,
  onSelectLesson,
  onModuleUpdated,
  onModuleDeleted,
  onLessonCreated,
  onLessonDeleted,
  onLessonsReordered,
}: {
  courseId: string
  mod: ModuleWithLessons
  selectedLessonId: string | null
  onSelectLesson: (lessonId: string) => void
  onModuleUpdated: () => void
  onModuleDeleted: () => void
  onLessonCreated: (lessonId: string) => void
  onLessonDeleted: (lessonId: string) => void
  onLessonsReordered: (moduleId: string, lessons: ModuleWithLessons['lessons']) => void
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(mod.title)
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [isCreatingLesson, setIsCreatingLesson] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: mod.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSaveTitle = async () => {
    const trimmed = title.trim()
    if (!trimmed || trimmed === mod.title) {
      setTitle(mod.title)
      setIsEditingTitle(false)
      return
    }

    const result = await updateModuleAction(courseId, mod.id, trimmed)
    if (result.success) {
      toast.success('Módulo actualizado')
      setIsEditingTitle(false)
      onModuleUpdated()
      router.refresh()
    } else {
      toast.error(result.error)
      setTitle(mod.title)
      setIsEditingTitle(false)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveTitle()
    if (e.key === 'Escape') {
      setTitle(mod.title)
      setIsEditingTitle(false)
    }
  }

  const handleDeleteModule = async () => {
    setIsDeleting(true)
    const result = await deleteModuleAction(courseId, mod.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success('Módulo eliminado')
      onModuleDeleted()
    } else {
      toast.error(result.error)
    }
  }

  const handleCreateLesson = async () => {
    const lessonTitle = newLessonTitle.trim()
    if (!lessonTitle) return

    setIsCreatingLesson(true)
    const result = await createLessonAction(courseId, mod.id, lessonTitle)
    setIsCreatingLesson(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Lección creada')
    setNewLessonTitle('')
    setIsAddingLesson(false)
    if (result.data) {
      onLessonCreated(result.data.id)
    }
    router.refresh()
  }

  const handleLessonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateLesson()
    if (e.key === 'Escape') {
      setIsAddingLesson(false)
      setNewLessonTitle('')
    }
  }

  const handleLessonDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = mod.lessons.findIndex((l) => l.id === active.id)
      const newIndex = mod.lessons.findIndex((l) => l.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(mod.lessons, oldIndex, newIndex)
      onLessonsReordered(mod.id, reordered)

      const result = await reorderLessonsAction(
        courseId,
        mod.id,
        reordered.map((l) => l.id)
      )

      if (!result.success) {
        toast.error('Error al reordenar lecciones')
        onLessonsReordered(mod.id, mod.lessons)
      }
    },
    [mod.lessons, courseId, mod.id, onLessonsReordered]
  )

  const handleLessonDeleted = useCallback(
    (lessonId: string) => {
      onLessonDeleted(lessonId)
      router.refresh()
    },
    [onLessonDeleted, router]
  )

  return (
    <div ref={setNodeRef} style={style}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-1 py-1 overflow-hidden">
          <button
            className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {isEditingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleTitleKeyDown}
              className="h-7 flex-1 min-w-0 text-sm"
              autoFocus
            />
          ) : (
            <CollapsibleTrigger asChild>
              <button className="min-w-0 flex-1 truncate text-left text-sm font-medium cursor-pointer">
                {mod.title}
              </button>
            </CollapsibleTrigger>
          )}

          <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
            {mod.lessons.length}
          </Badge>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </Button>
          </CollapsibleTrigger>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setIsEditingTitle(true)
                }}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Editar nombre
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Eliminar módulo
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar módulo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se eliminará el módulo &quot;{mod.title}&quot; y todas sus
                      lecciones. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteModule}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CollapsibleContent>
          <div className="ml-4 space-y-0.5 overflow-hidden border-l py-1 pl-2">
            {mod.lessons.length === 0 && !isAddingLesson && (
              <p className="text-muted-foreground py-2 text-center text-xs">
                Sin lecciones aún
              </p>
            )}

            <DndContext
              id={`lessons-${mod.id}`}
              collisionDetection={closestCenter}
              onDragEnd={handleLessonDragEnd}
            >
              <SortableContext
                items={mod.lessons.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {mod.lessons.map((lesson) => (
                  <SortableLessonItem
                    key={lesson.id}
                    courseId={courseId}
                    lesson={lesson}
                    isSelected={lesson.id === selectedLessonId}
                    onSelect={() => onSelectLesson(lesson.id)}
                    onDeleted={() => handleLessonDeleted(lesson.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {isAddingLesson ? (
              <div className="flex items-center gap-1.5 pt-1">
                <Input
                  placeholder="Nombre de la lección"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  onKeyDown={handleLessonKeyDown}
                  className="h-7 text-sm"
                  autoFocus
                  disabled={isCreatingLesson}
                />
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleCreateLesson}
                  disabled={isCreatingLesson || !newLessonTitle.trim()}
                >
                  Crear
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    setIsAddingLesson(false)
                    setNewLessonTitle('')
                  }}
                  disabled={isCreatingLesson}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-7 w-full justify-start px-2 text-xs"
                onClick={() => {
                  setIsAddingLesson(true)
                  setIsOpen(true)
                }}
              >
                <Plus className="mr-1 h-3 w-3" />
                Agregar Lección
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ContentSidebar
// ---------------------------------------------------------------------------

export function ContentSidebar({
  courseId,
  modules,
  selectedLessonId,
  onSelectLesson,
  onModulesChange,
  onLessonCreated,
  onLessonDeleted,
  className,
}: ContentSidebarProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateModule = async () => {
    const title = newTitle.trim()
    if (!title) return

    setIsCreating(true)
    const result = await createModuleAction(courseId, title)
    setIsCreating(false)

    if (result.success) {
      toast.success('Módulo creado')
      setNewTitle('')
      setIsAdding(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateModule()
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewTitle('')
    }
  }

  const handleModuleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = modules.findIndex((m) => m.id === active.id)
      const newIndex = modules.findIndex((m) => m.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(modules, oldIndex, newIndex)
      onModulesChange(reordered)

      const result = await reorderModulesAction(
        courseId,
        reordered.map((m) => m.id)
      )

      if (!result.success) {
        toast.error('Error al reordenar módulos')
        onModulesChange(modules)
      }
    },
    [modules, courseId, onModulesChange]
  )

  const handleModuleDeleted = useCallback(
    (moduleId: string) => {
      onModulesChange(modules.filter((m) => m.id !== moduleId))
      router.refresh()
    },
    [modules, onModulesChange, router]
  )

  const handleModuleUpdated = useCallback(() => {
    router.refresh()
  }, [router])

  const handleLessonsReordered = useCallback(
    (moduleId: string, lessons: ModuleWithLessons['lessons']) => {
      onModulesChange(
        modules.map((m) => (m.id === moduleId ? { ...m, lessons } : m))
      )
    },
    [modules, onModulesChange]
  )

  const handleLessonCreated = useCallback(
    (lessonId: string) => {
      onLessonCreated(lessonId)
    },
    [onLessonCreated]
  )

  const handleLessonDeleted = useCallback(
    (lessonId: string) => {
      onLessonDeleted(lessonId)
    },
    [onLessonDeleted]
  )

  return (
    <div className={cn('flex h-full min-w-0 flex-col overflow-hidden', className)}>
      <div className="flex items-center justify-between px-3 py-3">
        <h2 className="text-muted-foreground text-sm font-semibold uppercase">
          Contenido
        </h2>
        {!isAdding && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-2 px-3 pb-3">
          <Input
            placeholder="Nombre del módulo"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
            autoFocus
            disabled={isCreating}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleCreateModule}
              disabled={isCreating || !newTitle.trim()}
            >
              Crear
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => {
                setIsAdding(false)
                setNewTitle('')
              }}
              disabled={isCreating}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
        {modules.length === 0 ? (
          <div className="text-muted-foreground px-4 py-8 text-center text-sm">
            <p>No hay módulos todavía.</p>
            <p className="mt-1 text-xs">
              Agregá un módulo para empezar a organizar el contenido.
            </p>
          </div>
        ) : (
          <DndContext
            id="modules-dnd"
            collisionDetection={closestCenter}
            onDragEnd={handleModuleDragEnd}
          >
            <SortableContext
              items={modules.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1 px-3 pb-4">
                {modules.map((mod) => (
                  <SortableModule
                    key={mod.id}
                    courseId={courseId}
                    mod={mod}
                    selectedLessonId={selectedLessonId}
                    onSelectLesson={onSelectLesson}
                    onModuleUpdated={handleModuleUpdated}
                    onModuleDeleted={() => handleModuleDeleted(mod.id)}
                    onLessonCreated={handleLessonCreated}
                    onLessonDeleted={handleLessonDeleted}
                    onLessonsReordered={handleLessonsReordered}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
