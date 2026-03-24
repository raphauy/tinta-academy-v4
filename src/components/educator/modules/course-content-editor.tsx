'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ContentSidebar, type ModuleWithLessons } from './content-sidebar'
import LessonEditor from './lesson-editor'

interface CourseContentEditorProps {
  courseId: string
  initialModules: ModuleWithLessons[]
}

export function CourseContentEditor({
  courseId,
  initialModules,
}: CourseContentEditorProps) {
  const router = useRouter()
  const [modules, setModules] = useState(initialModules)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)

  // Sync local state when server data changes (after router.refresh())
  useEffect(() => {
    setModules(initialModules)
  }, [initialModules])

  // Derive selected lesson from modules
  const selectedLesson = useMemo(() => {
    if (!selectedLessonId) return null
    for (const mod of modules) {
      const lesson = mod.lessons.find((l) => l.id === selectedLessonId)
      if (lesson) return lesson
    }
    return null
  }, [modules, selectedLessonId])

  const handleSelectLesson = useCallback((lessonId: string) => {
    setSelectedLessonId(lessonId)
  }, [])

  const handleModulesChange = useCallback((newModules: ModuleWithLessons[]) => {
    setModules(newModules)
  }, [])

  const handleLessonCreated = useCallback((lessonId: string) => {
    setSelectedLessonId(lessonId)
    router.refresh()
  }, [router])

  const handleLessonDeleted = useCallback(
    (lessonId: string) => {
      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null)
      }
      router.refresh()
    },
    [selectedLessonId, router]
  )

  const handleSaved = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[320px_1fr] overflow-hidden rounded-lg border bg-background">
      <ContentSidebar
        courseId={courseId}
        modules={modules}
        selectedLessonId={selectedLessonId}
        onSelectLesson={handleSelectLesson}
        onModulesChange={handleModulesChange}
        onLessonCreated={handleLessonCreated}
        onLessonDeleted={handleLessonDeleted}
        className="border-r"
      />
      <LessonEditor
        courseId={courseId}
        lesson={selectedLesson}
        onSaved={handleSaved}
        className="overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
      />
    </div>
  )
}
