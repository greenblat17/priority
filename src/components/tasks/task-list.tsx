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
import { ExportDialog } from '@/components/tasks/export-dialog'
import { Button } from '@/components/ui/button'
import { Download, Users } from 'lucide-react'
import { useFilterPersistence } from '@/hooks/use-filter-persistence'
import { GroupManagementDialog } from '@/components/tasks/group-management-dialog'
import { useCreateTaskGroup, useUpdateTaskGroup, useDeleteTaskGroup } from '@/hooks/use-task-groups'

export function TaskList() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  // Filter states with persistence
  const { filters, updateFilter, resetFilters, isInitialized } = useFilterPersistence()
  const [currentPage, setCurrentPage] = useState(1)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const itemsPerPage = 20

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
      if (filters.category !== 'all' && task.analysis?.[0]?.category !== filters.category) return false
      
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
      // Cmd/Ctrl + A to select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && filteredAndSortedTasks.length > 0) {
        e.preventDefault()
        toggleAll()
      }
      // Escape to clear selection
      if (e.key === 'Escape' && selectedCount > 0) {
        clearSelection()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleAll, clearSelection, selectedCount, filteredAndSortedTasks])

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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                AI-prioritized tasks based on business impact
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGroupDialog(true)}
                disabled={!tasks || tasks.length === 0}
              >
                <Users className="h-4 w-4 mr-1" />
                Groups
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
                disabled={!filteredAndSortedTasks || filteredAndSortedTasks.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <div className="text-sm text-muted-foreground">
                {filteredAndSortedTasks?.length || 0} tasks
              </div>
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
              {/* Search bar */}
              <div className="mb-4">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search tasks by description, category, priority, or status..."
                  className="max-w-md"
                />
                {searchQuery && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Found {filteredAndSortedTasks?.length || 0} results for "{searchQuery}"
                  </p>
                )}
              </div>
              
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
              
              {/* Show tasks table when there are tasks */}
              {filteredAndSortedTasks && filteredAndSortedTasks.length > 0 && (
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
      
      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        tasks={filteredAndSortedTasks || []}
        selectedTasks={selectedItems}
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
        onExport={() => setShowExportDialog(true)}
      />
    </div>
  )
}