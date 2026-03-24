'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle2,
  Circle,
  Lock,
  ArrowLeft,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { PlayerModule } from './course-player'

interface PlayerSidebarProps {
  courseSlug: string
  courseTitle: string
  modules: PlayerModule[]
  currentLessonSlug: string
  isEnrolled: boolean
  isPreview?: boolean
  totalLessons: number
  completedLessonIds: Set<string>
  completedLessons: number
  viewAsStudentId?: string | null
  onLessonClick?: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function PlayerSidebar({
  courseSlug,
  courseTitle,
  modules,
  currentLessonSlug,
  isEnrolled,
  isPreview,
  totalLessons,
  completedLessonIds,
  completedLessons,
  viewAsStudentId,
  onLessonClick,
}: PlayerSidebarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Find which module contains the current lesson and auto-expand it
  const currentModuleId = useMemo(() => {
    for (const mod of modules) {
      if (mod.lessons.some((l) => l.slug === currentLessonSlug)) {
        return mod.id
      }
    }
    return modules[0]?.id
  }, [modules, currentLessonSlug])

  const storageKey = `learn-expanded-${courseSlug}`

  // Always start with current module expanded (matches server render)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(currentModuleId ? [currentModuleId] : [])
  )

  // On mount, restore from sessionStorage (client only)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey)
    if (saved) {
      const parsed = new Set(JSON.parse(saved) as string[])
      if (currentModuleId) parsed.add(currentModuleId)
      setExpandedModules(parsed)
    }
    setHydrated(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- only on mount

  // Persist expanded state to sessionStorage after hydration
  useEffect(() => {
    if (hydrated) {
      sessionStorage.setItem(storageKey, JSON.stringify([...expandedModules]))
    }
  }, [expandedModules, storageKey, hydrated])

  // Filter lessons by search
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules

    const query = searchQuery.toLowerCase()
    return modules
      .map((mod) => ({
        ...mod,
        lessons: mod.lessons.filter((l) =>
          l.title.toLowerCase().includes(query)
        ),
      }))
      .filter((mod) => mod.lessons.length > 0)
  }, [modules, searchQuery])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const canAccessLesson = (lesson: { isFree: boolean }) => {
    return isEnrolled || lesson.isFree
  }

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r bg-card">
      {/* Header: Logo */}
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <Link href="/" className="relative h-8 w-36">
          <Image
            src="/TintaAcademy_Logo_Negro.png"
            alt="Tinta Academy"
            fill
            sizes="144px"
            className="object-contain dark:hidden"
            priority
          />
          <Image
            src="/TintaAcademy_Logo_Blanco.png"
            alt="Tinta Academy"
            fill
            sizes="144px"
            className="hidden object-contain dark:block"
            priority
          />
        </Link>
      </div>

      {/* Progress */}
      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Tu Progreso</span>
          <span className="text-muted-foreground">
            {completedLessons}/{totalLessons}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full border border-border bg-muted">
          <div
            className="h-full rounded-full bg-verde-uva-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="border-b px-5 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar lecciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      {/* Course Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contenido del curso
          </p>
        </div>

        <div className="flex-1 pb-4">
          {filteredModules.map((mod) => {
            const isExpanded = expandedModules.has(mod.id)
            const moduleLessonCount = mod.lessons.length
            const moduleCompletedCount = mod.lessons.filter((l) =>
              completedLessonIds.has(l.id)
            ).length

            return (
              <div key={mod.id}>
                {/* Module header */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="flex w-full cursor-pointer items-center gap-2 px-5 py-2.5 text-left hover:bg-accent/50"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {mod.title}
                  </span>
                  <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted px-1.5 text-xs text-muted-foreground">
                    {moduleCompletedCount}/{moduleLessonCount}
                  </span>
                </button>

                {/* Lessons */}
                {isExpanded && (
                  <div className="pb-1">
                    {mod.lessons.map((lesson) => {
                      const isActive = lesson.slug === currentLessonSlug
                      const hasAccess = canAccessLesson(lesson)
                      const isCompleted = completedLessonIds.has(lesson.id)

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            const viewAsParam = viewAsStudentId ? `?viewAs=${viewAsStudentId}` : ''
                            router.push(
                              `/learn/${courseSlug}/${lesson.slug}${viewAsParam}`
                            )
                            onLessonClick?.()
                          }}
                          className={`group flex w-full cursor-pointer items-start gap-3 border-r-2 py-2.5 pr-5 pl-10 text-left transition-colors ${
                            isActive
                              ? 'border-verde-uva-500 bg-verde-uva-50 dark:bg-verde-uva-900/30'
                              : hasAccess
                                ? 'border-transparent hover:bg-accent/50'
                                : 'border-transparent opacity-60 hover:bg-accent/50'
                          }`}
                        >
                          {/* Status icon */}
                          <div className="mt-0.5 shrink-0">
                            {!hasAccess ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-verde-uva-500" />
                            ) : isActive ? (
                              <Circle className="h-4 w-4 fill-verde-uva-500 text-verde-uva-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          {/* Lesson info */}
                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm ${
                                isActive
                                  ? 'font-medium text-verde-uva-700 dark:text-verde-uva-300'
                                  : 'text-foreground'
                              }`}
                            >
                              {lesson.title}
                            </p>
                            {lesson.videoDuration && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {formatDuration(lesson.videoDuration)}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-5 py-4">
        {isPreview && (
          <div className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            Modo previsualización
          </div>
        )}
        {viewAsStudentId && (
          <div className="mb-3 rounded-md bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            Viendo como alumno
          </div>
        )}
        <Link
          href={
            viewAsStudentId
              ? `/student?viewAs=${viewAsStudentId}`
              : isPreview
                ? '/educator/courses'
                : '/student'
          }
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {viewAsStudentId ? 'Volver al panel del alumno' : isPreview ? 'Volver a mis cursos' : 'Volver a mi panel'}
        </Link>
      </div>
    </aside>
  )
}
