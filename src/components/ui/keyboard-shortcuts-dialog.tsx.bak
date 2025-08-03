'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'

interface ShortcutCategory {
  name: string
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'General',
    shortcuts: [
      {
        keys: ['Ctrl/⌘', 'K'],
        description: 'Quick add task'
      },
      {
        keys: ['?'],
        description: 'Show keyboard shortcuts'
      },
      {
        keys: ['Esc'],
        description: 'Close modal/dialog'
      },
    ]
  },
  {
    name: 'Navigation',
    shortcuts: [
      {
        keys: ['g', 'd'],
        description: 'Go to dashboard'
      },
      {
        keys: ['g', 't'],
        description: 'Go to tasks'
      },
      {
        keys: ['g', 's'],
        description: 'Go to settings'
      },
      {
        keys: ['g', 'h'],
        description: 'Go to home'
      },
    ]
  },
  {
    name: 'Task List',
    shortcuts: [
      {
        keys: ['j'],
        description: 'Next task'
      },
      {
        keys: ['k'],
        description: 'Previous task'
      },
      {
        keys: ['↓'],
        description: 'Next task'
      },
      {
        keys: ['↑'],
        description: 'Previous task'
      },
      {
        keys: ['Enter'],
        description: 'Open selected task'
      },
    ]
  },
]

export function KeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleShowShortcuts = () => {
      setIsOpen(true)
    }

    window.addEventListener('show-keyboard-shortcuts', handleShowShortcuts)

    return () => {
      window.removeEventListener('show-keyboard-shortcuts', handleShowShortcuts)
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Quick keyboard shortcuts to navigate and use TaskPriority AI efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {shortcutCategories.map((category) => (
            <div key={category.name}>
              <h3 className="font-semibold text-sm text-gray-900 mb-3">
                {category.name}
              </h3>
              <div className="grid gap-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-600">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center">
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-gray-400">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">?</kbd> anytime to show this help
        </div>
      </DialogContent>
    </Dialog>
  )
}