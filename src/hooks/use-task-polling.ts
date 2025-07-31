'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { taskKeys } from './use-tasks'

/**
 * Hook to poll for task updates when tasks are being analyzed
 * This is a fallback for when real-time subscriptions aren't working
 */
export function useTaskPolling(tasks: any[] | undefined, enabled: boolean = true) {
  const queryClient = useQueryClient()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    if (!enabled || !tasks) {
      return
    }
    
    // Check if any tasks are still analyzing
    const hasAnalyzingTasks = tasks.some(task => 
      task && !task.analysis && task.status !== 'completed'
    )
    
    if (hasAnalyzingTasks) {
      console.log('[Polling] Starting task polling - found analyzing tasks')
      
      // Poll every 2 seconds
      intervalRef.current = setInterval(() => {
        console.log('[Polling] Refetching tasks...')
        queryClient.refetchQueries({ 
          queryKey: taskKeys.all,
          type: 'active' 
        })
      }, 2000)
    } else {
      // No analyzing tasks, stop polling
      if (intervalRef.current) {
        console.log('[Polling] Stopping task polling - no analyzing tasks')
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        console.log('[Polling] Cleaning up task polling')
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [tasks, enabled, queryClient])
}