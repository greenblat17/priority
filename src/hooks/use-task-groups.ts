'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { taskKeys } from './use-tasks'

// Create a new task group
export function useCreateTaskGroup() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ name, taskIds }: { name: string; taskIds: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('task_groups')
        .insert({
          name,
          user_id: user.id,
        })
        .select()
        .single()

      if (groupError) throw groupError

      // Update tasks to belong to this group
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ group_id: group.id })
        .in('id', taskIds)

      if (updateError) throw updateError

      return group
    },
    onSuccess: () => {
      toast.success('Task group created')
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
    onError: () => {
      toast.error('Failed to create task group')
    },
  })
}

// Update task group name
export function useUpdateTaskGroup() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ groupId, name }: { groupId: string; name: string }) => {
      const { data, error } = await supabase
        .from('task_groups')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', groupId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Group name updated')
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
    onError: () => {
      toast.error('Failed to update group name')
    },
  })
}

// Delete task group (ungroups tasks)
export function useDeleteTaskGroup() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (groupId: string) => {
      // First, ungroup all tasks in this group
      const { error: ungroupError } = await supabase
        .from('tasks')
        .update({ group_id: null })
        .eq('group_id', groupId)

      if (ungroupError) throw ungroupError

      // Then delete the group
      const { error: deleteError } = await supabase
        .from('task_groups')
        .delete()
        .eq('id', groupId)

      if (deleteError) throw deleteError
    },
    onSuccess: () => {
      toast.success('Task group deleted')
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
    onError: () => {
      toast.error('Failed to delete task group')
    },
  })
}

// Add tasks to group
export function useAddTasksToGroup() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ groupId, taskIds }: { groupId: string; taskIds: string[] }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ group_id: groupId })
        .in('id', taskIds)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Tasks added to group')
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
    onError: () => {
      toast.error('Failed to add tasks to group')
    },
  })
}

// Remove tasks from group
export function useRemoveTasksFromGroup() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (taskIds: string[]) => {
      const { error } = await supabase
        .from('tasks')
        .update({ group_id: null })
        .in('id', taskIds)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Tasks removed from group')
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
    onError: () => {
      toast.error('Failed to remove tasks from group')
    },
  })
}