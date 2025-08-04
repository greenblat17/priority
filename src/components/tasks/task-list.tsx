'use client'

import { useState, useEffect } from 'react'
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
import { NoTasksEmptyState, NoFilterResultsEmptyState, NoSearchResultsEmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { QuickAddModal } from '@/components/tasks/quick-add-modal'
import { SearchInput } from '@/components/ui/search-input'
import { searchTasks } from '@/lib/search-utils'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { BulkActionsBar } from '@/components/tasks/bulk-actions-bar'
import { useBulkUpdateTaskStatus, useBulkDeleteTasks } from '@/hooks/use-tasks'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import { useQuickAddShortcut } from '@/hooks/use-keyboard-shortcuts'
import { useFilterPersistence } from '@/hooks/use-filter-persistence'
import { GroupManagementDialog } from '@/components/tasks/group-management-dialog'
import { useCreateTaskGroup, useUpdateTaskGroup, useDeleteTaskGroup } from '@/hooks/use-task-groups'
import { useTaskPolling } from '@/hooks/use-task-polling'
import { TaskKanbanView } from './task-kanban-view'
import { ViewToggle } from './view-toggle'
import { useSearchParams } from 'next/navigation'
import { DuplicateReviewDialog } from './duplicate-review-dialog'
import type { TaskSimilarity } from '@/types/duplicate'

export function TaskList() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  // Filter states with persistence
  const { filters, updateFilter, resetFilters, isInitialized } = useFilterPersistence()
  const [currentPage, setCurrentPage] = useState(1)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const itemsPerPage = 20
  
  // Duplicate review state
  const searchParams = useSearchParams()
  const [showDuplicateReview, setShowDuplicateReview] = useState(false)
  const [duplicateReviewData, setDuplicateReviewData] = useState<{
    newTask: TaskWithAnalysis
    duplicates: TaskWithAnalysis[]
    similarities: Array<{ taskId: string; similarity: number }>
  } | null>(null)

  // Quick add keyboard shortcut
  useQuickAddShortcut(() => setShowQuickAdd(true))
  
  // Check for duplicate review on mount and listen for custom event
  useEffect(() => {
    // Check URL param on mount
    if (searchParams.get('showDuplicateReview') === 'true') {
      const data = sessionStorage.getItem('duplicateReviewData')
      if (data) {
        const parsed = JSON.parse(data)
        setDuplicateReviewData(parsed)
        setShowDuplicateReview(true)
        sessionStorage.removeItem('duplicateReviewData')
        // Remove the URL param
        const url = new URL(window.location.href)
        url.searchParams.delete('showDuplicateReview')
        window.history.replaceState({}, '', url)
      }
    }

    // Listen for custom event to open duplicate review
    const handleOpenDuplicateReview = (event: CustomEvent) => {
      console.log('[TaskList] Received openDuplicateReview event:', event.detail)
      if (event.detail) {
        setDuplicateReviewData(event.detail)
        setShowDuplicateReview(true)
      }
    }

    window.addEventListener('openDuplicateReview', handleOpenDuplicateReview as EventListener)
    
    return () => {
      window.removeEventListener('openDuplicateReview', handleOpenDuplicateReview as EventListener)
    }
  }, [searchParams])

  // Use optimized task hooks
  const { data: tasks, isLoading, error } = useTasks({
    status: filters.status !== 'all' ? filters.status : undefined,
    category: filters.category !== 'all' ? filters.category : undefined,
    sortBy: filters.sortBy === 'date' ? 'date' : 'priority',
    page: currentPage,
    limit: itemsPerPage,
  })

  const updateStatusMutation = useUpdateTaskStatus()
  const bulkUpdateStatusMutation = useBulkUpdateTaskStatus()
  const bulkDeleteMutation = useBulkDeleteTasks()
  
  // Group management mutations
  const createGroupMutation = useCreateTaskGroup()
  const updateGroupMutation = useUpdateTaskGroup()
  const deleteGroupMutation = useDeleteTaskGroup()

  // Use the enhanced delete mutation from use-tasks
  const deleteTaskMutation = useDeleteTask()
  
  // Use polling as a fallback for real-time updates
  useTaskPolling(tasks)

  // Reset page when filters change
  const handleFilterChange = <K extends keyof typeof filters>(key: K) => (value: typeof filters[K]) => {
    setCurrentPage(1)
    updateFilter(key, value)
  }

  // Filter, search and sort tasks
  const processedTasks = tasks ? searchTasks(tasks, searchQuery) : []
  
  // Bulk selection hook
  const {
    selectedIds,
    selectedItems,
    toggleSelection,
    toggleAll,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
    selectedCount
  } = useBulkSelection(processedTasks)
  
  const filteredAndSortedTasks = processedTasks
    ?.filter(task => {
      if (filters.status !== 'all' && task.status !== filters.status) return false
      if (filters.category !== 'all' && task.analysis?.category !== filters.category) return false
      
      // Confidence filter
      if (filters.confidence !== 'all' && task.analysis) {
        const confidence = task.analysis.confidence_score || 0
        switch (filters.confidence) {
          case 'high':
            if (confidence < 80) return false
            break
          case 'medium':
            if (confidence < 50 || confidence >= 80) return false
            break
          case 'low':
            if (confidence >= 50) return false
            break
        }
      }
      
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
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
      
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })
  
  // Calculate total pages (will be improved with server-side count)
  const totalPages = Math.ceil((filteredAndSortedTasks?.length || 0) / itemsPerPage)
  
  // Extract unique groups from tasks based on group ID
  const taskGroups = tasks ? 
    Array.from(
      tasks
        .filter(t => t.group)
        .reduce((groupMap, task) => {
          groupMap.set(task.group!.id, task.group!);
          return groupMap;
        }, new Map<string, TaskGroupType>())
        .values()
    )
    : []
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement
      const isFormTag = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || 
                       target.isContentEditable
      
      // Cmd/Ctrl + A to select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && filteredAndSortedTasks.length > 0) {
        e.preventDefault()
        toggleAll()
      }
      // Escape to clear selection
      if (e.key === 'Escape' && selectedCount > 0) {
        clearSelection()
      }
      // V to toggle view (when not in input)
      if (e.key === 'v' && !isFormTag && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        const currentView = filters.view || 'table'
        const newView = currentView === 'table' ? 'kanban' : 'table'
        updateFilter('view', newView)
        toast.success(`Switched to ${newView} view`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleAll, clearSelection, selectedCount, filteredAndSortedTasks, filters.view, updateFilter])

  if (isLoading || !isInitialized) {
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
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search tasks by description, category, priority, or status..."
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <ViewToggle 
                view={filters.view || 'table'} 
                onViewChange={(view) => updateFilter('view', view)} 
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGroupDialog(true)}
                disabled={!tasks || tasks.length === 0}
                className="h-9"
              >
                <Users className="h-4 w-4 mr-1" />
                Groups
              </Button>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {filteredAndSortedTasks?.length || 0} tasks
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <ErrorState
              title="Failed to load tasks"
              message={error ? String(error) : 'An error occurred'}
              onRetry={() => window.location.reload()}
            />
          ) : (
            <>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-4">
                  Found {filteredAndSortedTasks?.length || 0} results for "{searchQuery}"
                </p>
              )}
              
              <TaskFilters
                statusFilter={filters.status}
                setStatusFilter={handleFilterChange('status')}
                categoryFilter={filters.category}
                setCategoryFilter={handleFilterChange('category')}
                confidenceFilter={filters.confidence || 'all'}
                setConfidenceFilter={handleFilterChange('confidence')}
                sortBy={filters.sortBy}
                setSortBy={(value) => updateFilter('sortBy', value)}
                sortOrder={filters.sortOrder}
                setSortOrder={(value) => updateFilter('sortOrder', value)}
              />
              
              {/* Show empty state based on context */}
              {!isLoading && filteredAndSortedTasks?.length === 0 && (
                <>
                  {tasks?.length === 0 ? (
                    <NoTasksEmptyState onCreateTask={() => setShowQuickAdd(true)} />
                  ) : searchQuery ? (
                    <NoSearchResultsEmptyState />
                  ) : (
                    <NoFilterResultsEmptyState 
                      onClearFilters={() => {
                        resetFilters()
                        setSearchQuery('')
                      }} 
                    />
                  )}
                </>
              )}
              
              {/* Show tasks table or kanban view when there are tasks */}
              {filteredAndSortedTasks && filteredAndSortedTasks.length > 0 && (
                filters.view === 'kanban' ? (
                  <TaskKanbanView
                    tasks={filteredAndSortedTasks}
                    onUpdateStatus={(taskId, status) => 
                      updateStatusMutation.mutate({ taskId, status })
                    }
                    onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
                    searchQuery={searchQuery}
                  />
                ) : (
                  <TaskTableGrouped
                    tasks={filteredAndSortedTasks}
                    onUpdateStatus={(taskId, status) => 
                      updateStatusMutation.mutate({ taskId, status })
                    }
                    onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
                    searchQuery={searchQuery}
                    selectedIds={selectedIds}
                    onToggleSelection={toggleSelection}
                    onToggleAll={toggleAll}
                    isAllSelected={isAllSelected}
                    isPartiallySelected={isPartiallySelected}
                  />
                )
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
        isOpen={showQuickAdd} 
        onClose={() => setShowQuickAdd(false)} 
      />
      
      {/* Group Management Dialog */}
      <GroupManagementDialog
        open={showGroupDialog}
        onOpenChange={setShowGroupDialog}
        groups={taskGroups}
        tasks={tasks || []}
        onCreateGroup={(name, taskIds) => {
          createGroupMutation.mutate({ name, taskIds })
        }}
        onUpdateGroup={(groupId, name) => {
          updateGroupMutation.mutate({ groupId, name })
        }}
        onDeleteGroup={(groupId) => {
          deleteGroupMutation.mutate(groupId)
        }}
      />
      
      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onUpdateStatus={(status) => {
          bulkUpdateStatusMutation.mutate({ 
            taskIds: Array.from(selectedIds), 
            status 
          })
          clearSelection()
        }}
        onDelete={() => {
          if (confirm(`Are you sure you want to delete ${selectedCount} tasks?`)) {
            bulkDeleteMutation.mutate(Array.from(selectedIds))
            clearSelection()
          }
        }}
      />
      
      {/* Duplicate Review Dialog */}
      {showDuplicateReview && duplicateReviewData && (
        <DuplicateReviewDialog
          isOpen={showDuplicateReview}
          onClose={() => {
            setShowDuplicateReview(false)
            setDuplicateReviewData(null)
          }}
          newTaskDescription={duplicateReviewData.newTask.description}
          potentialDuplicates={duplicateReviewData.similarities.map(sim => {
            const task = duplicateReviewData.duplicates.find(d => d.id === sim.taskId)
            return {
              taskId: sim.taskId,
              task: task!,
              similarity: sim.similarity,
              embedding: []
            } as TaskSimilarity
          })}
          onAction={async (action) => {
            if (action.action === 'create_and_group' && 'selectedTaskIds' in action) {
              // Group tasks
              const allTaskIds = [duplicateReviewData.newTask.id, ...action.selectedTaskIds]
              await createGroupMutation.mutateAsync({ 
                name: 'Similar Tasks',
                taskIds: allTaskIds 
              })
              
              toast.success('Tasks grouped successfully!')
              queryClient.invalidateQueries({ queryKey: ['tasks'] })
            }
            setShowDuplicateReview(false)
            setDuplicateReviewData(null)
          }}
        />
      )}
    </div>
  )
}