'use client'

import { useGlobalKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts()

  return <>{children}</>
}