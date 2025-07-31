'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Users, Calendar, CheckCircle2 } from 'lucide-react'
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
  
  // Calculate group statistics
  const completedCount = tasks.filter(t => t.status === 'completed').length
  const totalHours = tasks.reduce((sum, task) => 
    sum + (task.analysis?.[0]?.estimated_hours || 0), 0
  )
  const avgPriority = tasks.length > 0 
    ? (tasks.reduce((sum, task) => 
        sum + (task.analysis?.[0]?.priority || 0), 0
      ) / tasks.length).toFixed(1)
    : 0

  return (
    <>
      {/* Group Header Row */}
      <TableRow 
        className={cn(
          "cursor-pointer transition-colors",
          "hover:bg-muted/50",
          isExpanded ? "bg-blue-50/70" : "bg-blue-50/30"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell colSpan={hasCheckboxes ? 7 : 6} className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-1 hover:bg-muted rounded-md transition-colors">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-blue-600" />
                )}
              </button>
              
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                
                <div>
                  <span className="font-medium text-sm">
                    {group.name || `Task Group`}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {completedCount}/{tasks.length} completed
                    </span>
                    {totalHours > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {totalHours}h estimated
                      </span>
                    )}
                    <span>Avg priority: {avgPriority}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  completedCount === tasks.length 
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "bg-blue-100 text-blue-700 border-blue-300"
                )}
              >
                {completedCount === tasks.length ? 'Complete' : 'In Progress'}
              </Badge>
            </div>
          </div>
        </TableCell>
      </TableRow>

      {/* Grouped Tasks */}
      {isExpanded && (
        <>
          {tasks.map((task) => renderTask(task))}
          {/* Group Summary Row */}
          <TableRow className="bg-gray-50/50">
            <TableCell colSpan={hasCheckboxes ? 7 : 6} className="py-2 text-xs text-muted-foreground text-center">
              End of group • {tasks.length} task{tasks.length !== 1 ? 's' : ''} • {completedCount} completed
            </TableCell>
          </TableRow>
        </>
      )}
    </>
  )
}