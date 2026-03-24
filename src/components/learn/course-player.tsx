'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Lock,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getPlaybackTokenAction,
  saveProgressAction,
  toggleLessonCompleteAction,
} from '@/app/learn/actions'
import { PlayerSidebar } from './player-sidebar'
import { DiscussionTab } from './discussion-tab'

const MuxPlayer = dynamic(
  () => import('@mux/mux-player-react').then((mod) => mod.default),
  { ssr: false }
)

export interface PlayerModule {
  id: string
  title: string
  order: number
  lessons: PlayerLesson[]
}

export interface PlayerLesson {
  id: string
  title: string
  slug: string
  videoDuration: number | null
  videoStatus: string
  isFree: boolean
  order: number
  moduleId: string
}

export interface PlayerMaterial {
  id: string
  name: string
  url: string
  type: string
}

export interface CurrentLesson {
  id: string
  title: string
  slug: string
  summary: string | null
  videoDuration: number | null
  videoStatus: string
  muxPlaybackId: string | null
  isFree: boolean
  moduleId: string
  materials: PlayerMaterial[]
}

interface CoursePlayerProps {
  courseSlug: string
  courseId: string
  courseTitle: string
  modules: PlayerModule[]
  currentLessonSlug: string
  currentLesson: CurrentLesson
  isEnrolled: boolean
  isPreview?: boolean
  totalLessons: number
  completedLessonIds: string[]
  currentUserId: string
  viewAsStudentId?: string | null
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function CoursePlayer({
  courseSlug,
  courseId,
  courseTitle,
  modules,
  currentLessonSlug,
  currentLesson,
  isEnrolled,
  isPreview,
  totalLessons,
  completedLessonIds: initialCompletedIds,
  currentUserId,
  viewAsStudentId,
}: CoursePlayerProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'summary' | 'discussion' | 'transcripts'>('summary')
  const [playbackToken, setPlaybackToken] = useState<string | null>(null)
  const [tokenForPlaybackId, setTokenForPlaybackId] = useState<string | null>(null)

  // Progress tracking
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(initialCompletedIds)
  )
  const isCurrentLessonCompleted = completedIds.has(currentLesson.id)
  const completedLessons = completedIds.size
  const lastSavedTimeRef = useRef(0)

  // Sync completedIds when server data changes (navigation)
  useEffect(() => {
    setCompletedIds(new Set(initialCompletedIds))
  }, [initialCompletedIds])

  // Handle video time update — debounced save every 15 seconds
  const handleTimeUpdate = useCallback(
    (e: Event) => {
      const player = e.target as HTMLMediaElement & { currentTime?: number }
      const currentTime = player?.currentTime
      if (typeof currentTime !== 'number' || isPreview) return

      // Only save every 15 seconds of video progress
      if (Math.abs(currentTime - lastSavedTimeRef.current) < 15) return
      lastSavedTimeRef.current = currentTime

      saveProgressAction(
        currentLesson.id,
        currentTime,
        currentLesson.videoDuration
      ).then((result) => {
        if (result.success && result.data?.completed) {
          setCompletedIds((prev) => new Set([...prev, currentLesson.id]))
        }
      })
    },
    [currentLesson.id, currentLesson.videoDuration, isPreview]
  )

  // Toggle completion manually
  const handleToggleComplete = useCallback(async () => {
    if (isPreview) return
    const result = await toggleLessonCompleteAction(currentLesson.id)
    if (result.success && result.data) {
      setCompletedIds((prev) => {
        const next = new Set(prev)
        if (result.data!.completed) {
          next.add(currentLesson.id)
        } else {
          next.delete(currentLesson.id)
        }
        return next
      })
    }
  }, [currentLesson.id, isPreview])

  // Find current module
  const currentModule = useMemo(
    () => modules.find((m) => m.id === currentLesson.moduleId),
    [modules, currentLesson.moduleId]
  )

  // Check if current lesson is accessible
  const hasAccessToCurrentLesson = isEnrolled || currentLesson.isFree

  // Build flat list for prev/next navigation
  const allLessons = useMemo(
    () => modules.flatMap((m) => m.lessons),
    [modules]
  )

  const currentIndex = useMemo(
    () => allLessons.findIndex((l) => l.slug === currentLessonSlug),
    [allLessons, currentLessonSlug]
  )

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  // Fetch playback token when lesson has a video ready
  useEffect(() => {
    if (
      currentLesson.videoStatus === 'ready' &&
      currentLesson.muxPlaybackId
    ) {
      const playbackId = currentLesson.muxPlaybackId
      setPlaybackToken(null)
      setTokenForPlaybackId(null)

      getPlaybackTokenAction(playbackId).then((result) => {
        if (result.success && result.data) {
          setPlaybackToken(result.data.token)
          setTokenForPlaybackId(playbackId)
        }
      })
    } else {
      setPlaybackToken(null)
      setTokenForPlaybackId(null)
    }
  }, [currentLesson.id, currentLesson.videoStatus, currentLesson.muxPlaybackId])

  const viewAsParam = viewAsStudentId ? `?viewAs=${viewAsStudentId}` : ''

  const navigateTo = useCallback(
    (lesson: PlayerLesson) => {
      router.push(`/learn/${courseSlug}/${lesson.slug}${viewAsParam}`)
    },
    [router, courseSlug, viewAsParam]
  )


  // Dropdown states
  const [moduleDropdownOpen, setModuleDropdownOpen] = useState(false)
  const [lessonDropdownOpen, setLessonDropdownOpen] = useState(false)
  const moduleDropdownRef = useRef<HTMLDivElement>(null)
  const lessonDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    if (!moduleDropdownOpen && !lessonDropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (moduleDropdownOpen && moduleDropdownRef.current && !moduleDropdownRef.current.contains(e.target as Node)) {
        setModuleDropdownOpen(false)
      }
      if (lessonDropdownOpen && lessonDropdownRef.current && !lessonDropdownRef.current.contains(e.target as Node)) {
        setLessonDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [moduleDropdownOpen, lessonDropdownOpen])



  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop: fixed, mobile: drawer overlay */}
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <PlayerSidebar
          courseSlug={courseSlug}
          courseTitle={courseTitle}
          modules={modules}
          currentLessonSlug={currentLessonSlug}
          isEnrolled={isEnrolled}
          isPreview={isPreview}
          totalLessons={totalLessons}
          completedLessonIds={completedIds}
          completedLessons={completedLessons}
          viewAsStudentId={viewAsStudentId}
          onLessonClick={() => {}}
        />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative h-full w-[300px] animate-in slide-in-from-left duration-200">
            <PlayerSidebar
              courseSlug={courseSlug}
              courseTitle={courseTitle}
              modules={modules}
              currentLessonSlug={currentLessonSlug}
              isEnrolled={isEnrolled}
              isPreview={isPreview}
              totalLessons={totalLessons}
              completedLessonIds={completedIds}
          completedLessons={completedLessons}
          viewAsStudentId={viewAsStudentId}
              onLessonClick={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content area */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
        {/* Header */}
        <div className="border-b bg-card px-6 py-4">
          {/* Row 1: Title + Mark as complete */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="mt-0.5 shrink-0 cursor-pointer rounded-md p-1 hover:bg-accent lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold">{currentLesson.title}</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {currentLesson.videoDuration
                    ? formatDuration(currentLesson.videoDuration)
                    : ''}
                </p>
              </div>
            </div>
            {hasAccessToCurrentLesson && !isPreview && (
              <Button
                variant={isCurrentLessonCompleted ? 'default' : 'outline'}
                size="sm"
                className="shrink-0 gap-2"
                onClick={handleToggleComplete}
              >
                {isCurrentLessonCompleted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Completada
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4" />
                    Marcar como completada
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Row 2: Breadcrumb dropdowns (hidden on mobile) */}
          <div className="mt-3 hidden items-center gap-3 lg:flex">
            {/* Breadcrumb: Module dropdown > Lesson dropdown */}
            <div className="flex shrink-0 items-center gap-1">
              {/* Module dropdown */}
              <div className="relative" ref={moduleDropdownRef}>
                <button
                  onClick={() => {
                    setModuleDropdownOpen((p) => !p)
                    setLessonDropdownOpen(false)
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <span className="max-w-[280px] truncate">{currentModule?.title}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moduleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {moduleDropdownOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-[260px] rounded-lg border bg-card py-1 shadow-lg">
                    {modules.map((mod) => {
                      const isActiveMod = mod.id === currentLesson.moduleId
                      return (
                        <button
                          key={mod.id}
                          onClick={() => {
                            const firstLesson = mod.lessons[0]
                            if (firstLesson) navigateTo(firstLesson)
                            setModuleDropdownOpen(false)
                          }}
                          className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                            isActiveMod
                              ? 'bg-verde-uva-50 font-medium text-verde-uva-700 dark:bg-verde-uva-900/30 dark:text-verde-uva-300'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate">{mod.title}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {mod.lessons.length}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <ChevronRight className="mx-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

              {/* Lesson dropdown */}
              <div className="relative" ref={lessonDropdownRef}>
                <button
                  onClick={() => {
                    setLessonDropdownOpen((p) => !p)
                    setModuleDropdownOpen(false)
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent"
                >
                  <span className="max-w-[320px] truncate">{currentLesson.title}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${lessonDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {lessonDropdownOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-[70vh] w-[320px] overflow-y-auto rounded-lg border bg-card shadow-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                    {modules.map((mod) => (
                      <div key={mod.id}>
                        {/* Module header */}
                        <div className="sticky top-0 z-10 border-b bg-card px-3 py-2 text-xs font-semibold text-verde-uva-600 dark:text-verde-uva-400">
                          {mod.title}
                        </div>
                        {/* Lessons */}
                        {mod.lessons.map((lesson) => {
                          const isActive = lesson.slug === currentLessonSlug
                          const hasAccess = isEnrolled || lesson.isFree
                          const isCompleted = completedIds.has(lesson.id)

                          return (
                            <button
                              key={lesson.id}
                              disabled={!hasAccess}
                              onClick={() => {
                                if (hasAccess) {
                                  navigateTo(lesson)
                                  setLessonDropdownOpen(false)
                                }
                              }}
                              className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                                isActive
                                  ? 'bg-verde-uva-50 text-verde-uva-700 dark:bg-verde-uva-900/30 dark:text-verde-uva-300'
                                  : hasAccess
                                    ? 'hover:bg-accent'
                                    : 'cursor-not-allowed opacity-50'
                              }`}
                            >
                              <span className="shrink-0">
                                {!hasAccess ? (
                                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : isCompleted ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-verde-uva-500" />
                                ) : isActive ? (
                                  <Circle className="h-3.5 w-3.5 fill-verde-uva-500 text-verde-uva-500" />
                                ) : (
                                  <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </span>
                              <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                              {lesson.videoDuration && (
                                <span className="shrink-0 text-xs text-muted-foreground">
                                  {formatDuration(lesson.videoDuration)}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Video */}
        <div className="bg-black">
          {!hasAccessToCurrentLesson ? (
            /* Locked lesson overlay */
            <div className="relative mx-auto flex aspect-video max-w-5xl items-center justify-center bg-gris-tinta-900">
              <div className="text-center">
                <Lock className="mx-auto h-12 w-12 text-white/30" />
                <p className="mt-4 text-lg font-medium text-white/80">
                  Esta lección requiere acceso al curso
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Adquiere el curso para desbloquear todo el contenido
                </p>
                <Button asChild className="mt-6" size="lg">
                  <Link href={`/checkout/${courseId}`}>
                    Acceder al curso
                  </Link>
                </Button>
              </div>
            </div>
          ) : currentLesson.videoStatus === 'ready' &&
            currentLesson.muxPlaybackId &&
            playbackToken &&
            tokenForPlaybackId === currentLesson.muxPlaybackId ? (
            <div className="mx-auto max-w-5xl">
              <MuxPlayer
                key={currentLesson.muxPlaybackId}
                playbackId={currentLesson.muxPlaybackId}
                tokens={{ playback: playbackToken }}
                accentColor="#37635E"
                style={{ aspectRatio: '16/9', width: '100%' }}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>
          ) : currentLesson.videoStatus === 'processing' ? (
            <div className="mx-auto flex aspect-video max-w-5xl items-center justify-center text-white/60">
              <p>El video se está procesando...</p>
            </div>
          ) : (
            <div className="mx-auto flex aspect-video max-w-5xl items-center justify-center text-white/40">
              <p>Sin video disponible</p>
            </div>
          )}
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between border-b px-6 py-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            disabled={!prevLesson}
            onClick={() => prevLesson && navigateTo(prevLesson)}
          >
            <ChevronLeft className="h-4 w-4" />
            Lección anterior
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            disabled={!nextLesson}
            onClick={() => nextLesson && navigateTo(nextLesson)}
          >
            Siguiente lección
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs — only when lesson is accessible */}
        <div className={`flex-1 px-6 py-6 ${!hasAccessToCurrentLesson ? 'pointer-events-none opacity-40' : ''}`}>
          <div className="border-b">
            <div className="flex gap-6">
              {(['summary', 'discussion', 'transcripts'] as const).map((tab) => {
                const labels = {
                  summary: 'Resumen',
                  discussion: 'Discusión',
                  transcripts: 'Transcripción',
                }
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer border-b-2 pb-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'border-verde-uva-500 text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab: Summary */}
          {activeTab === 'summary' && (
            <div className="mt-6">
              {currentLesson.summary ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3"
                  dangerouslySetInnerHTML={{ __html: currentLesson.summary }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Esta lección no tiene contenido de resumen.
                </p>
              )}

              {currentLesson.materials.length > 0 && (
                <div className="mt-8">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    📎 Materiales
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {currentLesson.materials.map((m) => (
                      <a
                        key={m.id}
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent"
                      >
                        📄 {m.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Discussion */}
          {activeTab === 'discussion' && (
            <div className="mt-6">
              <DiscussionTab
                lessonId={currentLesson.id}
                currentUserId={currentUserId}
              />
            </div>
          )}

          {/* Tab: Transcripts */}
          {activeTab === 'transcripts' && (
            <div className="mt-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Esta funcionalidad estará disponible próximamente.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
