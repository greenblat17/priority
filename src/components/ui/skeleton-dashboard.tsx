import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function SkeletonMetricCard() {
  return (
    <Card className="p-4 border-gray-200">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
    </Card>
  )
}

export function SkeletonTaskCard() {
  return (
    <Card className="p-4 border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </Card>
  )
}

export function SkeletonDashboardHero() {
  return (
    <div className="border-b border-gray-100">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonTaskSection({ title = "Loading...", count = 3 }: { title?: string; count?: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-20" />
      </div>
      
      <div className="grid gap-4">
        {[...Array(count)].map((_, i) => (
          <SkeletonTaskCard key={i} />
        ))}
      </div>
    </div>
  )
}