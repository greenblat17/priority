import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto p-6 space-y-8">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Metric Cards Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4 border-gray-200">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto p-6 space-y-8">
        {/* GTM Alert Skeleton */}
        <Card className="p-4 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </Card>

        {/* Quick Links Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        {/* High Priority Tasks Section Skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-20" />
          </div>
          
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 border-gray-200">
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
            ))}
          </div>
        </div>

        {/* Recent Activity Section Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-9 w-20" />
          </div>
          
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4 border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-9" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}