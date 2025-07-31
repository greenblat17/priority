'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Task, TaskWithAnalysis } from '@/types/task'

// Query keys factory for consistency
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters?: any) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
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
  
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          task_analyses!task_id (*),
          task_groups!group_id (*)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
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
        group: task.task_groups || null
      })) as any[]
    },
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
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
      const { data: { user } } = await supabase.auth.getUser()
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
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
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
      queryClient.setQueriesData(
        { queryKey: taskKeys.lists() },
        (old: any) => {
          if (!old) return old
          return old.map((task: any) =>
            task.id === taskId ? { ...task, status } : task
          )
        }
      )

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
          .select(`
            *,
            analysis:task_analyses(*)
          `)
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
      queryClient.setQueriesData(
        { queryKey: taskKeys.lists() },
        (old: any) => {
          if (!old) return old
          return old.filter((task: any) => task.id !== taskId)
        }
      )

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