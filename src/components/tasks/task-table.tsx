'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, listItemVariants, springs } from '@/lib/animations'
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
import { Copy, MoreHorizontal, Eye, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { TaskWithAnalysis, TaskStatusType } from '@/types/task'
import { getSourceLabel } from '@/lib/task-source-utils'

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
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => (
              <motion.tr
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  ...springs.snappy,
                  delay: index * 0.05,
                }}
                whileHover={{ backgroundColor: "rgb(249 250 251)" }}
                className="cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <TableCell className="font-medium text-black">
                <div className="max-w-md">
                  <p className="truncate">{task.description}</p>
                  {task.source && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getSourceLabel(task.source)}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {task.analysis ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={springs.snappy}
                  >
                    <Badge 
                      variant={getCategoryVariant(task.analysis?.category)}
                      className="border-gray-300 text-gray-700"
                    >
                      {task.analysis.category}
                    </Badge>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex items-center gap-1.5 text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>analyzing</span>
                  </motion.div>
                )}
              </TableCell>
              <TableCell>
                {task.analysis ? (
                  <span className={`${getPriorityColor(task.analysis.priority)} font-mono`}>
                    {task.analysis.priority}/10
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                {task.analysis ? (
                  <div className="flex items-center gap-1">
                    <span className={getComplexityColor(task.analysis.complexity)}>
                      {task.analysis.complexity}
                    </span>
                    {task.analysis.estimated_hours && (
                      <span className="text-xs text-gray-500">
                        ({task.analysis.estimated_hours}h)
                      </span>
                    )}
                  </div>
                ) : (
                  <motion.div 
                    className="flex items-center gap-1.5 text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>analyzing</span>
                  </motion.div>
                )}
              </TableCell>
              <TableCell>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={springs.snappy}
                >
                  <Badge 
                    variant={getStatusVariant(task.status)}
                    className="font-medium"
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                </motion.div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.1 }}
                      transition={springs.snappy}
                      className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 inline-flex items-center justify-center"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </motion.button>
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
              </motion.tr>
            ))}
          </AnimatePresence>
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