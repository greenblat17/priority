'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useQuickAddShortcut } from '@/hooks/use-keyboard-shortcuts'
import { getPlatformKey } from '@/hooks/use-hotkeys'
import dynamic from 'next/dynamic'

const QuickAddModal = dynamic(
  () =>
    import('@/components/tasks/quick-add-modal').then((m) => m.QuickAddModal),
  { ssr: false, loading: () => null }
)

export function TasksClientHeader() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  useQuickAddShortcut(() => setIsQuickAddOpen(true))

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-500 mt-2">
            View and manage all your tasks in one place
          </p>
        </div>
        <Button onClick={() => setIsQuickAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 ml-1">
            <span className="text-xs">{getPlatformKey('cmd+K')}</span>
          </kbd>
        </Button>
      </div>
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </>
  )
}

export default TasksClientHeader
