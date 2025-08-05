'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TaskDetailPanel } from './task-detail-panel'
import { TaskEditDialog } from './task-edit-dialog'
import { TaskGroup } from './task-group'
import { ConfidenceBadge } from './confidence-badge'
import { PriorityDot } from './priority-dot'
import { TaskStatusDropdown } from './task-status-dropdown'
import { ICEScoreBadge } from './ice-score-badge'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { TaskWithAnalysis, TaskStatusType } from '@/types/task'
import { TaskGroup as TaskGroupType } from '@/types/task-group'
import { highlightSearchTerm } from '@/lib/search-utils'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { getSourceLabel } from '@/lib/task-source-utils'
import { useBulkUpdateTaskStatus, useBulkDeleteTasks } from '@/hooks/use-tasks'
import { useTaskListNavigation } from '@/hooks/use-keyboard-shortcuts'

// Use TaskWithAnalysis directly since it now includes group
type TaskWithGroup = TaskWithAnalysis & {
  group: TaskGroupType | null
}

interface TaskTableGroupedProps {
  tasks: TaskWithGroup[]
  onUpdateStatus: (taskId: string, status: TaskStatusType) => void
  onDeleteTask: (taskId: string) => void
  searchQuery?: string
  selectedIds?: Set<string>
  onToggleSelection?: (taskId: string) => void
  onToggleAll?: () => void
  isAllSelected?: boolean
  isPartiallySelected?: boolean
  hideHeader?: boolean
}

export function TaskTableGrouped({ 
  tasks, 
  onUpdateStatus, 
  onDeleteTask, 
  searchQuery = '',
  selectedIds,
  onToggleSelection,
  onToggleAll,
  isAllSelected = false,
  isPartiallySelected = false,
  hideHeader = false
}: TaskTableGroupedProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithAnalysis | null>(null)
  const [editingTask, setEditingTask] = useState<TaskWithAnalysis | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const bulkUpdateStatus = useBulkUpdateTaskStatus()
  const bulkDelete = useBulkDeleteTasks()

  // Flatten all tasks for keyboard navigation
  const allTasks = tasks.reduce<TaskWithAnalysis[]>((acc, task) => {
    return [...acc, task]
  }, [])

  // Keyboard navigation
  useTaskListNavigation(
    allTasks,
    selectedIndex,
    setSelectedIndex,
    (task) => setSelectedTask(task)
  )

  // Additional keyboard shortcuts for task actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement
      const isFormTag = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || 
                       target.isContentEditable
      
      if (isFormTag) return

      const selectedTask = allTasks[selectedIndex]
      
      // X - Toggle selection
      if (e.key === 'x' && selectedTask && onToggleSelection) {
        e.preventDefault()
        onToggleSelection(selectedTask.id)
      }
      
      // Space - Toggle task status
      if (e.key === ' ' && selectedTask) {
        e.preventDefault()
        const newStatus = selectedTask.status === 'done' ? 'todo' : 'done'
        onUpdateStatus(selectedTask.id, newStatus as TaskStatusType)
        toast.success(`Task marked as ${newStatus.replace('_', ' ')}`)
      }
      
      // D - Delete selected tasks
      if (e.key === 'd' && !e.metaKey && !e.ctrlKey && selectedIds && selectedIds.size > 0) {
        e.preventDefault()
        const count = selectedIds.size
        const taskIds = Array.from(selectedIds)
        
        toast.promise(bulkDelete.mutateAsync(taskIds), {
          loading: `Deleting ${count} task${count > 1 ? 's' : ''}...`,
          success: `Deleted ${count} task${count > 1 ? 's' : ''}`,
          error: 'Failed to delete tasks'
        })
      }
      
      // E - Edit selected task (open detail dialog)
      if (e.key === 'e' && selectedTask) {
        e.preventDefault()
        setSelectedTask(selectedTask)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, allTasks, onToggleSelection, onUpdateStatus, selectedIds, bulkDelete])

  const copySpec = (spec: string) => {
    navigator.clipboard.writeText(spec)
    toast.success('Implementation spec copied to clipboard')
  }

  const getCategoryVariant = (category?: string | null) => {
    switch (category) {
      case 'bug':
        return 'destructive'
      case 'feature':
        return 'default'
      case 'improvement':
        return 'secondary'
      case 'business':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'done':
        return 'default'
      case 'in_progress':
        return 'secondary'
      case 'canceled':
        return 'destructive'
      case 'duplicate':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getComplexityColor = (complexity?: string | null) => {
    switch (complexity) {
      case 'easy':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'hard':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  const getPriorityColor = (priority?: number | null) => {
    if (!priority) return 'text-gray-500'
    if (priority >= 8) return 'text-red-600 font-semibold'
    if (priority >= 6) return 'text-orange-600 font-semibold'
    if (priority >= 4) return 'text-yellow-600'
    return 'text-gray-600'
  }

  // Group tasks by their group_id
  const groupedTasks = tasks.reduce((acc, task) => {
    const groupId = task.group?.id || 'ungrouped'
    if (!acc[groupId]) {
      acc[groupId] = {
        group: task.group,
        tasks: []
      }
    }
    acc[groupId].tasks.push(task)
    return acc
  }, {} as Record<string, { group: TaskGroupType | null; tasks: TaskWithGroup[] }>)

  // Debug logging
  console.log('[TASK TABLE] Total tasks:', tasks.length)
  console.log('[TASK TABLE] Grouped tasks:', Object.keys(groupedTasks).map(key => ({
    groupId: key,
    taskCount: groupedTasks[key].tasks.length,
    groupName: groupedTasks[key].group?.name
  })))

  // Render a single task row
  const renderTaskRow = (task: TaskWithAnalysis, index?: number) => {
    const isSelected = selectedIds?.has(task.id) || false
    const taskIndex = index !== undefined ? index : allTasks.findIndex(t => t.id === task.id)
    const isKeyboardSelected = taskIndex === selectedIndex
    
    return (
    <TableRow 
      key={task.id}
      className={cn(
        "group cursor-pointer hover:bg-gray-50 transition-colors duration-75 h-10",
        task.analysis?.confidence_score && task.analysis.confidence_score < 50 && "bg-destructive/5 hover:bg-destructive/10",
        isSelected && "bg-muted/50 hover:bg-muted/60",
        isKeyboardSelected && "ring-2 ring-primary ring-inset"
      )}
      onClick={(e) => {
        // Don't open detail dialog if clicking checkbox
        if ((e.target as HTMLElement).closest('[data-checkbox]')) return
        setSelectedTask(task)
      }}
      aria-selected={isKeyboardSelected}
    >
      {onToggleSelection && (
        <TableCell className="w-[30px] px-1" data-checkbox>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(task.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4"
          />
        </TableCell>
      )}
      <TableCell className="font-medium">
        <div className="max-w-md">
          <div className="text-sm truncate">{searchQuery ? highlightSearchTerm(task.description, searchQuery) : task.description}</div>
          {task.source && (
            <div className="text-xs text-muted-foreground">
              Source: {searchQuery ? highlightSearchTerm(getSourceLabel(task.source), searchQuery) : getSourceLabel(task.source)}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="w-[120px]">
        <Badge variant={getCategoryVariant(task.analysis?.category)} className="text-xs">
          <span>{searchQuery && task.analysis?.category ? highlightSearchTerm(task.analysis.category, searchQuery) : (task.analysis?.category || 'pending')}</span>
        </Badge>
      </TableCell>
      <TableCell className="w-[100px]">
        <ICEScoreBadge
          impact={task.analysis?.ice_impact}
          confidence={task.analysis?.ice_confidence}
          ease={task.analysis?.ice_ease}
          score={task.analysis?.ice_score}
          size="sm"
        />
      </TableCell>
      <TableCell className="w-[120px]">
        <span className={cn("text-xs", getComplexityColor(task.analysis?.complexity))}>
          {task.analysis?.complexity || 'analyzing'}
        </span>
        {task.analysis?.estimated_hours && (
          <span className="text-xs text-muted-foreground ml-1">
            ({task.analysis.estimated_hours}h)
          </span>
        )}
      </TableCell>
      <TableCell className="w-[100px]">
        {task.analysis?.confidence_score !== undefined && task.analysis.confidence_score !== null ? (
          <ConfidenceBadge 
            score={task.analysis.confidence_score} 
            showWarning={true}
            size="sm"
          />
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="w-[120px]">
        <TaskStatusDropdown
          taskId={task.id}
          currentStatus={task.status}
          onStatusChange={(newStatus) => onUpdateStatus(task.id, newStatus)}
        />
      </TableCell>
      <TableCell className="w-[80px] text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" className="h-8 w-8 p-0 opacity-60 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-200">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              setSelectedTask(task)
            }}>
              View Details
            </DropdownMenuItem>
            {task.analysis?.implementation_spec && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                copySpec(task.analysis?.implementation_spec || '')
              }}>
                Copy Spec
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              setEditingTask(task)
            }}>
              <Edit className="h-3.5 w-3.5 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteTask(task.id)
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tasks found. Create your first task to get started!</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        {!hideHeader && (
          <TableHeader>
            <TableRow className="border-0">
              {onToggleAll && (
                <TableHead className="w-[30px] px-1">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={onToggleAll}
                    data-state={isPartiallySelected && !isAllSelected ? "indeterminate" : undefined}
                    className="h-4 w-4"
                  />
                </TableHead>
              )}
              <TableHead>Task</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[100px]">ICE Score</TableHead>
              <TableHead className="w-[120px]">Complexity</TableHead>
              <TableHead className="w-[100px]">Confidence</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {/* First render ungrouped tasks */}
          {groupedTasks.ungrouped && groupedTasks.ungrouped.tasks.map((task, idx) => {
            const index = allTasks.findIndex(t => t.id === task.id)
            return renderTaskRow(task, index)
          })}
          
          {/* Then render grouped tasks */}
          {Object.entries(groupedTasks)
            .filter(([key]) => key !== 'ungrouped')
            .map(([groupId, { group, tasks }]) => (
              <TaskGroup
                key={groupId}
                group={group!}
                tasks={tasks}
                renderTask={(task) => {
                  const index = allTasks.findIndex(t => t.id === task.id)
                  return renderTaskRow(task, index)
                }}
                hasCheckboxes={!!onToggleSelection}
                onBulkUpdateStatus={(taskIds, status) => {
                  bulkUpdateStatus.mutate({ taskIds, status })
                }}
                onBulkDelete={(taskIds) => {
                  bulkDelete.mutate(taskIds)
                }}
              />
            ))}
        </TableBody>
      </Table>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}

      {editingTask && (
        <TaskEditDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}
    </>
  )
}