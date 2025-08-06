import { useEffect, useCallback, useState } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
}

export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if event.key exists
      if (!event.key || !shortcut.key) return
      
      // Check if the key matches
      if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) return

      // Check modifier keys
      const ctrlOrMeta = event.ctrlKey || event.metaKey
      const expectedCtrlOrMeta = shortcut.ctrlKey || shortcut.metaKey

      if (expectedCtrlOrMeta && !ctrlOrMeta) return
      if (!expectedCtrlOrMeta && ctrlOrMeta) return

      if (shortcut.shiftKey && !event.shiftKey) return
      if (!shortcut.shiftKey && event.shiftKey) return

      if (shortcut.altKey && !event.altKey) return
      if (!shortcut.altKey && event.altKey) return

      // Prevent default browser behavior
      event.preventDefault()
      
      // Execute the action
      shortcut.action()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcut])
}

// Convenience hook for Cmd/Ctrl+K
export function useQuickAddShortcut(onOpen: () => void) {
  useKeyboardShortcut({
    key: 'k',
    ctrlKey: true, // Works for both Ctrl (Windows/Linux) and Cmd (Mac)
    metaKey: true, // The hook will accept either
    action: onOpen
  })
}

// Global keyboard shortcuts
export function useGlobalKeyboardShortcuts() {

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Show help with '?'
      if (event.key && event.key === '?' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        // This will be implemented with the shortcut discovery UI
        const customEvent = new CustomEvent('show-keyboard-shortcuts')
        window.dispatchEvent(customEvent)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}

// Task list navigation shortcuts (j/k)
export function useTaskListNavigation(
  tasks: any[],
  selectedIndex: number,
  onSelectIndex: (index: number) => void,
  onOpenTask?: (task: any) => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger when typing
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if (!event.key) return
      
      switch (event.key) {
        case 'j':
        case 'ArrowDown':
          event.preventDefault()
          if (selectedIndex < tasks.length - 1) {
            onSelectIndex(selectedIndex + 1)
          }
          break
        case 'k':
        case 'ArrowUp':
          event.preventDefault()
          if (selectedIndex > 0) {
            onSelectIndex(selectedIndex - 1)
          }
          break
        case 'Enter':
          event.preventDefault()
          if (tasks[selectedIndex] && onOpenTask) {
            onOpenTask(tasks[selectedIndex])
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tasks, selectedIndex, onSelectIndex, onOpenTask])
}

// Modal/Dialog escape handling
export function useEscapeKey(onEscape: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key && event.key === 'Escape') {
        event.preventDefault()
        onEscape()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, isActive])
}

// Keyboard shortcuts dialog hook
export function useKeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleShowShortcuts = () => setIsOpen(true)
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger when typing
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if (event.key && event.key === '?' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener('show-keyboard-shortcuts', handleShowShortcuts)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('show-keyboard-shortcuts', handleShowShortcuts)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return { isOpen, setIsOpen }
}