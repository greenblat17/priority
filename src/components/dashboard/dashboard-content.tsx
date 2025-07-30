'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, ListTodo, BarChart3, Settings } from 'lucide-react'
import { QuickAddModal } from '@/components/tasks/quick-add-modal'
import { useQuickAddShortcut } from '@/hooks/use-keyboard-shortcuts'

interface DashboardContentProps {
  userName: string
  totalTasks: number
  pendingTasks: number
  completedTasks: number
}

export function DashboardContent({ 
  userName, 
  totalTasks, 
  pendingTasks, 
  completedTasks 
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
            <Link href="/settings">
              <Settings className="h-6 w-6" />
              <span>Settings</span>
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