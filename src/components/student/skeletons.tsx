/**
 * Skeleton components for student pages
 * Used within Suspense boundaries for loading states
 */

/**
 * StudentDashboardSkeleton - Loading skeleton for student dashboard
 */
export function StudentDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-40 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-10 w-36 bg-muted rounded" />
      </div>

      {/* Metrics skeleton - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <MetricCardSkeleton key={i} highlight={i === 1} />
        ))}
      </div>

      {/* Recent courses section */}
      <div>
        <div className="h-5 w-40 bg-muted rounded mb-3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <CourseQuickCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * MetricCardSkeleton - Loading skeleton for a metric card
 */
function MetricCardSkeleton({ highlight = false }: { highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl p-4 ${
        highlight
          ? 'bg-verde-uva-600'
          : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div
            className={`h-3 w-20 rounded mb-2 ${
              highlight ? 'bg-verde-uva-400' : 'bg-muted'
            } animate-pulse`}
          />
          <div
            className={`h-8 w-16 rounded ${
              highlight ? 'bg-verde-uva-400' : 'bg-muted'
            } animate-pulse`}
          />
        </div>
        <div
          className={`w-9 h-9 rounded-lg ${
            highlight ? 'bg-verde-uva-400' : 'bg-muted'
          } animate-pulse`}
        />
      </div>
    </div>
  )
}

/**
 * CourseQuickCardSkeleton - Loading skeleton for quick course card
 */
function CourseQuickCardSkeleton() {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 bg-muted rounded-lg animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-2" />
          <div className="h-3 w-1/2 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/**
 * StudentCourseListSkeleton - Loading skeleton for student course list
 */
export function StudentCourseListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-32 bg-muted rounded mb-2" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="h-10 w-36 bg-muted rounded" />
      </div>

      {/* Filter chips skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-24 bg-muted rounded-full" />
        ))}
      </div>

      {/* Course list skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <StudentCourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * StudentCourseCardSkeleton - Loading skeleton for a student course card
 */
function StudentCourseCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image */}
        <div className="w-full sm:w-48 h-32 bg-muted rounded-xl animate-pulse flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
            <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-muted rounded-full animate-pulse ml-auto" />
          </div>

          {/* Title */}
          <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />

          {/* Educator */}
          <div className="h-4 w-40 bg-muted rounded animate-pulse mb-2" />

          {/* Tags */}
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
            <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
          </div>

          {/* Meta info */}
          <div className="flex gap-4">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-end">
          <div className="h-10 w-28 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/**
 * StudentCourseDetailSkeleton - Loading skeleton for course detail page
 */
export function StudentCourseDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-10 w-32 bg-muted rounded" />

      {/* Hero header skeleton */}
      <div className="relative aspect-[21/9] w-full bg-muted rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          {/* Badges */}
          <div className="flex gap-2 mb-3">
            <div className="h-6 w-20 bg-white/20 rounded-full" />
            <div className="h-6 w-24 bg-white/20 rounded-full" />
            <div className="h-6 w-20 bg-white/20 rounded-full" />
          </div>
          {/* Title */}
          <div className="h-9 w-3/4 bg-white/20 rounded mb-2" />
        </div>
      </div>

      {/* Tags skeleton */}
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-muted rounded-full" />
        <div className="h-6 w-20 bg-muted rounded-full" />
        <div className="h-6 w-18 bg-muted rounded-full" />
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Educator card skeleton */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-muted rounded-full" />
              <div className="flex-1">
                <div className="h-5 w-40 bg-muted rounded mb-2" />
                <div className="h-4 w-32 bg-muted rounded mb-3" />
                <div className="h-4 w-full bg-muted rounded mb-1" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
            </div>
          </div>

          {/* Materials skeleton */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="h-6 w-40 bg-muted rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded" />
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-muted rounded mb-1" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                  <div className="h-9 w-24 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event details card skeleton */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="h-5 w-32 bg-muted rounded mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-muted rounded" />
                  <div className="flex-1">
                    <div className="h-4 w-full bg-muted rounded mb-1" />
                    <div className="h-3 w-2/3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * StudentOrdersListSkeleton - Loading skeleton for student orders list
 */
export function StudentOrdersListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-muted rounded-lg" />
        <div>
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded mt-1" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-muted rounded" />
        <div className="h-8 w-24 bg-muted rounded" />
        <div className="h-8 w-20 bg-muted rounded" />
      </div>

      {/* Order cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <StudentOrderCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * StudentOrderCardSkeleton - Loading skeleton for an order card
 */
function StudentOrderCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="w-full sm:w-32 h-32 bg-muted" />

        {/* Content */}
        <div className="flex-1 p-4 space-y-3">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="h-3 w-32 bg-muted rounded" />
              <div className="h-5 w-48 bg-muted rounded" />
            </div>
            <div className="h-5 w-24 bg-muted rounded-full" />
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>

          {/* Button */}
          <div className="pt-2">
            <div className="h-8 w-40 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * StudentProfileSkeleton - Loading skeleton for student profile page
 */
export function StudentProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-32 bg-muted rounded mb-2" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>

      {/* Avatar section skeleton */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
        <div className="h-20 w-20 bg-muted rounded-full" />
        <div>
          <div className="h-5 w-40 bg-muted rounded mb-2" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>

      {/* Form sections skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <ProfileSectionSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * ProfileSectionSkeleton - Loading skeleton for a profile section
 */
function ProfileSectionSkeleton() {
  return (
    <div className="p-4 bg-muted/30 rounded-xl space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-muted rounded" />
        <div className="h-5 w-40 bg-muted rounded" />
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}
