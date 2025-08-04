import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Task } from '@/types/task'

// Fetch tasks linked to a page
export function usePageTasks(pageId: string | undefined) {
  return useQuery<Task[]>({
    queryKey: ['pages', pageId, 'tasks'],
    queryFn: async () => {
      if (!pageId) return []
      
      const response = await fetch(`/api/pages/${pageId}/tasks`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch page tasks')
      }
      
      const { tasks } = await response.json()
      return tasks
    },
    enabled: !!pageId,
  })
}

// Link a task to a page
export function useLinkTask(pageId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/pages/${pageId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to link task')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', pageId, 'tasks'] })
      toast.success('Task linked successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to link task')
    },
  })
}

// Unlink a task from a page
export function useUnlinkTask(pageId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/pages/${pageId}/tasks/${taskId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to unlink task')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', pageId, 'tasks'] })
      toast.success('Task unlinked successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to unlink task')
    },
  })
}