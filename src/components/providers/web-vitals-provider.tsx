'use client'

import { useEffect } from 'react'
import { reportWebVitals, logWebVitals } from '@/lib/web-vitals'

export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Log to console in development, report to analytics in production
    if (process.env.NODE_ENV === 'development') {
      logWebVitals()
    } else {
      reportWebVitals()
    }
  }, [])

  return <>{children}</>
}