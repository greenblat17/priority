'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useHotkeys, formatKeyDisplay } from '@/hooks/use-hotkeys'
import { cn } from '@/lib/utils'

interface Shortcut {
  keys: string
  description: string
  category: 'navigation' | 'actions' | 'tasks' | 'global'
}

const shortcuts: Shortcut[] = [
  // Global
  { keys: 'cmd+k', description: 'Quick add task', category: 'global' },
  { keys: '?', description: 'Show keyboard shortcuts', category: 'global' },
  { keys: 'escape', description: 'Close modal / Cancel', category: 'global' },
  
  // Navigation
  { keys: '/', description: 'Focus search', category: 'navigation' },
  
  // Tasks
  { keys: 'j', description: 'Next task', category: 'tasks' },
  { keys: 'k', description: 'Previous task', category: 'tasks' },
  { keys: 'enter', description: 'Open selected task', category: 'tasks' },
  { keys: 'x', description: 'Toggle task selection', category: 'tasks' },
  
  // Actions
  { keys: 'n', description: 'New task', category: 'actions' },
  { keys: 'v', description: 'Toggle view (table/kanban)', category: 'actions' },
  { keys: 'space', description: 'Toggle task status', category: 'actions' },
  { keys: 'd', description: 'Delete selected tasks', category: 'actions' },
  { keys: 'e', description: 'Edit selected task', category: 'actions' },
]

const categoryLabels = {
  global: 'Global',
  navigation: 'Navigation',
  tasks: 'Task List',
  actions: 'Actions',
}

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)

  // Listen for ? key to open dialog
  useHotkeys({
    keys: '?',
    description: 'Show keyboard shortcuts',
    action: () => setOpen(true),
  })

  // Also listen for a custom event
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener('show-keyboard-shortcuts', handleOpen)
    return () => window.removeEventListener('show-keyboard-shortcuts', handleOpen)
  }, [])

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut) => (
                  <ShortcutItem
                    key={shortcut.keys}
                    keys={shortcut.keys}
                    description={shortcut.description}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Press <Kbd>?</Kbd> anytime to show these shortcuts
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShortcutItem({ keys, description }: { keys: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm">{description}</span>
      <Kbd>{formatKeyDisplay(keys)}</Kbd>
    </div>
  )
}

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1",
        "text-xs font-medium",
        "bg-muted/50 text-muted-foreground",
        "border border-border/50 rounded-md",
        "shadow-sm",
        className
      )}
    >
      {children}
    </kbd>
  )
}