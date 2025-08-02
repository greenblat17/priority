'use client'

import { cn } from '@/lib/utils'

interface PriorityDotProps {
  priority?: number | null
  className?: string
}

export function PriorityDot({ priority, className }: PriorityDotProps) {
  if (!priority) return null

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-500'
    if (priority >= 6) return 'bg-amber-500' 
    if (priority >= 4) return 'bg-blue-500'
    return 'bg-slate-400'
  }

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return 'High Priority'
    if (priority >= 6) return 'Medium Priority'
    if (priority >= 4) return 'Low Priority'
    return 'Minimal Priority'
  }

  return (
    <div 
      className={cn(
        "w-2 h-2 rounded-full transition-colors duration-200",
        getPriorityColor(priority),
        className
      )}
      title={`${getPriorityLabel(priority)} (P${priority})`}
      aria-label={`Priority ${priority}`}
    />
  )
}