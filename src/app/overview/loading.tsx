import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function OverviewLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Greeting Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </Card>
          ))}
        </div>

        {/* Content Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-gray-200">
            <div className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </Card>

          <Card className="border-gray-200">
            <div className="p-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}