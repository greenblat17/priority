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
import { Copy, MoreHorizontal, Eye, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { TaskWithAnalysis, TaskStatusType } from '@/types/task'

interface TaskTableProps {
  tasks: TaskWithAnalysis[]
  onUpdateStatus: (taskId: string, status: TaskStatusType) => void
  onDeleteTask: (taskId: string) => void
}

export function TaskTable({ tasks, onUpdateStatus, onDeleteTask }: TaskTableProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithAnalysis | null>(null)

  const copySpec = (spec: string) => {
    navigator.clipboard.writeText(spec)
    toast.success('Implementation spec copied to clipboard')
  }

  const getCategoryVariant = (category?: string | null): "default" | "secondary" | "destructive" | "outline" => {
    // All categories use outline style for clean, minimal look
    return 'outline'
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' // Will be black (primary)
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
        return 'text-gray-600'
      case 'medium':
        return 'text-gray-700 font-medium'
      case 'hard':
        return 'text-black font-semibold'
      default:
        return 'text-gray-500'
    }
  }

  const getPriorityColor = (priority?: number | null) => {
    if (!priority) return 'text-gray-500'
    // Blue ONLY for high priority (8+)
    if (priority >= 8) return 'text-blue-500 font-semibold'
    if (priority >= 6) return 'text-black font-semibold'
    if (priority >= 4) return 'text-black'
    return 'text-gray-600'
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No tasks found. Create your first task to get started!</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableCaption className="text-gray-600">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} • Click on a task to view details
        </TableCaption>
        <TableHeader>
          <TableRow className="border-b border-gray-100">
            <TableHead className="w-[40%] text-black font-semibold">Task</TableHead>
            <TableHead className="text-black font-semibold">Category</TableHead>
            <TableHead className="text-black font-semibold">Priority</TableHead>
            <TableHead className="text-black font-semibold">Complexity</TableHead>
            <TableHead className="text-black font-semibold">Status</TableHead>
            <TableHead className="text-right text-black font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task.id}
              className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setSelectedTask(task)}
            >
              <TableCell className="font-medium text-black">
                <div className="max-w-md">
                  <p className="truncate">{task.description}</p>
                  {task.source && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {task.source.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={getCategoryVariant(task.analysis?.category)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {task.analysis?.category || 'pending'}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={`${getPriorityColor(task.analysis?.priority)} font-mono`}>
                  {task.analysis?.priority || '-'}/10
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className={getComplexityColor(task.analysis?.complexity)}>
                    {task.analysis?.complexity || 'analyzing'}
                  </span>
                  {task.analysis?.estimated_hours && (
                    <span className="text-xs text-gray-500">
                      ({task.analysis.estimated_hours}h)
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={getStatusVariant(task.status)}
                  className="font-medium"
                >
                  {task.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTask(task)
                    }}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {task.analysis?.implementation_spec && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        copySpec(task.analysis?.implementation_spec || '')
                      }}>
                        <Copy className="mr-2 h-4 w-4" />
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
                        <RefreshCw className="mr-2 h-4 w-4" />
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
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
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