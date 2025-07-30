'use client'

import { useState } from 'react'
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
import { TaskDetailDialog } from './task-detail-dialog'
import { TaskGroup } from './task-group'
import { MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { TaskWithAnalysis, TaskStatusType } from '@/types/task'
import { TaskGroup as TaskGroupType } from '@/types/task-group'

interface TaskWithGroup extends TaskWithAnalysis {
  group: TaskGroupType | null
}

interface TaskTableGroupedProps {
  tasks: TaskWithGroup[]
  onUpdateStatus: (taskId: string, status: TaskStatusType) => void
  onDeleteTask: (taskId: string) => void
}

export function TaskTableGrouped({ tasks, onUpdateStatus, onDeleteTask }: TaskTableGroupedProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithAnalysis | null>(null)

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
      case 'completed':
        return 'default'
      case 'in_progress':
        return 'secondary'
      case 'blocked':
        return 'destructive'
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
    if (priority >= 8) return 'text-red-600 font-bold'
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

  // Render a single task row
  const renderTaskRow = (task: TaskWithGroup) => (
    <TableRow 
      key={task.id}
      className="cursor-pointer "
      onClick={() => setSelectedTask(task)}
    >
      <TableCell className="font-medium">
        <div className="max-w-md">
          <p className="truncate">{task.description}</p>
          {task.source && (
            <p className="text-xs text-muted-foreground mt-1">
              Source: {task.source.replace('_', ' ')}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getCategoryVariant(task.analysis?.category)}>
          {task.analysis?.category || 'pending'}
        </Badge>
      </TableCell>
      <TableCell>
        <span className={getPriorityColor(task.analysis?.priority)}>
          {task.analysis?.priority || '-'}/10
        </span>
      </TableCell>
      <TableCell>
        <span className={getComplexityColor(task.analysis?.complexity)}>
          {task.analysis?.complexity || 'analyzing'}
        </span>
        {task.analysis?.estimated_hours && (
          <span className="text-xs text-muted-foreground ml-1">
            ({task.analysis.estimated_hours}h)
          </span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={getStatusVariant(task.status)}>
          {task.status.replace('_', ' ')}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" className="h-8 w-8 p-0">
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
                copySpec(task.analysis.implementation_spec!)
              }}>
                Copy Spec
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Update Status</DropdownMenuLabel>
            {(['pending', 'in_progress', 'completed', 'blocked'] as const).map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdateStatus(task.id, status)
                }}
                disabled={task.status === status}
              >
                {status.replace('_', ' ')}
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
      </TableCell>
    </TableRow>
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
      <Table>
        <TableCaption>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} • Click on a task to view details
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Task</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Complexity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* First render ungrouped tasks */}
          {groupedTasks.ungrouped && groupedTasks.ungrouped.tasks.map(renderTaskRow)}
          
          {/* Then render grouped tasks */}
          {Object.entries(groupedTasks)
            .filter(([key]) => key !== 'ungrouped')
            .map(([groupId, { group, tasks }]) => (
              <TaskGroup
                key={groupId}
                group={group!}
                tasks={tasks}
                renderTask={renderTaskRow}
              />
            ))}
        </TableBody>
      </Table>

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