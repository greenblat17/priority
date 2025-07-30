import { useEffect } from 'react'

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