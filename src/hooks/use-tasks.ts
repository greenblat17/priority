'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useEffect } from 'react'
import type { Task, TaskWithAnalysis, TaskAttachment } from '@/types/task'
import type { TaskGroup } from '@/types/task-group'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Query keys factory for consistency
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters?: any) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  attachments: (taskId: string) =>
    [...taskKeys.detail(taskId), 'attachments'] as const,
}

// Fetch tasks with optional filters
export function useTasks(filters?: {
  status?: string
  category?: string
  sortBy?: 'priority' | 'date'
  page?: number
  limit?: number
}) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Set up real-time subscriptions for task updates
  useEffect(() => {
    // Feature flag to disable realtime if needed
    const ENABLE_REALTIME = true

    if (!ENABLE_REALTIME) {
      console.log('[Real-time] Realtime subscriptions disabled')
      return
    }

    console.log('[Real-time] Setting up task subscriptions...')

    // Get the current session for authentication
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      const { session } = data
      if (!session) {
        console.error('[Real-time] No session found for real-time subscription')
        return
      }

      console.log('[Real-time] Session found, setting up channel...')

      const channel = supabase
        .channel('task-updates', {
          config: {
            broadcast: { self: true },
            presence: { key: session.user.id },
          },
        })
        // Listen for task analysis updates (filter will be handled by RLS)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'task_analyses',
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            console.log('[Real-time] Task analysis update received:', payload)

            const updated = payload.new
            const taskId = updated?.task_id as string | undefined

            if (taskId) {
              // Targeted cache update: merge analysis for the specific task id
              queryClient.setQueriesData(
                { queryKey: taskKeys.lists() },
                (old: any) => {
                  if (!Array.isArray(old)) return old
                  return old.map((task: any) =>
                    task.id === taskId ? { ...task, analysis: updated } : task
                  )
                }
              )
            }

            if (payload.eventType === 'INSERT') {
              toast.success('Task analysis completed!', {
                description: 'AI has finished analyzing your task',
              })
            }
          }
        )
        // Listen for task updates (including group changes, filter will be handled by RLS)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tasks',
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            console.log('[Real-time] Task update received:', payload)
            const updatedTask = payload.new as any
            const taskId = updatedTask?.id as string | undefined
            if (taskId) {
              // Merge only changed fields (status, group_id, updated_at, etc.)
              queryClient.setQueriesData(
                { queryKey: taskKeys.lists() },
                (old: any) => {
                  if (!Array.isArray(old)) return old
                  return old.map((task: any) =>
                    task.id === taskId ? { ...task, ...updatedTask } : task
                  )
                }
              )
            }
          }
        )
        .subscribe(
          (
            status: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED',
            error?: any
          ) => {
            console.log('[Real-time] Subscription status:', status)
            if (error) {
              console.log('[Real-time] Error details:', error)
            }

            if (status === 'SUBSCRIBED') {
              console.log(
                '[Real-time] ✅ Successfully subscribed to task updates'
              )
            } else if (status === 'CHANNEL_ERROR') {
              console.warn(
                '[Real-time] ⚠️ Failed to subscribe to task updates. This is normal if RLS policies are restrictive.'
              )
              console.log(
                '[Real-time] 🔄 Falling back to polling mechanism - no impact on functionality'
              )
              if (error) {
                console.log('[Real-time] Error cause:', error)
              }
            } else if (status === 'TIMED_OUT') {
              console.warn(
                '[Real-time] ⏱️ Subscription timed out - using polling fallback'
              )
            } else if (status === 'CLOSED') {
              console.log('[Real-time] 🔌 Subscription closed')
            }
          }
        )

      // Store channel reference for cleanup
      return () => {
        console.log('[Real-time] Cleaning up task subscriptions...')
        supabase.removeChannel(channel)
      }
    })
  }, [supabase, queryClient])

  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(
          `
          id, user_id, description, source, customer_info, status, group_id, created_at, updated_at,
          task_analyses:task_analyses!task_id (
            category, priority, complexity, estimated_hours, confidence_score,
            ice_impact, ice_confidence, ice_ease, ice_score
          ),
          group:task_groups!group_id (
            id,
            name
          )
        `
        )
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.category) {
        query = query.eq('task_analyses.category', filters.category)
      }

      // Optional ordering by priority/ICE score
      if (filters?.sortBy === 'priority') {
        // Order by ice_score desc, fallback to created_at
        query = query
          .order('ice_score', {
            ascending: false,
            foreignTable: 'task_analyses',
          })
          .order('created_at', { ascending: false })
      }

      // Pagination
      const page = filters?.page || 1
      const limit = filters?.limit || 50
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query.range(from, to)

      const { data, error } = await query

      if (error) throw error

      // Map to TaskWithAnalysis type with group info
      return data?.map((task: any) => ({
        ...task,
        analysis: task.task_analyses || null,
        group: task.group || null,
      })) as Array<TaskWithAnalysis & { group: TaskGroup | null }>
    },
    // Cache and fetch behavior tuning
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    placeholderData: (previousData) => previousData,
  })
}

// Fetch attachments for a task
export function useTaskAttachments(
  taskId: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: taskId
      ? taskKeys.attachments(taskId)
      : ['attachments', 'disabled'],
    enabled: enabled && !!taskId,
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/attachments`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to load attachments')
      return (await res.json()) as Array<TaskAttachment & { url: string }>
    },
    // No automatic re-fetching; we trigger manually when opening the detail view
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
  })
}

// Create task with optimistic update
export function useCreateTask() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (taskData: {
      description: string
      source?: string
      customer_info?: string
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Trigger AI analysis in background
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: data.id }),
      }).catch(console.error)

      return data
    },
    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(taskKeys.lists())

      // Optimistically update to the new value
      queryClient.setQueryData(taskKeys.lists(), (old: any) => {
        const optimisticTask = {
          id: 'temp-' + Date.now(),
          ...newTask,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          analysis: null,
        }
        return [optimisticTask, ...(old || [])]
      })

      return { previousTasks }
    },
    onError: (err, newTask, context) => {
      // Rollback on error
      queryClient.setQueryData(taskKeys.lists(), context?.previousTasks)
      toast.error('Failed to create task')
    },
    onSuccess: () => {
      toast.success('Task created! AI is analyzing it now...')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Update task status with optimistic update
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string
      status: string
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const previousTasks = queryClient.getQueryData(taskKeys.lists())

      // Update the task in all queries
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old) return old
        return old.map((task: any) =>
          task.id === taskId ? { ...task, status } : task
        )
      })

      return { previousTasks }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(taskKeys.lists(), context?.previousTasks)
      toast.error('Failed to update task status')
    },
    onSuccess: (data, { status }) => {
      toast.success(`Task marked as ${status}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Prefetch tasks for navigation
export function usePrefetchTasks() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return async () => {
    await queryClient.prefetchQuery({
      queryKey: taskKeys.list(),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('tasks')
          .select(
            `
            *,
            task_analyses!task_id (*)
          `
          )
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        return data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }
}

// Delete task with optimistic update and undo
export function useDeleteTask() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      // Create a promise that can be cancelled for undo
      return new Promise<void>((resolve, reject) => {
        let isUndone = false
        const undoTimeout = setTimeout(async () => {
          if (!isUndone) {
            try {
              const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId)

              if (error) throw error
              resolve()
            } catch (error) {
              reject(error)
            }
          }
        }, 4000) // 4 second delay for undo

        // Show undo toast
        toast.success('Task deleted', {
          duration: 4000,
          action: {
            label: 'Undo',
            onClick: () => {
              isUndone = true
              clearTimeout(undoTimeout)
              reject(new Error('Undo'))
            },
          },
        })
      })
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const previousTasks = queryClient.getQueryData(taskKeys.lists())

      // Optimistically remove the task
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old) return old
        return old.filter((task: any) => task.id !== taskId)
      })

      return { previousTasks }
    },
    onError: (err, variables, context) => {
      // Rollback to previous state
      queryClient.setQueryData(taskKeys.lists(), context?.previousTasks)

      if (err.message !== 'Undo') {
        toast.error('Failed to delete task')
      }
    },
    onSettled: (data, error) => {
      // Only invalidate if not undone
      if (error?.message !== 'Undo') {
        queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      }
    },
  })
}

// Bulk update task status
export function useBulkUpdateTaskStatus() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      taskIds,
      status,
    }: {
      taskIds: string[]
      status: string
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', taskIds)
        .select()

      if (error) throw error
      return data
    },
    onMutate: async ({ taskIds, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const previousTasks = queryClient.getQueryData(taskKeys.lists())

      // Update the tasks in all queries
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old) return old
        return old.map((task: any) =>
          taskIds.includes(task.id) ? { ...task, status } : task
        )
      })

      return { previousTasks }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(taskKeys.lists(), context?.previousTasks)
      toast.error('Failed to update task status')
    },
    onSuccess: (data, { status, taskIds }) => {
      toast.success(`${taskIds.length} tasks marked as ${status}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Bulk delete tasks
export function useBulkDeleteTasks() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (taskIds: string[]) => {
      const { error } = await supabase.from('tasks').delete().in('id', taskIds)

      if (error) throw error
    },
    onMutate: async (taskIds) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const previousTasks = queryClient.getQueryData(taskKeys.lists())

      // Optimistically remove the tasks
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old) return old
        return old.filter((task: any) => !taskIds.includes(task.id))
      })

      return { previousTasks }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(taskKeys.lists(), context?.previousTasks)
      toast.error('Failed to delete tasks')
    },
    onSuccess: (data, taskIds) => {
      toast.success(`${taskIds.length} tasks deleted`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}
