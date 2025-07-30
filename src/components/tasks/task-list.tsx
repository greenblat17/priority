'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { TaskTable } from './task-table'
import { TaskFilters } from './task-filters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { TaskWithAnalysis } from '@/types/task'

export function TaskList() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'status'>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Fetch tasks with analysis
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_analyses!task_id (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Map to TaskWithAnalysis type
      return data?.map(task => ({
        ...task,
        analysis: task.task_analyses || null
      })) as TaskWithAnalysis[]
    }
  })

  // Update task status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task status updated')
    },
    onError: (error) => {
      toast.error('Failed to update task status')
      console.error('Update error:', error)
    }
  })

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted')
    },
    onError: (error) => {
      toast.error('Failed to delete task')
      console.error('Delete error:', error)
    }
  })

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    ?.filter(task => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false
      if (categoryFilter !== 'all' && task.analysis?.category !== categoryFilter) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'priority':
          comparison = (a.analysis?.priority || 0) - (b.analysis?.priority || 0)
          break
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'status':
          const statusOrder = { pending: 0, in_progress: 1, completed: 2, blocked: 3 }
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Tasks</CardTitle>
          <CardDescription>
            There was an error loading your tasks. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                AI-prioritized tasks based on business impact
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedTasks?.length || 0} tasks
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TaskFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
          
          <TaskTable
            tasks={filteredAndSortedTasks || []}
            onUpdateStatus={(taskId, status) => 
              updateStatusMutation.mutate({ taskId, status })
            }
            onDeleteTask={(taskId) => {
              if (confirm('Are you sure you want to delete this task?')) {
                deleteTaskMutation.mutate(taskId)
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}