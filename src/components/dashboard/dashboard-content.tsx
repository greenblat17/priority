'use client'

import { useState, lazy, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PlusCircle, ArrowRight } from 'lucide-react'
import { useQuickAddShortcut } from '@/hooks/use-keyboard-shortcuts'

// Lazy load the QuickAddModal component
const QuickAddModal = dynamic(
  () => import('@/components/tasks/quick-add-modal').then(mod => ({ default: mod.QuickAddModal })),
  { 
    loading: () => <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />,
    ssr: false 
  }
)

interface DashboardContentProps {
  userName: string
  totalTasks: number
  pendingTasks: number
  completedTasks: number
  inProgressTasks: number
  blockedTasks: number
  hasGTMManifest: boolean
  highPriorityTasks: any[]
  recentTasks: any[]
  topPendingTasks: any[]
}

export function DashboardContent({ 
  userName, 
  totalTasks, 
  pendingTasks, 
  completedTasks,
  inProgressTasks,
  blockedTasks,
  hasGTMManifest,
  highPriorityTasks,
  recentTasks,
  topPendingTasks
}: DashboardContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Enable keyboard shortcut (Cmd/Ctrl+K)
  useQuickAddShortcut(() => setIsModalOpen(true))
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-black">
                  {getGreeting()}, {userName}
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  Here's what needs your attention today
                </p>
              </div>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-black hover:bg-gray-800 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                Add Task
              </Button>
            </div>

            {/* Metric Cards - Enhanced with more status types */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="p-4  transition-all duration-200 border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-semibold text-black">{pendingTasks}</p>
                </div>
              </Card>
              
              <Card className="p-4  transition-all duration-200 border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    In Progress
                  </p>
                  <p className="text-xl font-semibold text-black">{inProgressTasks}</p>
                </div>
              </Card>
              
              <Card className="p-4  transition-all duration-200 border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Blocked
                  </p>
                  <p className="text-xl font-semibold text-black">{blockedTasks}</p>
                </div>
              </Card>
              
              <Card className="p-4  transition-all duration-200 border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Completed
                  </p>
                  <p className="text-xl font-semibold text-black">{completedTasks}</p>
                </div>
              </Card>
              
              <Card className="p-4  transition-all duration-200 border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-semibold text-black">{totalTasks}</p>
                </div>
              </Card>
              
              <Card className="p-4  transition-all duration-200 border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Completion</p>
                  <p className="text-xl font-semibold text-blue-500">
                    {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto p-6 space-y-8">
          {/* GTM Setup Alert - More subtle */}
          {!hasGTMManifest && (
            <Alert className="mb-6 border-gray-200">
              <AlertTitle className="text-black">Improve AI Prioritization</AlertTitle>
              <AlertDescription className="">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 leading-relaxed">Set up your GTM context to get more accurate task prioritization based on your business goals.</span>
                  <Button asChild size="sm" variant="outline" className="">
                    <Link href="/onboarding">Set Up Now</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Links */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-black">Quick Access</h2>
            <div className="flex gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/tasks">
                  View All Tasks
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/analytics">
                  Analytics
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/settings/gtm">
                  Settings
                </Link>
              </Button>
            </div>
          </div>

          {/* High Priority Tasks Section - Show pending tasks if no high priority */}
          {(highPriorityTasks.length > 0 || pendingTasks > 0) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black">
                  {highPriorityTasks.length > 0 ? 'High Priority Tasks' : 'Pending Tasks'}
                </h2>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/tasks?priority=high">
                    View All
                  </Link>
                </Button>
              </div>
              
              {highPriorityTasks.length > 0 ? (
                <div className="grid gap-4">
                  {highPriorityTasks.map((task) => (
                    <Card key={task.id} className="p-4  transition-all duration-200 border-gray-200 cursor-pointer">
                      <Link href={`/tasks?highlight=${task.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-black line-clamp-1">{task.description}</p>
                            <div className="flex items-center gap-4 ">
                              <span className="text-sm text-gray-500">
                                {task.analysis?.[0]?.category || 'Uncategorized'}
                              </span>
                              <span className={`text-sm font-semibold text-blue-500 ${task.analysis?.[0]?.priority >= 9 ? 'animate-pulse-subtle' : ''}`}>
                                Priority: {task.analysis?.[0]?.priority || '-'}/10
                              </span>
                              <span className="text-sm text-gray-500">
                                {task.analysis?.[0]?.estimated_hours ? `${task.analysis[0].estimated_hours}h` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : topPendingTasks.length > 0 ? (
                <div className="grid gap-4">
                  {topPendingTasks.map((task) => (
                    <Card key={task.id} className="p-4  transition-all duration-200 border-gray-200 cursor-pointer">
                      <Link href={`/tasks?highlight=${task.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-black line-clamp-1">{task.description}</p>
                            <div className="flex items-center gap-4 ">
                              <span className="text-sm text-gray-500">
                                {task.analysis?.[0]?.category || 'Uncategorized'}
                              </span>
                              <span className={`text-sm font-semibold ${
                                task.analysis?.[0]?.priority >= 6 ? 'text-black' : 'text-gray-600'
                              }`}>
                                Priority: {task.analysis?.[0]?.priority || '-'}/10
                              </span>
                              <span className="text-sm text-gray-500">
                                {task.analysis?.[0]?.estimated_hours ? `${task.analysis[0].estimated_hours}h` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center border-gray-200">
                  <p className="text-gray-600">No pending tasks. Great job!</p>
                </Card>
              )}
            </div>
          )}

          {/* Recent Tasks Section */}
          {recentTasks.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black">Recent Tasks</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/tasks">
                    View All Tasks
                  </Link>
                </Button>
              </div>
              <Card className="border-gray-200">
                <div className="divide-y divide-gray-100">
                  {recentTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-4 transition-colors cursor-pointer">
                      <Link href={`/tasks?highlight=${task.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-black line-clamp-1">{task.description}</p>
                            <div className="flex items-center gap-4 ">
                              <span className="text-sm text-gray-500">
                                {task.analysis?.[0]?.category || 'Uncategorized'}
                              </span>
                              <span className={`text-sm font-semibold ${
                                task.analysis?.[0]?.priority >= 8 ? 'text-blue-500' : 
                                task.analysis?.[0]?.priority >= 6 ? 'text-black' : 
                                'text-gray-600'
                              }`}>
                                Priority: {task.analysis?.[0]?.priority || '-'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(task.created_at).toLocaleDateString()}
                              </span>
                              <span className={`text-sm font-semibold ${
                                task.status === 'completed' ? 'text-black' :
                                task.status === 'in_progress' ? 'text-gray-700' :
                                task.status === 'blocked' ? 'text-gray-900 font-semibold' :
                                'text-gray-600'
                              }`}>
                                {task.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {totalTasks === 0 && (
            <Card className="p-8 text-center border-gray-200">
              <div className="max-w-md mx-auto space-y-6">
                <h3 className="text-lg font-semibold text-black">No tasks yet</h3>
                <p className="text-gray-600 leading-relaxed">
                  Start by adding your first task. Our AI will analyze and prioritize it for you.
                </p>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-black hover:bg-gray-800 text-white transition-all duration-200 hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Your First Task
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}