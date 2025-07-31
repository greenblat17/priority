'use client'

import { useScrollRestoration } from '@/hooks/use-scroll-restoration'

export function ScrollRestorationProvider({ children }: { children: React.ReactNode }) {
  useScrollRestoration()
  return <>{children}</>
}