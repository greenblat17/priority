'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TaskWithAnalysis } from '@/types/task'
import { TaskGroup as TaskGroupType } from '@/types/task-group'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TaskGroupProps {
  group: TaskGroupType
  tasks: TaskWithAnalysis[]
  renderTask: (task: TaskWithAnalysis) => React.ReactNode
  defaultExpanded?: boolean
  hasCheckboxes?: boolean
}

export function TaskGroup({ 
  group, 
  tasks, 
  renderTask,
  defaultExpanded = true,
  hasCheckboxes = false 
}: TaskGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <>
      {/* Group Header Row - Minimalistic Design */}
      <TableRow 
        className="cursor-pointer bg-blue-50/30 hover:bg-blue-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell colSpan={hasCheckboxes ? 7 : 6} className="py-3">
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
                <Badge 
                  className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0"
                >
                  Group
                </Badge>
                <span className="text-sm text-gray-900">
                  {group.name || `Group of ${tasks.length} tasks`}
                </span>
                <span className="text-sm text-gray-500">
                  - {new Date(group.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}, {new Date(group.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            
            {/* Task Count */}
            <div className="text-sm text-gray-500">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </div>
          </div>
        </TableCell>
      </TableRow>

      {/* Grouped Tasks */}
      {isExpanded && tasks.map((task) => renderTask(task))}
    </>
  )
}