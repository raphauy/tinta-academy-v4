import { Play, Calendar, MapPin, Wifi, Download, CheckCircle2, Clock, Award, ChevronRight, FileText } from 'lucide-react'
import type { EnrolledCourse, Resource } from '@/../product/sections/student-panel/types'
import { ProgressBar } from './ProgressBar'

interface CourseCardProps {
  course: EnrolledCourse
  onContinueCourse?: (lessonId?: string) => void
  onViewCourseDetails?: () => void
  onDownloadResource?: (resourceId: string) => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getCategoryLabel(category: EnrolledCourse['courseCategory']): string {
  const labels: Record<EnrolledCourse['courseCategory'], string> = {
    wset: 'WSET',
    workshop: 'Taller',
    tasting: 'Cata',
    course: 'Curso'
  }
  return labels[category]
}

function getCategoryColor(category: EnrolledCourse['courseCategory']): string {
  const colors: Record<EnrolledCourse['courseCategory'], string> = {
    wset: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    workshop: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    tasting: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    course: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
  }
  return colors[category]
}

function getStatusBadge(status: EnrolledCourse['status'], examResult?: 'passed' | 'failed' | 'pending') {
  if (status === 'completed') {
    if (examResult === 'passed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <Award className="w-3 h-3" />
          Aprobado
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        <CheckCircle2 className="w-3 h-3" />
        Completado
      </span>
    )
  }
  if (status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        <Play className="w-3 h-3" />
        En progreso
      </span>
    )
  }
  if (status === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
        <Clock className="w-3 h-3" />
        Próximamente
      </span>
    )
  }
  return null
}

function ResourceItem({ resource, onDownload }: { resource: Resource; onDownload?: () => void }) {
  const sizeInMB = (resource.size / 1024 / 1024).toFixed(1)

  return (
    <button
      onClick={onDownload}
      className="flex items-center gap-2 px-3 py-2 text-left rounded-lg bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors group w-full"
    >
      <FileText className="w-4 h-4 text-stone-400 dark:text-stone-500 flex-shrink-0" />
      <span className="flex-1 text-sm text-stone-700 dark:text-stone-300 truncate">
        {resource.title}
      </span>
      <span className="text-xs text-stone-400 dark:text-stone-500">{sizeInMB} MB</span>
      <Download className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

export function CourseCard({
  course,
  onContinueCourse,
  onViewCourseDetails,
  onDownloadResource
}: CourseCardProps) {
  const isOnline = course.courseType === 'online'
  const isInProgress = course.status === 'in_progress'
  const isCompleted = course.status === 'completed'
  const isUpcoming = course.status === 'upcoming'

  const handleMainAction = () => {
    if (isOnline && course.progress?.currentLessonId) {
      onContinueCourse?.(course.progress.currentLessonId)
    } else if (isOnline) {
      onContinueCourse?.()
    } else {
      onViewCourseDetails?.()
    }
  }

  return (
    <div className="group bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:border-stone-300 dark:hover:border-stone-700 transition-all hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-stone-900/50">
      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {/* Category badge */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${getCategoryColor(course.courseCategory)}`}>
            {getCategoryLabel(course.courseCategory)}
          </span>
          {/* Course type badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
            isOnline
              ? 'bg-[#143F3B] text-white'
              : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3" />
                Online
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3" />
                Presencial
              </>
            )}
          </span>
          {/* Status badge - pushed to the right */}
          <div className="flex-1" />
          {getStatusBadge(course.status, course.eventInfo?.examResult)}
        </div>

        {/* Title and educator */}
        <div className="mb-3">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 leading-tight line-clamp-2 group-hover:text-[#143F3B] dark:group-hover:text-[#6B9B7A] transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            con {course.educatorName}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          {isOnline && course.progress ? (
            <>
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5">
                <span>{course.progress.completedLessons} de {course.progress.totalLessons} lecciones</span>
                {course.progress.lastAccessedAt && (
                  <span>Último acceso: {formatDate(course.progress.lastAccessedAt)}</span>
                )}
              </div>
              <ProgressBar percentage={course.progress.percentage} />
            </>
          ) : (
            <ProgressBar
              percentage={isCompleted ? 100 : 0}
              showLabel={false}
            />
          )}
        </div>

        {/* Event info for in-person courses */}
        {!isOnline && course.eventInfo && (
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
              <MapPin className="w-4 h-4 flex-shrink-0 text-stone-400" />
              <span className="truncate">{course.eventInfo.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
              <Calendar className="w-4 h-4 flex-shrink-0 text-stone-400" />
              <span>
                {course.eventInfo.dates.map(d => formatDate(d)).join(' y ')} — {course.eventInfo.schedule}
              </span>
            </div>
          </div>
        )}

        {/* Resources */}
        {course.resources.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
              Material de apoyo
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {course.resources.slice(0, 3).map((resource) => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  onDownload={() => onDownloadResource?.(resource.id)}
                />
              ))}
              {course.resources.length > 3 && (
                <p className="text-xs text-stone-400 dark:text-stone-500 pl-3">
                  +{course.resources.length - 3} más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
          <button
            onClick={handleMainAction}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              isUpcoming
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-default'
                : isOnline && isInProgress
                  ? 'bg-[#143F3B] hover:bg-[#0D2926] text-white shadow-sm hover:shadow-md'
                  : isCompleted
                    ? 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                    : 'bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900'
            }`}
            disabled={isUpcoming}
          >
            {isOnline && isInProgress && (
              <>
                <Play className="w-4 h-4" />
                Continuar curso
              </>
            )}
            {isOnline && isCompleted && (
              <>
                <Play className="w-4 h-4" />
                Repasar curso
              </>
            )}
            {!isOnline && !isUpcoming && (
              <>
                Ver detalles
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            {isUpcoming && (
              <>
                <Clock className="w-4 h-4" />
                Próximamente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
