/**
 * CourseCatalogSkeleton - Loading skeleton for course catalog
 */
export function CourseCatalogSkeleton() {
  return (
    <section className="py-16 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="h-9 w-48 bg-muted rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-muted rounded-full animate-pulse" />
        </div>

        {/* Course Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {[1, 2, 3, 4].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CourseCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
      {/* Image Skeleton */}
      <div className="h-48 bg-muted animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-6">
        {/* Badge */}
        <div className="h-6 w-20 bg-muted rounded-full animate-pulse mb-3" />

        {/* Title */}
        <div className="h-7 w-3/4 bg-muted rounded animate-pulse mb-2" />

        {/* Date */}
        <div className="h-5 w-1/2 bg-muted rounded animate-pulse mb-4" />

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
            <div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}
