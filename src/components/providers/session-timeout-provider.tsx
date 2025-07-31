'use client'

import { useSessionTimeout } from '@/hooks/use-session-timeout'

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  // Initialize session timeout tracking
  useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5,
  })

  return <>{children}</>
}