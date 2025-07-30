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

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {userName}!
          </p>
        </div>

        {/* GTM Setup Alert */}
        {!hasGTMManifest && (
          <Alert className="mb-8">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Improve AI Prioritization</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="flex items-center justify-between">
                <span>Set up your GTM context to get more accurate task prioritization based on your business goals.</span>
                <Button asChild size="sm" className="ml-4">
                  <Link href="/onboarding">Set Up Now</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Button 
            className="h-auto p-6 flex-col gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle className="h-6 w-6" />
            <span>Add New Task</span>
            <span className="text-xs text-muted-foreground">⌘K</span>
          </Button>
          <Button asChild variant="outline" className="h-auto p-6 flex-col gap-2">
            <Link href="/tasks">
              <ListTodo className="h-6 w-6" />
              <span>View All Tasks</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-6 flex-col gap-2">
            <Link href="/analytics">
              <BarChart3 className="h-6 w-6" />
              <span>Analytics</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-6 flex-col gap-2">
            <Link href="/settings/gtm">
              <Settings className="h-6 w-6" />
              <span>GTM Settings</span>
            </Link>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {pendingTasks}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedTasks}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for future features */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent tasks and AI analyses will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              {totalTasks === 0 
                ? 'No tasks yet. Click "Add New Task" or press ⌘K to get started!'
                : 'Task activity will be displayed here'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}