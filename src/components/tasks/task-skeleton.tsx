import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function TaskSkeleton() {
  return (
    <Card className="p-4 border-gray-200">
      <div className="space-y-3">
        {/* Task description skeleton */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Meta info skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </Card>
  )
}

export function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <TaskSkeleton key={i} />
      ))}
    </div>
  )
}