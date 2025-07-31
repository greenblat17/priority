'use client'

import { WifiOff } from 'lucide-react'
import { useOfflineDetection } from '@/hooks/use-network-status'
import { cn } from '@/lib/utils'

export function OfflineIndicator() {
  const { showOfflineUI, isOffline } = useOfflineDetection()

  if (!showOfflineUI) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md shadow-lg transition-all duration-300",
        isOffline ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
    >
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">You're offline</span>
    </div>
  )
}

// Banner style indicator for top of page
export function OfflineBanner() {
  const { isOffline } = useOfflineDetection()

  if (!isOffline) return null

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>You're currently offline. Some features may be unavailable.</span>
      </div>
    </div>
  )
}