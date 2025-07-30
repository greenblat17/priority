'use client'

import { useState, lazy, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PlusCircle, ListTodo, BarChart3, Settings, Sparkles } from 'lucide-react'
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
  hasGTMManifest: boolean
}

export function DashboardContent({ 
  userName, 
  totalTasks, 
  pendingTasks, 
  completedTasks,
  hasGTMManifest 
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
          <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-black">
                  {getGreeting()}, {userName}
                </h1>
                <p className="text-gray-600">
                  Here's what needs your attention today
                </p>
              </div>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-black hover:bg-gray-800 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Task
                <span className="ml-2 text-xs opacity-60">⌘K</span>
              </Button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 hover:shadow-md transition-all duration-200 border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-semibold text-black">{totalTasks}</p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-md transition-all duration-200 border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-black">{pendingTasks}</p>
                  <p className="text-xs text-gray-500">To be completed</p>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-md transition-all duration-200 border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-black">{completedTasks}</p>
                  <p className="text-xs text-gray-500">Well done!</p>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-md transition-all duration-200 border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-semibold text-blue-500">
                    {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">Keep it up!</p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* GTM Setup Alert - More subtle */}
          {!hasGTMManifest && (
            <Alert className="mb-8 border-gray-200">
              <Sparkles className="h-4 w-4" />
              <AlertTitle className="text-black">Improve AI Prioritization</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Set up your GTM context to get more accurate task prioritization based on your business goals.</span>
                  <Button asChild size="sm" variant="outline" className="ml-4 hover:bg-gray-50">
                    <Link href="/onboarding">Set Up Now</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Links */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-black">Quick Access</h2>
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm" className="hover:bg-gray-50">
                <Link href="/tasks">
                  <ListTodo className="w-4 h-4 mr-2" />
                  View All Tasks
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hover:bg-gray-50">
                <Link href="/analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hover:bg-gray-50">
                <Link href="/settings/gtm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>

          {/* Empty State or Getting Started */}
          {totalTasks === 0 && (
            <Card className="p-12 text-center border-gray-200">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <ListTodo className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-black">No tasks yet</h3>
                <p className="text-gray-600">
                  Start by adding your first task. Our AI will analyze and prioritize it for you.
                </p>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-black hover:bg-gray-800 text-white transition-all duration-200 hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
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