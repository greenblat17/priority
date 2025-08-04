'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MoreHorizontal, AlertCircle } from 'lucide-react'
import { PriorityDot } from './priority-dot'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TaskDetailPanel } from './task-detail-panel'
import { ConfidenceBadge } from './confidence-badge'
import { TaskWithAnalysis, TaskStatusType, TaskStatus } from '@/types/task'
import { TaskGroup as TaskGroupType } from '@/types/task-group'
import { cn } from '@/lib/utils'
import { getSourceLabel } from '@/lib/task-source-utils'
import { toast } from 'sonner'

// Use TaskWithAnalysis directly since it now includes group
type TaskWithGroup = TaskWithAnalysis & {
  group: TaskGroupType | null
}

interface TaskKanbanViewProps {
  tasks: TaskWithGroup[]
  onUpdateStatus: (taskId: string, status: TaskStatusType) => void
  onDeleteTask: (taskId: string) => void
  searchQuery?: string
}

const statusColumns = [
  { 
    id: TaskStatus.PENDING, 
    label: 'Pending', 
    color: 'bg-muted/20',
    dotColor: 'bg-muted-foreground/60'
  },
  { 
    id: TaskStatus.IN_PROGRESS, 
    label: 'In Progress', 
    color: 'bg-primary/5',
    dotColor: 'bg-primary'
  },
  { 
    id: TaskStatus.COMPLETED, 
    label: 'Completed', 
    color: 'bg-muted/20',
    dotColor: 'bg-emerald-500'
  },
  { 
    id: TaskStatus.BLOCKED, 
    label: 'Blocked', 
    color: 'bg-muted/20',
    dotColor: 'bg-destructive'
  },
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
      className={cn(
        "group cursor-move hover:shadow-sm hover:scale-[1.02] transition-all duration-200 bg-background/95 border-0 shadow-sm",
        task.analysis?.confidence_score && task.analysis.confidence_score < 50 && "ring-1 ring-destructive/20",
        draggedTask?.id === task.id && "opacity-50 scale-95"
      )}
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onClick={() => setSelectedTask(task)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-5 mb-1">{task.description}</p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <PriorityDot priority={task.analysis?.priority} />
              
              {task.analysis?.estimated_hours && (
                <span>{task.analysis.estimated_hours}h</span>
              )}

              {task.analysis?.confidence_score !== undefined && task.analysis?.confidence_score !== null && task.analysis.confidence_score < 50 && (
                <AlertCircle className="h-3 w-3 text-destructive" />
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
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
                "rounded-2xl p-4 min-h-[600px] transition-all duration-300",
                column.color,
                isDropTarget && "ring-1 ring-primary/50 scale-[1.01]"
              )}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-6 pb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full transition-colors duration-200", column.dotColor)} />
                  <h3 className="font-medium text-sm text-foreground/90">{column.label}</h3>
                </div>
                <span className="text-xs text-muted-foreground/80 font-medium px-1.5 py-0.5 rounded-full bg-muted/50">
                  {columnTasks.length}
                </span>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="pr-3 space-y-2">
                  {columnTasks.map((task, index) => (
                    <div
                      key={task.id}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                      className="animate-in slide-in-from-top-2 duration-300"
                    >
                      {renderTask(task)}
                    </div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="flex items-center justify-center h-32 group-hover:h-40 transition-all duration-300">
                      <div className="text-center">
                        <div className={cn("w-3 h-3 rounded-full mx-auto mb-2 opacity-30", column.dotColor)} />
                        <p className="text-xs text-muted-foreground/60">Drop tasks here</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )
        })}
      </div>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </>
  )
}