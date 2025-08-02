'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MoreHorizontal, GripVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TaskDetailDialog } from './task-detail-dialog'
import { ConfidenceBadge } from './confidence-badge'
import { TaskWithAnalysis, TaskStatusType, TaskStatus } from '@/types/task'
import { TaskGroup as TaskGroupType } from '@/types/task-group'
import { cn } from '@/lib/utils'
import { getSourceLabel } from '@/lib/task-source-utils'
import { toast } from 'sonner'

interface TaskWithGroup extends TaskWithAnalysis {
  group: TaskGroupType | null
}

interface TaskKanbanViewProps {
  tasks: TaskWithGroup[]
  onUpdateStatus: (taskId: string, status: TaskStatusType) => void
  onDeleteTask: (taskId: string) => void
  searchQuery?: string
}

const statusColumns = [
  { id: TaskStatus.PENDING, label: 'Pending', color: 'bg-yellow-100 dark:bg-yellow-900/20' },
  { id: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/20' },
  { id: TaskStatus.COMPLETED, label: 'Completed', color: 'bg-green-100 dark:bg-green-900/20' },
  { id: TaskStatus.BLOCKED, label: 'Blocked', color: 'bg-red-100 dark:bg-red-900/20' },
] as const

export function TaskKanbanView({ 
  tasks, 
  onUpdateStatus, 
  onDeleteTask,
  searchQuery = ''
}: TaskKanbanViewProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithAnalysis | null>(null)
  const [draggedTask, setDraggedTask] = useState<TaskWithGroup | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatusType | null>(null)

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

  const getPriorityColor = (priority?: number | null) => {
    if (!priority) return 'text-gray-500'
    if (priority >= 8) return 'text-red-600 font-semibold'
    if (priority >= 6) return 'text-orange-600 font-semibold'
    if (priority >= 4) return 'text-yellow-600'
    return 'text-gray-600'
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

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = []
    }
    acc[task.status].push(task)
    return acc
  }, {} as Record<TaskStatusType, TaskWithGroup[]>)

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: TaskWithGroup) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (status: TaskStatusType) => {
    setDragOverStatus(status)
  }

  const handleDragLeave = () => {
    setDragOverStatus(null)
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatusType) => {
    e.preventDefault()
    setDragOverStatus(null)
    
    if (draggedTask && draggedTask.status !== status) {
      onUpdateStatus(draggedTask.id, status)
    }
    
    setDraggedTask(null)
  }

  const renderTask = (task: TaskWithGroup) => (
    <Card
      key={task.id}
      className={cn(
        "mb-3 cursor-move hover:shadow-md transition-shadow",
        task.analysis?.confidence_score && task.analysis.confidence_score < 50 && "border-red-200",
        draggedTask?.id === task.id && "opacity-50"
      )}
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onClick={() => setSelectedTask(task)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <p className="text-sm font-medium truncate">{task.description}</p>
            </div>
            
            {task.source && (
              <p className="text-xs text-muted-foreground mb-2">
                Source: {getSourceLabel(task.source)}
              </p>
            )}

            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant={getCategoryVariant(task.analysis?.category)} className="text-xs">
                {task.analysis?.category || 'pending'}
              </Badge>
              
              {task.analysis?.priority && (
                <span className={cn("text-xs", getPriorityColor(task.analysis.priority))}>
                  P{task.analysis.priority}
                </span>
              )}
              
              {task.analysis?.complexity && (
                <span className={cn("text-xs", getComplexityColor(task.analysis.complexity))}>
                  {task.analysis.complexity}
                </span>
              )}
              
              {task.analysis?.estimated_hours && (
                <span className="text-xs text-muted-foreground">
                  {task.analysis.estimated_hours}h
                </span>
              )}
            </div>

            {task.analysis?.confidence_score !== undefined && task.analysis.confidence_score !== null && (
              <div className="mb-1">
                <ConfidenceBadge 
                  score={task.analysis.confidence_score} 
                  showWarning={true}
                  size="sm"
                />
              </div>
            )}

            {task.group && (
              <Badge variant="outline" className="text-xs">
                {task.group.name}
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
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
              <DropdownMenuLabel className="text-sm">Update Status</DropdownMenuLabel>
              {statusColumns.map((status) => (
                <DropdownMenuItem
                  key={status.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateStatus(task.id, status.id)
                  }}
                  disabled={task.status === status.id}
                >
                  {status.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteTask(task.id)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tasks found. Create your first task to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((column) => {
          const columnTasks = tasksByStatus[column.id] || []
          const isDropTarget = dragOverStatus === column.id
          
          return (
            <div
              key={column.id}
              className={cn(
                "rounded-lg p-4 min-h-[500px]",
                column.color,
                isDropTarget && "ring-2 ring-primary ring-offset-2"
              )}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{column.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="pr-3">
                  {columnTasks.map(renderTask)}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No tasks
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )
        })}
      </div>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </>
  )
}