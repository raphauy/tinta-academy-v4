/**
 * Skeleton components for educator pages
 * Used within Suspense boundaries for loading states
 */

/**
 * DashboardSkeleton - Loading skeleton for educator dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-48 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-44 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Metrics Grid - 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 h-48 animate-pulse">
          <div className="h-4 w-32 bg-muted rounded mb-4" />
          <div className="h-32 bg-muted/50 rounded" />
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 h-48 animate-pulse">
          <div className="h-4 w-32 bg-muted rounded mb-4" />
          <div className="h-32 bg-muted/50 rounded" />
        </div>
      </div>

      {/* Quick Access Courses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
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
function MetricCardSkeleton() {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="h-3 w-20 bg-muted rounded animate-pulse mb-2" />
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
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
 * CourseListSkeleton - Loading skeleton for educator course list
 */
export function CourseListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-9 w-32 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-44 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse max-w-md" />
        <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Course count */}
      <div className="h-4 w-20 bg-muted rounded animate-pulse" />

      {/* Course rows */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <CourseRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * CourseRowSkeleton - Loading skeleton for a course row
 */
function CourseRowSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image */}
        <div className="w-full md:w-48 h-32 bg-muted rounded-xl animate-pulse flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
            <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-2/3 bg-muted rounded animate-pulse mb-3" />
          <div className="flex gap-4">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
          <div className="h-6 w-16 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/**
 * StudentListSkeleton - Loading skeleton for student list
 */
export function StudentListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="h-8 w-64 bg-muted rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-80 bg-muted rounded animate-pulse" />
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StudentMetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Search */}
      <div className="h-10 w-full max-w-md bg-muted rounded-lg animate-pulse" />

      {/* Count */}
      <div className="h-4 w-24 bg-muted rounded animate-pulse" />

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-border p-4">
          <div className="flex gap-4">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-28 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <StudentRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * StudentMetricCardSkeleton - Loading skeleton for student metrics
 */
function StudentMetricCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-muted rounded-xl animate-pulse" />
        <div>
          <div className="h-7 w-12 bg-muted rounded animate-pulse mb-1" />
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/**
 * StudentRowSkeleton - Loading skeleton for a student table row
 */
function StudentRowSkeleton() {
  return (
    <div className="border-b border-border last:border-0 p-4">
      <div className="flex items-center gap-4">
        {/* Avatar & Name */}
        <div className="flex items-center gap-3 w-48">
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
          <div className="h-4 w-28 bg-muted rounded animate-pulse" />
        </div>
        {/* Email */}
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        {/* Date */}
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        {/* Status */}
        <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
        {/* Action */}
        <div className="w-8 h-8 bg-muted rounded-lg animate-pulse ml-auto" />
      </div>
    </div>
  )
}

/**
 * AllStudentsListSkeleton - Loading skeleton for all students page
 */
export function AllStudentsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="h-9 w-48 bg-muted rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-64 bg-muted rounded animate-pulse" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse max-w-md" />
        <div className="h-10 w-40 bg-muted rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Count */}
      <div className="h-4 w-28 bg-muted rounded animate-pulse" />

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-border p-4">
          <div className="flex gap-4">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
            <div className="h-4 w-28 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
        {/* Table Rows */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <AllStudentsRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * AllStudentsRowSkeleton - Loading skeleton for all students table row
 */
function AllStudentsRowSkeleton() {
  return (
    <div className="border-b border-border last:border-0 p-4">
      <div className="flex items-center gap-4">
        {/* Avatar & Name */}
        <div className="flex items-center gap-3 w-48">
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
          <div className="h-4 w-28 bg-muted rounded animate-pulse" />
        </div>
        {/* Email */}
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        {/* Course */}
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        {/* Date */}
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        {/* Status */}
        <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
        {/* Action */}
        <div className="w-8 h-8 bg-muted rounded-lg animate-pulse ml-auto" />
      </div>
    </div>
  )
}
