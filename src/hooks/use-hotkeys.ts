'use client'

import { useEffect, useCallback, useRef } from 'react'

interface HotkeyConfig {
  keys: string | string[]
  description: string
  category?: 'navigation' | 'actions' | 'tasks' | 'global'
  action: () => void
  enableOnFormTags?: boolean
  preventDefault?: boolean
}

/**
 * Enhanced keyboard shortcut hook with cross-platform support
 * Supports single keys, combinations (cmd+k), and sequences (g then t)
 */
export function useHotkeys(
  config: HotkeyConfig | HotkeyConfig[],
  deps: any[] = []
) {
  const configs = Array.isArray(config) ? config : [config]
  const sequenceRef = useRef<string[]>([])
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if we're in an input field
    const target = event.target as HTMLElement
    const isFormTag = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || 
                     target.isContentEditable

    configs.forEach(({ keys, action, enableOnFormTags = false, preventDefault = true }) => {
      // Skip if in form tag and not explicitly enabled
      if (isFormTag && !enableOnFormTags) return

      const keyArray = Array.isArray(keys) ? keys : [keys]
      
      keyArray.forEach(keyCombo => {
        if (matchesKeyCombo(event, keyCombo, sequenceRef.current)) {
          if (preventDefault) {
            event.preventDefault()
            event.stopPropagation()
          }
          
          // Clear sequence after successful match
          sequenceRef.current = []
          if (sequenceTimeoutRef.current) {
            clearTimeout(sequenceTimeoutRef.current)
          }
          
          action()
        }
      })
    })

    // Track key sequences (like 'g t')
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      sequenceRef.current.push(event.key)
      
      // Clear sequence after 1 second
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current)
      }
      sequenceTimeoutRef.current = setTimeout(() => {
        sequenceRef.current = []
      }, 1000)
    }
  }, [configs, ...deps])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current)
      }
    }
  }, [handleKeyDown])
}

/**
 * Check if a keyboard event matches a key combination
 */
function matchesKeyCombo(
  event: KeyboardEvent,
  keyCombo: string,
  currentSequence: string[]
): boolean {
  // Handle key sequences (e.g., 'g t')
  if (keyCombo.includes(' ')) {
    const sequence = keyCombo.split(' ')
    const fullSequence = [...currentSequence.slice(0, -1), event.key]
    return sequence.every((key, index) => fullSequence[index] === key)
  }

  // Handle key combinations (e.g., 'cmd+k', 'ctrl+k')
  const parts = keyCombo.toLowerCase().split('+')
  const key = parts[parts.length - 1]
  
  // Check modifiers
  const hasCmd = parts.includes('cmd') || parts.includes('meta')
  const hasCtrl = parts.includes('ctrl')
  const hasAlt = parts.includes('alt')
  const hasShift = parts.includes('shift')
  
  // Platform-specific command key
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const cmdPressed = isMac ? event.metaKey : event.ctrlKey
  
  // For cross-platform support: cmd on Mac, ctrl on Windows/Linux
  if ((hasCmd && !cmdPressed) || (hasCtrl && !event.ctrlKey && !isMac)) {
    return false
  }
  
  if (hasAlt && !event.altKey) return false
  if (hasShift && !event.shiftKey) return false
  
  // Check the actual key
  const eventKey = event.key.toLowerCase()
  
  // Handle special keys
  const keyMap: Record<string, string[]> = {
    'enter': ['enter'],
    'return': ['enter'],
    'esc': ['escape'],
    'escape': ['escape'],
    'space': [' ', 'space'],
    'up': ['arrowup'],
    'down': ['arrowdown'],
    'left': ['arrowleft'],
    'right': ['arrowright'],
    'delete': ['delete', 'backspace'],
    '/': ['/', '?'], // Handle shift+/ for ?
  }
  
  const normalizedKey = keyMap[key] || [key]
  return normalizedKey.includes(eventKey)
}

/**
 * Get platform-specific key display
 */
export function getPlatformKey(key: string): string {
  const isMac = typeof navigator !== 'undefined' && 
                navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  if (key.includes('cmd') || key.includes('meta')) {
    return key.replace(/cmd|meta/gi, isMac ? '⌘' : 'Ctrl')
  }
  
  return key
    .replace(/ctrl/gi, isMac ? '⌃' : 'Ctrl')
    .replace(/alt/gi, isMac ? '⌥' : 'Alt')
    .replace(/shift/gi, isMac ? '⇧' : 'Shift')
    .replace(/enter|return/gi, isMac ? '⏎' : 'Enter')
    .replace(/delete|backspace/gi, isMac ? '⌫' : 'Delete')
    .replace(/escape|esc/gi, 'Esc')
    .replace(/space/gi, 'Space')
    .replace(/\+/g, '')
}

/**
 * Format key for display in UI
 */
export function formatKeyDisplay(key: string): string {
  const formatted = getPlatformKey(key)
  
  // Handle sequences (e.g., 'g t' -> 'G → T')
  if (formatted.includes(' ')) {
    return formatted
      .split(' ')
      .map(k => k.toUpperCase())
      .join(' → ')
  }
  
  return formatted
}