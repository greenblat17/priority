'use client'

import { useState, useEffect } from 'react'
import { 
  Check, 
  Loader2, 
  Circle,
  CircleDot,
  CircleCheck,
  CircleX,
  Ban,
  CircleDashed
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TaskStatus, TaskStatusType } from '@/types/task'
import { useUpdateTaskStatus } from '@/hooks/use-tasks'
import { toast } from 'sonner'

interface TaskStatusDropdownProps {
  taskId: string
  currentStatus: TaskStatusType
  onStatusChange?: (status: TaskStatusType) => void
  variant?: 'default' | 'compact'
  disabled?: boolean
}

// Status configuration with Linear-style icons and colors
const statusConfig = {
  [TaskStatus.BACKLOG]: {
    label: 'Backlog',
    icon: CircleDashed,
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100',
    shortcut: '1'
  },
  [TaskStatus.TODO]: {
    label: 'Todo',
    icon: Circle,
    color: 'text-gray-600',
    bgColor: 'bg-white',
    borderColor: 'border-gray-300',
    hoverColor: 'hover:bg-gray-50',
    selectedIcon: true,
    shortcut: '2'
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    icon: CircleDot,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    hoverColor: 'hover:bg-yellow-100',
    shortcut: '3'
  },
  [TaskStatus.DONE]: {
    label: 'Done',
    icon: CircleCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    hoverColor: 'hover:bg-green-100',
    shortcut: '4'
  },
  [TaskStatus.CANCELED]: {
    label: 'Canceled',
    icon: CircleX,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100',
    shortcut: '5'
  },
  [TaskStatus.DUPLICATE]: {
    label: 'Duplicate',
    icon: Ban,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100',
    shortcut: '6'
  }
}

export function TaskStatusDropdown({
  taskId,
  currentStatus,
  onStatusChange,
  variant = 'default',
  disabled = false
}: TaskStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const updateStatus = useUpdateTaskStatus()
  
  // Handle legacy status values by mapping them to new ones
  const mappedStatus = (() => {
    switch (currentStatus) {
      case 'pending':
        return TaskStatus.TODO
      case 'completed':
        return TaskStatus.DONE
      case 'blocked':
        return TaskStatus.CANCELED
      default:
        return currentStatus in statusConfig ? currentStatus : TaskStatus.TODO
    }
  })()
  
  const config = statusConfig[mappedStatus] || statusConfig[TaskStatus.TODO]
  const Icon = config.icon

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key
      
      // Find status by shortcut key
      const statusEntry = Object.entries(statusConfig).find(
        ([_, config]) => config.shortcut === key
      )
      
      if (statusEntry) {
        e.preventDefault()
        const [status] = statusEntry
        handleStatusChange(status as TaskStatusType)
      }
      
      // Escape to close
      if (key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleStatusChange = async (newStatus: TaskStatusType) => {
    if (newStatus === currentStatus) return

    try {
      await updateStatus.mutateAsync({ taskId, status: newStatus })
      onStatusChange?.(newStatus)
      toast.success(`Status updated to ${statusConfig[newStatus].label}`)
    } catch (error) {
      toast.error('Failed to update task status')
    }
    setIsOpen(false)
  }

  const triggerContent = (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-7 w-7 p-0",
        config.color,
        "hover:bg-gray-100 rounded"
      )}
      disabled={disabled || updateStatus.isPending}
    >
      {updateStatus.isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Icon className="h-5 w-5" />
      )}
    </Button>
  )

  if (disabled) {
    return triggerContent
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {triggerContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {Object.entries(TaskStatus).map(([key, status]) => {
          const statusInfo = statusConfig[status]
          const StatusIcon = statusInfo.icon
          const isSelected = status === mappedStatus
          
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status)}
              className={cn(
                "gap-3 cursor-pointer",
                isSelected && "bg-accent"
              )}
            >
              <StatusIcon className={cn("h-5 w-5", statusInfo.color)} />
              <span className="flex-1 text-foreground">{statusInfo.label}</span>
              {isSelected && (
                <Check className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">
                {statusInfo.shortcut}
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}