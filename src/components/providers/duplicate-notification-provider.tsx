'use client'

import { useDuplicateNotifications } from '@/hooks/use-duplicate-notifications'

export function DuplicateNotificationProvider({ children }: { children: React.ReactNode }) {
  // This hook will handle showing notifications
  useDuplicateNotifications()
  
  return <>{children}</>
}