'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { toast } from 'sonner'

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number
  warningMinutes?: number
  onTimeout?: () => void
}

export function useSessionTimeout({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout
}: UseSessionTimeoutOptions = {}) {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // Reset activity timer
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now()
    
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    
    // Only set timers if user is logged in
    if (!user) return
    
    // Set warning timer
    warningRef.current = setTimeout(() => {
      toast.warning('Session expiring soon', {
        description: `Your session will expire in ${warningMinutes} minutes. Save your work.`,
        duration: 60000, // Show for 1 minute
        action: {
          label: 'Stay logged in',
          onClick: () => {
            resetTimer()
            // Refresh session
            supabase.auth.refreshSession()
          }
        }
      })
    }, (timeoutMinutes - warningMinutes) * 60 * 1000)
    
    // Set timeout timer
    timeoutRef.current = setTimeout(async () => {
      // Sign out the user
      await supabase.auth.signOut()
      
      toast.error('Session expired', {
        description: 'Please log in again to continue.',
        duration: 5000,
      })
      
      // Call custom handler if provided
      onTimeout?.()
      
      // Redirect to login
      router.push('/auth/login?expired=true')
    }, timeoutMinutes * 60 * 1000)
  }, [user, supabase, router, timeoutMinutes, warningMinutes, onTimeout])

  // Track user activity
  useEffect(() => {
    if (!user) return

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      const now = Date.now()
      // Only reset if it's been more than 1 second since last activity
      if (now - lastActivityRef.current > 1000) {
        resetTimer()
      }
    }
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })
    
    // Initial timer setup
    resetTimer()
    
    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [user, resetTimer])

  // Also check for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        resetTimer()
      }
      
      if (event === 'SIGNED_OUT') {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (warningRef.current) clearTimeout(warningRef.current)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, resetTimer])

  return {
    resetTimer,
    isActive: !!user,
  }
}