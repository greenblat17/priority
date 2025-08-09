'use client'

import { useRef, useState } from 'react'
import { ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react'
import { TaskWithAnalysis, TaskStatusType } from '@/types/task'
import { TaskGroup as TaskGroupType } from '@/types/task-group'
import { TableCell, TableRow } from '@/components/ui/table'
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
import { cn } from '@/lib/utils'
import { useVirtualList } from '@/hooks/use-virtual-list'

interface TaskGroupProps {
  group: TaskGroupType
  tasks: TaskWithAnalysis[]
  renderTask: (task: TaskWithAnalysis) => React.ReactNode
  defaultExpanded?: boolean
  hasCheckboxes?: boolean
  onBulkUpdateStatus?: (taskIds: string[], status: TaskStatusType) => void
  onBulkDelete?: (taskIds: string[]) => void
  virtualize?: boolean
  rowHeightPx?: number
}

export function TaskGroup({
  group,
  tasks,
  renderTask,
  defaultExpanded = true,
  hasCheckboxes = false,
  onBulkUpdateStatus,
  onBulkDelete,
  virtualize = true,
  rowHeightPx = 40,
}: TaskGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const sectionRef = useRef<HTMLTableSectionElement>(null)
  const vr = useVirtualList(sectionRef as any, {
    itemCount: tasks.length,
    itemHeight: rowHeightPx,
    overscan: 6,
  })

  return (
    <>
      {/* Group Header Row - Minimalistic Design */}
      <TableRow
        className="cursor-pointer bg-blue-50/30 hover:bg-blue-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell colSpan={hasCheckboxes ? 8 : 7} className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Chevron Icon */}
              <div className="flex items-center">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </div>

              {/* Group Badge and Name */}
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                  Group
                </Badge>
                <span className="text-sm text-gray-900">
                  {group.name || `Group of ${tasks.length} tasks`}
                </span>
                <span className="text-sm text-gray-500">
                  -{' '}
                  {new Date(group.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                  ,{' '}
                  {new Date(group.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Task Count and Actions */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </div>
              {(onBulkUpdateStatus || onBulkDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
                    {onBulkUpdateStatus && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs">
                          Update All Status
                        </DropdownMenuLabel>
                        {(
                          [
                            'backlog',
                            'todo',
                            'in_progress',
                            'done',
                            'canceled',
                          ] as const
                        ).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={(e) => {
                              e.stopPropagation()
                              const taskIds = tasks.map((t) => t.id)
                              onBulkUpdateStatus(taskIds, status)
                            }}
                          >
                            Mark all as {status.replace('_', ' ')}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                    {onBulkDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            const taskIds = tasks.map((t) => t.id)
                            onBulkDelete(taskIds)
                          }}
                        >
                          Delete all tasks
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </TableCell>
      </TableRow>

      {/* Grouped Tasks */}
      {isExpanded &&
        (virtualize ? (
          <tbody ref={sectionRef as any}>
            {vr.paddingTop > 0 && (
              <tr style={{ height: vr.paddingTop }} aria-hidden />
            )}
            {tasks
              .slice(vr.startIndex, vr.endIndex + 1)
              .map((task) => renderTask(task))}
            {vr.paddingBottom > 0 && (
              <tr style={{ height: vr.paddingBottom }} aria-hidden />
            )}
          </tbody>
        ) : (
          <>{tasks.map((task) => renderTask(task))}</>
        ))}
    </>
  )
}
