'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowRight, CheckCircle, Target, TrendingUp, Lightbulb } from 'lucide-react'

interface OverviewContentProps {
  userName: string
  totalTasks: number
  completedThisWeek: number
  pendingTasks: number
  hasGTMManifest: boolean
}

export function OverviewContent({ 
  userName, 
  totalTasks, 
  completedThisWeek,
  pendingTasks,
  hasGTMManifest
}: OverviewContentProps) {
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Calculate productivity score
  const productivityScore = totalTasks > 0 
    ? Math.round((completedThisWeek / Math.max(pendingTasks + completedThisWeek, 1)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Simple Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-gray-600 mt-1">
              Here's your quick overview
            </p>
          </div>
          <Button asChild>
            <Link href="/tasks">
              Go to Tasks
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-semibold text-black">{totalTasks}</p>
              </div>
              <Target className="h-8 w-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-black">{pendingTasks}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-semibold text-green-600">{completedThisWeek}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Productivity</p>
                <p className="text-2xl font-semibold text-blue-600">{productivityScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tips Section */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks > 10 && (
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                  <p className="text-sm text-gray-600">
                    You have {pendingTasks} pending tasks. Consider focusing on high-priority items first.
                  </p>
                </div>
              )}
              {completedThisWeek === 0 && totalTasks > 0 && (
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                  <p className="text-sm text-gray-600">
                    Start your week strong! Pick one small task to complete today.
                  </p>
                </div>
              )}
              {productivityScore > 70 && (
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                  <p className="text-sm text-gray-600">
                    Great productivity this week! Keep up the momentum.
                  </p>
                </div>
              )}
              {!hasGTMManifest && (
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1.5" />
                  <p className="text-sm text-gray-600">
                    Set up your GTM context for better AI prioritization.{' '}
                    <Link href="/settings/gtm" className="text-blue-600 hover:underline">
                      Configure now
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/tasks">
                  <Target className="mr-2 h-4 w-4" />
                  View All Tasks
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/tasks?status=pending">
                  <div className="mr-2 h-4 w-4 rounded-full bg-yellow-100 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  </div>
                  View Pending Tasks
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/settings/gtm">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Update GTM Context
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        {completedThisWeek > 5 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Productive Week!</AlertTitle>
            <AlertDescription className="text-green-800">
              You've completed {completedThisWeek} tasks this week. That's fantastic progress!
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}