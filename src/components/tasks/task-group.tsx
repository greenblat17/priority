'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TaskWithAnalysis } from '@/types/task'
import { TaskGroup as TaskGroupType } from '@/types/task-group'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface TaskGroupProps {
  group: TaskGroupType
  tasks: TaskWithAnalysis[]
  renderTask: (task: TaskWithAnalysis) => React.ReactNode
  defaultExpanded?: boolean
}

export function TaskGroup({ 
  group, 
  tasks, 
  renderTask,
  defaultExpanded = true 
}: TaskGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <>
      {/* Group Header Row */}
      <TableRow 
        className="cursor-pointer hover:bg-muted/50 bg-blue-50/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell colSpan={6} className="py-2">
          <div className="flex items-center gap-2">
            <button className="p-0.5 hover:bg-muted rounded">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              Group
            </Badge>
            
            <span className="font-medium text-sm">
              {group.name || `Group ${group.id.slice(0, 8)}`}
            </span>
            
            <span className="text-xs text-muted-foreground ml-auto">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </TableCell>
      </TableRow>

      {/* Grouped Tasks */}
      {isExpanded && tasks.map((task) => renderTask(task))}
    </>
  )
}