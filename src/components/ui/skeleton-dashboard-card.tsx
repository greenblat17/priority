import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonDashboardCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  )
}

export function SkeletonDashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <SkeletonDashboardCard />
      <SkeletonDashboardCard />
      <SkeletonDashboardCard />
    </div>
  )
}