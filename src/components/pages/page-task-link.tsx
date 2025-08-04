'use client'

import { useState } from 'react'
import { Link2, Plus, X, CheckCircle2, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/task'

interface PageTaskLinkProps {
  pageId: string
  linkedTasks: Task[]
  onLink: (taskId: string) => void
  onUnlink: (taskId: string) => void
  availableTasks?: Task[]
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

export function PageTaskLink({
  pageId,
  linkedTasks,
  onLink,
  onUnlink,
  availableTasks = [],
  className
}: PageTaskLinkProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter available tasks that aren't already linked
  const linkedTaskIds = new Set(linkedTasks.map(t => t.id))
  const unlinkedTasks = availableTasks.filter(t => !linkedTaskIds.has(t.id))
  
  // Filter by search query
  const filteredTasks = unlinkedTasks.filter(task =>
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const handleLink = (taskId: string) => {
    onLink(taskId)
    setSearchQuery('')
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Linked Tasks
        </h3>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Link Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Task to Page</DialogTitle>
              <DialogDescription>
                Select a task to link to this page
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchQuery ? 'No tasks found' : 'No available tasks to link'}
                  </p>
                ) : (
                  filteredTasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                      onClick={() => {
                        handleLink(task.id)
                        setIsOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <TaskStatusIcon status={task.status} />
                        <div>
                          <p className="text-sm font-medium line-clamp-1">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                            {task.category && (
                              <Badge variant="outline" className="text-xs">
                                {task.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {linkedTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tasks linked to this page yet
        </p>
      ) : (
        <div className="space-y-2">
          {linkedTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <TaskStatusIcon status={task.status} />
                <div>
                  <p className="text-sm font-medium">{task.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {task.priority}
                    </Badge>
                    {task.category && (
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUnlink(task.id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}