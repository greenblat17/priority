import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import { taskKeys } from './use-tasks'
import { createClient } from '@/lib/supabase/client'

interface PrefetchOptions {
  delay?: number // Delay before prefetching (default: 100ms)
  staleTime?: number // How long to consider data fresh (default: 5 minutes)
}

export function usePrefetch() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Generic prefetch function
  const prefetch = useCallback(
    async (queryKey: string[], queryFn: () => Promise<any>, options?: PrefetchOptions) => {
      const { delay = 100, staleTime = 5 * 60 * 1000 } = options || {}

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime,
        })
      }, delay)
    },
    [queryClient]
  )

  // Prefetch tasks for the tasks page
  const prefetchTasks = useCallback(
    (options?: PrefetchOptions) => {
      return prefetch(
        taskKeys.list(),
        async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return []

          const { data, error } = await supabase
            .from('tasks')
            .select(`
              *,
              task_analyses (*),
              task_groups (*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) throw error
          
          // Map to TaskWithAnalysis type
          return data?.map((task: any) => ({
            ...task,
            analysis: task.task_analyses || null,
            group: task.task_groups || null
          })) || []
        },
        options
      )
    },
    [prefetch, supabase]
  )

  // Prefetch dashboard data
  const prefetchDashboard = useCallback(
    (options?: PrefetchOptions) => {
      return prefetch(
        ['dashboard'],
        async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return null

          // Fetch dashboard stats
          const [tasksResult, analysesResult] = await Promise.all([
            supabase
              .from('tasks')
              .select('id, status')
              .eq('user_id', user.id),
            supabase
              .from('task_analyses')
              .select('priority, category')
              .in('task_id', 
                (await supabase
                  .from('tasks')
                  .select('id')
                  .eq('user_id', user.id)).data?.map(t => t.id) || []
              )
          ])

          return {
            totalTasks: tasksResult.data?.length || 0,
            pendingTasks: tasksResult.data?.filter(t => t.status === 'pending').length || 0,
            completedTasks: tasksResult.data?.filter(t => t.status === 'completed').length || 0,
            highPriorityCount: analysesResult.data?.filter(a => a.priority >= 8).length || 0,
          }
        },
        options
      )
    },
    [prefetch, supabase]
  )

  // Cancel any pending prefetch
  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    prefetch,
    prefetchTasks,
    prefetchDashboard,
    cancelPrefetch,
  }
}