'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine
    }
    return true
  })

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Back online', {
        description: 'Your connection has been restored.',
        duration: 3000,
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.error('No internet connection', {
        description: 'Some features may be limited.',
        duration: Infinity,
        id: 'offline-toast',
      })
    }

    // Check current status
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      // Dismiss the offline toast when component unmounts
      toast.dismiss('offline-toast')
    }
  }, [])

  return { isOnline, isOffline: !isOnline }
}

// Hook for checking if we should show offline UI
export function useOfflineDetection() {
  const { isOffline } = useNetworkStatus()
  const [showOfflineUI, setShowOfflineUI] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isOffline) {
      // Show offline UI after a short delay to avoid flashing
      timeout = setTimeout(() => {
        setShowOfflineUI(true)
      }, 1000)
    } else {
      setShowOfflineUI(false)
    }

    return () => clearTimeout(timeout)
  }, [isOffline])

  return { showOfflineUI, isOffline }
}