'use client'

import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/tasks/task-list'
import { QuickAddModal } from '@/components/tasks/quick-add-modal'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { ArrowLeft, Plus } from 'lucide-react'
import { useState } from 'react'
import { useQuickAddShortcut } from '@/hooks/use-keyboard-shortcuts'
import { getPlatformKey } from '@/hooks/use-hotkeys'

export default function TasksPage() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  
  // Connect keyboard shortcut
  useQuickAddShortcut(() => setIsQuickAddOpen(true))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button asChild variant="ghost" size="sm">
            <PrefetchLink href="/overview">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Overview
            </PrefetchLink>
          </Button>
          
          <Button onClick={() => setIsQuickAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 ml-1">
              <span className="text-xs">{getPlatformKey('cmd+K')}</span>
            </kbd>
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