'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { TaskTableGrouped } from './task-table-grouped'
import { TaskFilters } from './task-filters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { TaskWithAnalysis } from '@/types/task'
import { TaskGroup as TaskGroupType } from '@/types/task-group'
import { useTasks, useUpdateTaskStatus, useDeleteTask } from '@/hooks/use-tasks'
import { SkeletonTaskTable } from '@/components/ui/skeleton-task-table'
import { Pagination } from '@/components/ui/pagination'
import { NoTasksEmptyState, NoFilterResultsEmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { QuickAddModal } from '@/components/tasks/quick-add-modal'

export function TaskList() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'status'>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const itemsPerPage = 20

  // Use optimized task hooks
  const { data: tasks, isLoading, error } = useTasks({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    sortBy: sortBy === 'date' ? 'date' : 'priority',
    page: currentPage,
    limit: itemsPerPage,
  })

  const updateStatusMutation = useUpdateTaskStatus()

  // Use the enhanced delete mutation from use-tasks
  const deleteTaskMutation = useDeleteTask()

  // Reset page when filters change
  const handleFilterChange = (filterSetter: (value: string) => void) => (value: string) => {
    setCurrentPage(1)
    filterSetter(value)
  }

  // Filter and sort tasks (client-side for now, will move to server)
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
          comparison = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  
  // Calculate total pages (will be improved with server-side count)
  const totalPages = Math.ceil((filteredAndSortedTasks?.length || 0) / itemsPerPage)

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
              <Skeleton className="h-4 w-[80px]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Skeleton className="h-10 w-full" />
            </div>
            <SkeletonTaskTable />
          </CardContent>
        </Card>
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
          {error ? (
            <ErrorState
              title="Failed to load tasks"
              message={error.message}
              onRetry={() => window.location.reload()}
            />
          ) : (
            <>
              <TaskFilters
                statusFilter={statusFilter}
                setStatusFilter={handleFilterChange(setStatusFilter)}
                categoryFilter={categoryFilter}
                setCategoryFilter={handleFilterChange(setCategoryFilter)}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
              
              {/* Show empty state based on context */}
              {!isLoading && filteredAndSortedTasks?.length === 0 && (
                <>
                  {tasks?.length === 0 ? (
                    <NoTasksEmptyState onCreateTask={() => setShowQuickAdd(true)} />
                  ) : (
                    <NoFilterResultsEmptyState 
                      onClearFilters={() => {
                        setStatusFilter('all')
                        setCategoryFilter('all')
                      }} 
                    />
                  )}
                </>
              )}
              
              {/* Show tasks table when there are tasks */}
              {filteredAndSortedTasks && filteredAndSortedTasks.length > 0 && (
                <TaskTableGrouped
                  tasks={filteredAndSortedTasks}
                  onUpdateStatus={(taskId, status) => 
                    updateStatusMutation.mutate({ taskId, status })
                  }
                  onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
                />
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Add Modal */}
      <QuickAddModal 
        open={showQuickAdd} 
        onOpenChange={setShowQuickAdd} 
      />
    </div>
  )
}