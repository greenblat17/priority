'use client'

import { useState } from 'react'
import { TaskWithAnalysis, TaskStatusType } from '@/types/task'
import { DisplaySettings } from '@/types/display'
import { TaskTableGrouped } from './task-table-grouped'
import { ChevronDown, ChevronRight } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'

interface TaskListGroupedProps {
  tasks: TaskWithAnalysis[]
  displaySettings: DisplaySettings
  onUpdateStatus: (taskId: string, status: TaskStatusType) => void
  onDeleteTask: (taskId: string) => void
  searchQuery?: string
  selectedIds?: Set<string>
  onToggleSelection?: (taskId: string) => void
  onToggleAll?: () => void
  isAllSelected?: boolean
  isPartiallySelected?: boolean
}

type GroupKey = string
type GroupedTasks = Record<GroupKey, {
  label: string
  tasks: TaskWithAnalysis[]
  order: number
}>

export function TaskListGrouped({
  tasks,
  displaySettings,
  onUpdateStatus,
  onDeleteTask,
  searchQuery,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  isAllSelected,
  isPartiallySelected
}: TaskListGroupedProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

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

    tasks.forEach(task => {
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
      Object.keys(groups).forEach(key => {
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
      duplicate: 'Duplicate'
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
      duplicate: 6
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
      uncategorized: 6
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
      'no-priority': 'No Priority'
    }
    return labels[group] || group
  }

  const getPriorityOrder = (group: string): number => {
    const order: Record<string, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
      'no-priority': 5
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
      older: 'Older'
    }
    return labels[group] || group
  }

  const getDateOrder = (group: string): number => {
    const order: Record<string, number> = {
      today: 1,
      yesterday: 2,
      'this-week': 3,
      'this-month': 4,
      older: 5
    }
    return order[group] || 999
  }

  const groupedTasks = groupTasks()
  const sortedGroups = Object.entries(groupedTasks).sort(
    (a, b) => a[1].order - b[1].order
  )

  if (displaySettings.grouping === 'none') {
    return (
      <TaskTableGrouped
        tasks={tasks}
        onUpdateStatus={onUpdateStatus}
        onDeleteTask={onDeleteTask}
        searchQuery={searchQuery}
        selectedIds={selectedIds}
        onToggleSelection={onToggleSelection}
        onToggleAll={onToggleAll}
        isAllSelected={isAllSelected}
        isPartiallySelected={isPartiallySelected}
      />
    )
  }

  return (
    <div>
      {/* Table header */}
      <Table>
        <TableHeader>
          <TableRow className="border-0">
            {onToggleAll && (
              <TableHead className="w-[30px] h-8 text-xs font-normal text-muted-foreground px-1">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onToggleAll}
                  data-state={isPartiallySelected && !isAllSelected ? "indeterminate" : undefined}
                  className="h-4 w-4"
                />
              </TableHead>
            )}
            <TableHead className="h-8 text-xs font-normal text-muted-foreground">Task</TableHead>
            <TableHead className="w-[120px] h-8 text-xs font-normal text-muted-foreground">Category</TableHead>
            <TableHead className="w-[100px] h-8 text-xs font-normal text-muted-foreground">ICE Score</TableHead>
            <TableHead className="w-[120px] h-8 text-xs font-normal text-muted-foreground">Complexity</TableHead>
            <TableHead className="w-[100px] h-8 text-xs font-normal text-muted-foreground">Confidence</TableHead>
            <TableHead className="w-[120px] h-8 text-xs font-normal text-muted-foreground">Status</TableHead>
            <TableHead className="w-[80px] text-right h-8 text-xs font-normal text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      {/* Groups */}
      {sortedGroups.map(([groupKey, group]) => {
        const isCollapsed = collapsedGroups.has(groupKey)
        const taskCount = group.tasks.length

        return (
          <div key={groupKey}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleGroup(groupKey)}
              className="w-full justify-start h-7 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3 mr-1" />
              ) : (
                <ChevronDown className="h-3 w-3 mr-1" />
              )}
              <span>{group.label}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {taskCount}
              </span>
            </Button>

            {!isCollapsed && (
              <div className="-mt-1">
                <TaskTableGrouped
                  tasks={group.tasks}
                  onUpdateStatus={onUpdateStatus}
                  onDeleteTask={onDeleteTask}
                  searchQuery={searchQuery}
                  selectedIds={selectedIds}
                  onToggleSelection={onToggleSelection}
                  isAllSelected={false}
                  isPartiallySelected={false}
                  hideHeader={true}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}