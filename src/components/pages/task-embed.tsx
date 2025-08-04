'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Clock, ListTodo } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/task'

interface TaskEmbedProps {
  taskIds?: string[]
  filter?: 'all' | 'pending' | 'in_progress' | 'completed'
  showStatus?: boolean
  showPriority?: boolean
  showCategory?: boolean
  title?: string
  className?: string
}

function TaskStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case 'in_progress':
      return <Clock className="h-4 w-4 text-blue-600" />
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />
  }
}

export function TaskEmbed({
  taskIds = [],
  filter = 'all',
  showStatus = true,
  showPriority = true,
  showCategory = true,
  title = 'Tasks',
  className
}: TaskEmbedProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function fetchTasks() {
      try {
        // If specific task IDs provided, fetch those
        if (taskIds.length > 0) {
          const response = await fetch('/api/tasks?' + 
            new URLSearchParams(taskIds.map(id => ['ids', id]))
          )
          
          if (response.ok) {
            const data = await response.json()
            setTasks(data.tasks || [])
          }
        } else {
          // Otherwise fetch all tasks
          const response = await fetch('/api/tasks')
          
          if (response.ok) {
            const data = await response.json()
            setTasks(data.tasks || [])
          }
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTasks()
  }, [taskIds])
  
  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListTodo className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </CardContent>
      </Card>
    )
  }
  
  if (filteredTasks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListTodo className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No tasks to display</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ListTodo className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              {showStatus && <TaskStatusIcon status={task.status} />}
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm",
                  task.status === 'completed' && "line-through text-muted-foreground"
                )}>
                  {task.description}
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                  {showPriority && task.priority && (
                    <Badge variant="outline" className="text-xs">
                      P{task.priority}
                    </Badge>
                  )}
                  
                  {showCategory && task.category && (
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}