'use client'

import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/tasks/task-list'
import { QuickAddModal } from '@/components/tasks/quick-add-modal'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { useState } from 'react'

export default function TasksPage() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <Button onClick={() => setIsQuickAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold">All Tasks</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your tasks in one place
        </p>
      </div>

      <TaskList />
      
      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
      />
    </div>
  )
}