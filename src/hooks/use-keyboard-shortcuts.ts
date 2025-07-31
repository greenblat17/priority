import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  // Navigation shortcuts
  useKeyboardShortcut({
    key: 'g',
    action: () => {} // This will be followed by another key
  })

  useEffect(() => {
    let gPressed = false
    let gTimeout: NodeJS.Timeout

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Handle 'g' followed by another key for navigation
      if (event.key === 'g' && !event.ctrlKey && !event.metaKey) {
        gPressed = true
        // Reset after 1 second
        gTimeout = setTimeout(() => {
          gPressed = false
        }, 1000)
        return
      }

      if (gPressed) {
        event.preventDefault()
        gPressed = false
        clearTimeout(gTimeout)

        switch (event.key) {
          case 'd':
            router.push('/overview')
            break
          case 't':
            router.push('/tasks')
            break
          case 's':
            router.push('/settings/gtm')
            break
          case 'h':
            router.push('/')
            break
        }
      }

      // Show help with '?'
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        // This will be implemented with the shortcut discovery UI
        const customEvent = new CustomEvent('show-keyboard-shortcuts')
        window.dispatchEvent(customEvent)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (gTimeout) clearTimeout(gTimeout)
    }
  }, [router])
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
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, isActive])
}