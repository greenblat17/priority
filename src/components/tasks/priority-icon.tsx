'use client'

import { 
  Minus,
  ChevronUp,
  ChevronsUp,
  ShieldAlert
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface PriorityIconProps {
  priority?: number | null
  iceScore?: number | null
  iceImpact?: number | null
  iceConfidence?: number | null
  iceEase?: number | null
  className?: string
}

export function PriorityIcon({ 
  priority, 
  iceScore,
  iceImpact,
  iceConfidence,
  iceEase,
  className 
}: PriorityIconProps) {
  // Determine priority level based on score (1-10 scale mapped to 4 levels)
  const getPriorityLevel = (score?: number | null) => {
    if (!score || score === 0) return 'none'
    if (score >= 7) return 'high'
    if (score >= 4) return 'medium'
    return 'low'
  }

  const level = getPriorityLevel(priority)
  
  const iconMap = {
    none: Minus,
    low: ChevronUp,
    medium: ChevronsUp,
    high: ShieldAlert,
  }

  const colorMap = {
    none: 'text-gray-400',
    low: 'text-gray-500',
    medium: 'text-gray-600',
    high: 'text-red-500',
  }

  const Icon = iconMap[level]
  const color = colorMap[level]

  const tooltipContent = iceScore ? (
    <div className="text-xs space-y-1">
      <div className="font-medium">ICE Score: {iceScore}</div>
      {iceImpact !== undefined && iceImpact !== null && (
        <div className="text-muted-foreground">Impact: {iceImpact}</div>
      )}
      {iceConfidence !== undefined && iceConfidence !== null && (
        <div className="text-muted-foreground">Confidence: {iceConfidence}</div>
      )}
      {iceEase !== undefined && iceEase !== null && (
        <div className="text-muted-foreground">Ease: {iceEase}</div>
      )}
    </div>
  ) : null

  const iconElement = <Icon className={cn('h-5 w-5', color, className)} />

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex">
              {iconElement}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return iconElement
}