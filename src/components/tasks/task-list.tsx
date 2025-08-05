'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { TaskTableGrouped } from './task-table-grouped'
import { TaskListGrouped } from './task-list-grouped'
import { TaskListLinear } from './task-list-linear'
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
import { useQuickAddShortcut } from '@/hooks/use-keyboard-shortcuts'
import { useFilterPersistence } from '@/hooks/use-filter-persistence'
import { GroupManagementDialog } from '@/components/tasks/group-management-dialog'
import { useCreateTaskGroup, useUpdateTaskGroup, useDeleteTaskGroup } from '@/hooks/use-task-groups'
import { useTaskPolling } from '@/hooks/use-task-polling'
import { TaskKanbanView } from './task-kanban-view'
import { useSearchParams } from 'next/navigation'
import { DuplicateReviewDialog } from './duplicate-review-dialog'
import type { TaskSimilarity } from '@/types/duplicate'
import { TaskViewTabs } from './task-view-tabs'
import { LinearFilterPanel } from './linear-filter-panel'
import { LinearDisplaySettings } from './linear-display-settings'
import type { DisplaySettings } from '@/types/display'

export function TaskList() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  
  // Get search query from URL
  const searchQuery = searchParams.get('search') || ''
  
  // Filter states with persistence
  const { filters, updateFilter, resetFilters, isInitialized } = useFilterPersistence()
  const [currentPage, setCurrentPage] = useState(1)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [activeView, setActiveView] = useState<'all' | 'active' | 'backlog'>('all')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showDisplaySettings, setShowDisplaySettings] = useState(false)
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    view: 'list',
    grouping: 'status',
    ordering: 'priority',
    orderDirection: 'desc',
    showCompletedByRecency: true,
    completedIssues: 'all',
    showEmptyGroups: false
  })
  const itemsPerPage = 20
  
  // Duplicate review state
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
      // View filter (All, Active, Backlog)
      if (activeView === 'active' && !['todo', 'in_progress'].includes(task.status)) return false
      if (activeView === 'backlog' && task.status !== 'backlog') return false
      
      // Status filter
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
      
      // Completed issues filter
      if (displaySettings.completedIssues === 'hide' && task.status === 'done') return false
      if (displaySettings.completedIssues === 'recent' && task.status === 'done') {
        const completedDate = new Date(task.updated_at)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        if (completedDate < sevenDaysAgo) return false
      }
      
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      // If ordering completed by recency and both are done, sort by update date
      if (displaySettings.showCompletedByRecency && 
          a.status === 'done' && b.status === 'done') {
        comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        return comparison
      }
      
      switch (displaySettings.ordering) {
        case 'priority':
          // Use ICE score if available, fallback to priority
          const aScore = a.analysis?.ice_score || (a.analysis?.priority || 0) * 10
          const bScore = b.analysis?.ice_score || (b.analysis?.priority || 0) * 10
          comparison = aScore - bScore
          break
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'status':
          const statusOrder = { 
            backlog: 0, 
            todo: 1, 
            in_progress: 2, 
            done: 3, 
            canceled: 4, 
            duplicate: 5,
            // Legacy mappings
            pending: 1,
            completed: 3,
            blocked: 4
          }
          comparison = (statusOrder[a.status as keyof typeof statusOrder] || 999) - 
                      (statusOrder[b.status as keyof typeof statusOrder] || 999)
          break
      }
      
      return displaySettings.orderDirection === 'asc' ? comparison : -comparison
    })
  
  // Calculate counts for tabs
  const taskCounts = {
    all: processedTasks?.length || 0,
    active: processedTasks?.filter(t => ['todo', 'in_progress'].includes(t.status)).length || 0,
    backlog: processedTasks?.filter(t => t.status === 'backlog').length || 0
  }
  
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
      <Card className="rounded-lg shadow-sm">
        <div className="border-b">
          {/* Task View Tabs */}
          <TaskViewTabs
            activeView={activeView}
            onViewChange={setActiveView}
            counts={taskCounts}
          />
        </div>
        
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between gap-4">
            {/* Search and Actions */}
            <div className="flex items-center gap-2 flex-1">
              {/* Filter Button */}
              <LinearFilterPanel
                filters={filters}
                onFiltersChange={(newFilters) => {
                  Object.entries(newFilters).forEach(([key, value]) => {
                    updateFilter(key as any, value)
                  })
                }}
                isOpen={showFilterPanel}
                onOpenChange={setShowFilterPanel}
              />
              
              {/* Display Settings */}
              <LinearDisplaySettings
                settings={displaySettings}
                onSettingsChange={setDisplaySettings}
                isOpen={showDisplaySettings}
                onOpenChange={setShowDisplaySettings}
              />
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center gap-2">
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          {error ? (
            <div className="p-6">
              <ErrorState
                title="Failed to load tasks"
                message={error ? String(error) : 'An error occurred'}
                onRetry={() => window.location.reload()}
              />
            </div>
          ) : (
            <>
              
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
                <div>
                  {displaySettings.view === 'board' ? (
                    <TaskKanbanView
                      tasks={filteredAndSortedTasks}
                      onUpdateStatus={(taskId, status) => 
                        updateStatusMutation.mutate({ taskId, status })
                      }
                      onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
                      searchQuery={searchQuery}
                    />
                  ) : (
                    <TaskListLinear
                      tasks={filteredAndSortedTasks}
                      displaySettings={displaySettings}
                      onUpdateStatus={(taskId, status) => 
                        updateStatusMutation.mutate({ taskId, status })
                      }
                      onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
                      searchQuery={searchQuery}
                    />
                  )}
                </div>
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
      {duplicateReviewData && (
        <DuplicateReviewDialog
          isOpen={showDuplicateReview}
          onClose={() => {
            setShowDuplicateReview(false)
            // Delay clearing data to prevent unmounting during animation
            setTimeout(() => setDuplicateReviewData(null), 200)
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
              console.log('[GROUPING] Action received:', action)
              console.log('[GROUPING] Selected task IDs:', action.selectedTaskIds)
              
              // Store the data we need before clearing state
              const newTaskId = duplicateReviewData.newTask.id
              const selectedTaskIds = action.selectedTaskIds
              
              // Close the dialog immediately for better UX  
              console.log('[GROUPING] Closing dialog immediately')
              setShowDuplicateReview(false)
              // Don't clear data immediately to prevent component unmounting
              
              // Handle grouping in the background - DON'T AWAIT to prevent dialog re-render
              setTimeout(async () => {
                try {
                  const allTaskIds = [newTaskId, ...selectedTaskIds]
                  console.log('[GROUPING] Grouping tasks:', allTaskIds)
                  
                  await createGroupMutation.mutateAsync({ 
                    name: 'Similar Tasks',
                    taskIds: allTaskIds 
                  })
                  
                  toast.success('Tasks grouped successfully!')
                  
                  // Refresh data after success
                  setTimeout(() => {
                    queryClient.removeQueries({ queryKey: ['tasks'] })
                    queryClient.removeQueries({ queryKey: ['task-groups'] })
                    queryClient.refetchQueries({ queryKey: ['tasks'] })
                  }, 500)
                  
                } catch (error) {
                  console.error('Failed to group tasks:', error)
                  toast.error('Failed to group tasks')
                }
              }, 100)
            } else if (action.action === 'create_new') {
              // Just close the dialog for create new
              setShowDuplicateReview(false)
            } else if (action.action === 'cancel') {
              // Cancel - don't create the task at all
              setShowDuplicateReview(false)
              // TODO: We might need to delete the newly created task here
            }
          }}
        />
      )}
    </div>
  )
}