'use client'

import React, { useMemo, useRef, useState } from 'react'
import { TaskWithAnalysis, TaskStatusType } from '@/types/task'
import { DisplaySettings } from '@/types/display'
import {
  Circle,
  CircleDot,
  CircleCheck,
  CircleX,
  Ban,
  CircleDashed,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ConfidenceBadge } from './confidence-badge'
import { TaskStatusDropdown } from './task-status-dropdown'
import { PriorityIcon } from './priority-icon'
import { ICEScoreBadge } from './ice-score-badge'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { highlightSearchTerm } from '@/lib/search-utils'
import { getSourceLabel } from '@/lib/task-source-utils'
import dynamic from 'next/dynamic'
const TaskDetailPanel = dynamic(
  () => import('./task-detail-panel').then((m) => m.TaskDetailPanel),
  { ssr: false, loading: () => null }
)
const TaskEditDialog = dynamic(
  () => import('./task-edit-dialog').then((m) => m.TaskEditDialog),
  { ssr: false, loading: () => null }
)
import { toast } from 'sonner'
import { useVirtualList } from '@/hooks/use-virtual-list'

interface TaskListLinearProps {
  tasks: TaskWithAnalysis[]
  displaySettings: DisplaySettings
  onUpdateStatus: (taskId: string, status: TaskStatusType) => void
  onDeleteTask: (taskId: string) => void
  searchQuery?: string
}

type GroupKey = string
type GroupedTasks = Record<
  GroupKey,
  {
    label: string
    tasks: TaskWithAnalysis[]
    order: number
  }
>

export function TaskListLinear({
  tasks,
  displaySettings,
  onUpdateStatus,
  onDeleteTask,
  searchQuery = '',
}: TaskListLinearProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [selectedTask, setSelectedTask] = useState<TaskWithAnalysis | null>(
    null
  )
  const [editingTask, setEditingTask] = useState<TaskWithAnalysis | null>(null)

  const toggleGroup = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups)
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey)
    } else {
      newCollapsed.add(groupKey)
    }
    setCollapsedGroups(newCollapsed)
  }

  // Group tasks based on display settings
  const groupTasks = (): GroupedTasks => {
    const groups: GroupedTasks = {}

    tasks.forEach((task) => {
      let groupKey: string
      let label: string
      let order: number

      switch (displaySettings.grouping) {
        case 'status':
          groupKey = task.status
          label = getStatusLabel(task.status)
          order = getStatusOrder(task.status)
          break

        case 'category':
          groupKey = task.analysis?.category || 'uncategorized'
          label = getCategoryLabel(groupKey)
          order = getCategoryOrder(groupKey)
          break

        case 'priority':
          const priority = task.analysis?.priority || 0
          groupKey = getPriorityGroup(priority)
          label = getPriorityLabel(groupKey)
          order = getPriorityOrder(groupKey)
          break

        case 'date':
          groupKey = getDateGroup(task.created_at)
          label = getDateLabel(groupKey)
          order = getDateOrder(groupKey)
          break

        case 'none':
        default:
          groupKey = 'all'
          label = 'All Tasks'
          order = 0
          break
      }

      if (!groups[groupKey]) {
        groups[groupKey] = { label, tasks: [], order }
      }
      groups[groupKey].tasks.push(task)
    })

    // Remove empty groups if setting says so
    if (!displaySettings.showEmptyGroups) {
      Object.keys(groups).forEach((key) => {
        if (groups[key].tasks.length === 0) {
          delete groups[key]
        }
      })
    }

    return groups
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      backlog: 'Backlog',
      todo: 'To Do',
      in_progress: 'In Progress',
      done: 'Done',
      canceled: 'Canceled',
      duplicate: 'Duplicate',
    }
    return labels[status] || status
  }

  const getStatusOrder = (status: string): number => {
    const order: Record<string, number> = {
      backlog: 1,
      todo: 2,
      in_progress: 3,
      done: 4,
      canceled: 5,
      duplicate: 6,
    }
    return order[status] || 999
  }

  const getCategoryLabel = (category: string): string => {
    if (category === 'uncategorized') return 'Uncategorized'
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  const getCategoryOrder = (category: string): number => {
    const order: Record<string, number> = {
      bug: 1,
      feature: 2,
      improvement: 3,
      business: 4,
      other: 5,
      uncategorized: 6,
    }
    return order[category] || 999
  }

  const getPriorityGroup = (priority: number): string => {
    if (priority >= 8) return 'critical'
    if (priority >= 6) return 'high'
    if (priority >= 4) return 'medium'
    if (priority >= 2) return 'low'
    return 'no-priority'
  }

  const getPriorityLabel = (group: string): string => {
    const labels: Record<string, string> = {
      critical: 'Critical',
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
      'no-priority': 'No Priority',
    }
    return labels[group] || group
  }

  const getPriorityOrder = (group: string): number => {
    const order: Record<string, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
      'no-priority': 5,
    }
    return order[group] || 999
  }

  const getDateGroup = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    if (date >= today) return 'today'
    if (date >= yesterday) return 'yesterday'
    if (date >= weekAgo) return 'this-week'
    if (date >= monthAgo) return 'this-month'
    return 'older'
  }

  const getDateLabel = (group: string): string => {
    const labels: Record<string, string> = {
      today: 'Today',
      yesterday: 'Yesterday',
      'this-week': 'This Week',
      'this-month': 'This Month',
      older: 'Older',
    }
    return labels[group] || group
  }

  const getDateOrder = (group: string): number => {
    const order: Record<string, number> = {
      today: 1,
      yesterday: 2,
      'this-week': 3,
      'this-month': 4,
      older: 5,
    }
    return order[group] || 999
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

  const getStatusIcon = (status: string) => {
    const iconMap = {
      backlog: { icon: CircleDashed, color: 'text-gray-400' },
      todo: { icon: Circle, color: 'text-gray-600' },
      in_progress: { icon: CircleDot, color: 'text-yellow-500' },
      done: { icon: CircleCheck, color: 'text-green-600' },
      canceled: { icon: CircleX, color: 'text-gray-500' },
      duplicate: { icon: Ban, color: 'text-gray-500' },
    }
    return iconMap[status] || { icon: Circle, color: 'text-gray-400' }
  }

  const copySpec = (spec: string) => {
    navigator.clipboard.writeText(spec)
    toast.success('Implementation spec copied to clipboard')
  }

  const renderTaskRow = (task: TaskWithAnalysis, isFirst: boolean = false) => {
    return (
      <TableRow
        key={task.id}
        className={cn(
          'group cursor-pointer hover:bg-gray-50 transition-colors duration-75 h-10',
          task.analysis?.confidence_score !== undefined &&
            task.analysis?.confidence_score !== null &&
            task.analysis.confidence_score < 50 &&
            'bg-red-50 hover:bg-red-100',
          !isFirst && 'border-t-0'
        )}
        onClick={(e) => {
          setSelectedTask(task)
        }}
      >
        <TableCell className="w-[40px] pr-0">
          <TaskStatusDropdown
            taskId={task.id}
            currentStatus={task.status}
            onStatusChange={(newStatus) => onUpdateStatus(task.id, newStatus)}
          />
        </TableCell>
        <TableCell className="font-medium pl-2">
          <div className="max-w-md">
            <div className="text-sm truncate">
              {searchQuery
                ? highlightSearchTerm(task.description, searchQuery)
                : task.description}
            </div>
            {task.source && (
              <div className="text-xs text-muted-foreground">
                Source:{' '}
                {searchQuery
                  ? highlightSearchTerm(
                      getSourceLabel(task.source),
                      searchQuery
                    )
                  : getSourceLabel(task.source)}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="w-[120px]">
          <Badge
            variant={getCategoryVariant(task.analysis?.category)}
            className="text-xs"
          >
            <span>
              {searchQuery && task.analysis?.category
                ? highlightSearchTerm(task.analysis.category, searchQuery)
                : task.analysis?.category || 'pending'}
            </span>
          </Badge>
        </TableCell>
        <TableCell className="w-[140px]">
          <ICEScoreBadge
            impact={task.analysis?.ice_impact}
            confidence={task.analysis?.ice_confidence}
            ease={task.analysis?.ice_ease}
            score={task.analysis?.ice_score}
            size="sm"
          />
        </TableCell>
        <TableCell className="w-[120px]">
          <span
            className={cn(
              'text-xs',
              getComplexityColor(task.analysis?.complexity)
            )}
          >
            {task.analysis?.complexity || 'analyzing'}
          </span>
          {task.analysis?.estimated_hours && (
            <span className="text-xs text-muted-foreground ml-1">
              ({task.analysis.estimated_hours}h)
            </span>
          )}
        </TableCell>
        <TableCell className="w-[100px]">
          {task.analysis?.confidence_score !== undefined &&
          task.analysis.confidence_score !== null ? (
            <ConfidenceBadge
              score={task.analysis.confidence_score}
              showWarning={true}
              size="sm"
            />
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="w-[80px] text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedTask(task)
                }}
              >
                View Details
              </DropdownMenuItem>
              {task.analysis?.implementation_spec && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    copySpec(task.analysis?.implementation_spec || '')
                  }}
                >
                  Copy Spec
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingTask(task)
                }}
              >
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

  const groupedTasks = groupTasks()
  const sortedGroups = Object.entries(groupedTasks).sort(
    (a, b) => a[1].order - b[1].order
  )

  // Shared scroll container ref for virtualization
  const containerRef = useRef<HTMLDivElement>(null)

  if (displaySettings.grouping === 'none') {
    // Simple virtualized table for flat list
    const rowHeight = 40 // px, matches h-10
    const itemCount = tasks.length
    const range = useVirtualList(containerRef, {
      itemCount,
      itemHeight: rowHeight,
      overscan: 8,
    })
    const visible = useMemo(
      () => tasks.slice(range.startIndex, range.endIndex + 1),
      [tasks, range]
    )

    return (
      <>
        <div ref={containerRef} className="max-h-[70vh] overflow-auto">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TableRow className="border-0">
                <TableHead className="w-[40px] h-8 pr-0">Status</TableHead>
                <TableHead className="h-8 pl-2">Task</TableHead>
                <TableHead className="w-[120px] h-8">Category</TableHead>
                <TableHead className="w-[100px] h-8">ICE</TableHead>
                <TableHead className="w-[120px] h-8">Complexity</TableHead>
                <TableHead className="w-[100px] h-8">Confidence</TableHead>
                <TableHead className="w-[80px] text-right h-8">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* top padding row */}
              {range.paddingTop > 0 && (
                <TableRow style={{ height: range.paddingTop }} aria-hidden />
              )}
              {visible.map((task, idx) =>
                renderTaskRow(task, idx === 0 && range.startIndex === 0)
              )}
              {/* bottom padding row */}
              {range.paddingBottom > 0 && (
                <TableRow style={{ height: range.paddingBottom }} aria-hidden />
              )}
            </TableBody>
          </Table>
        </div>

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

  return (
    <>
      <div className="max-h-[70vh] overflow-auto" ref={containerRef as any}>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TableRow className="border-0">
              <TableHead className="w-[40px] h-8 text-xs font-normal text-muted-foreground pr-0">
                Status
              </TableHead>
              <TableHead className="h-8 text-xs font-normal text-muted-foreground pl-2">
                Task
              </TableHead>
              <TableHead className="w-[120px] h-8 text-xs font-normal text-muted-foreground">
                Category
              </TableHead>
              <TableHead className="w-[100px] h-8 text-xs font-normal text-muted-foreground">
                ICE
              </TableHead>
              <TableHead className="w-[120px] h-8 text-xs font-normal text-muted-foreground">
                Complexity
              </TableHead>
              <TableHead className="w-[100px] h-8 text-xs font-normal text-muted-foreground">
                Confidence
              </TableHead>
              <TableHead className="w-[80px] text-right h-8 text-xs font-normal text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGroups.map(([groupKey, group]) => {
              const isCollapsed = collapsedGroups.has(groupKey)
              const taskCount = group.tasks.length

              return (
                <React.Fragment key={`group-${groupKey}`}>
                  <TableRow className="h-10 bg-gray-50 border-t border-gray-200">
                    <TableCell colSpan={7} className="p-0">
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="w-full flex items-center h-10 px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        {displaySettings.grouping === 'status' &&
                          (() => {
                            const statusInfo = getStatusIcon(groupKey)
                            const StatusIcon = statusInfo.icon
                            return (
                              <>
                                <StatusIcon
                                  className={cn(
                                    'h-5 w-5 mr-2',
                                    statusInfo.color
                                  )}
                                />
                                <span className="text-gray-900">
                                  {group.label}
                                </span>
                              </>
                            )
                          })()}
                        {displaySettings.grouping !== 'status' && (
                          <span>{group.label}</span>
                        )}
                        <span className="ml-auto mr-2 text-xs text-gray-500">
                          {taskCount}
                        </span>
                      </button>
                    </TableCell>
                  </TableRow>
                  {!isCollapsed &&
                    group.tasks.map((task, idx) =>
                      renderTaskRow(task, idx === 0)
                    )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

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
