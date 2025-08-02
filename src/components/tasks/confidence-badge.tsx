'use client'

import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfidenceBadgeProps {
  score: number
  showWarning?: boolean
  className?: string
  size?: 'sm' | 'default'
}

export function ConfidenceBadge({ score, showWarning = false, className, size = 'default' }: ConfidenceBadgeProps) {
  // Determine the variant based on score
  const getVariant = () => {
    if (score >= 80) return 'default' // Green for high confidence
    if (score >= 50) return 'secondary' // Yellow for medium confidence
    return 'destructive' // Red for low confidence
  }

  // Get text color based on score
  const getTextColor = () => {
    if (score >= 80) return 'text-green-700'
    if (score >= 50) return 'text-yellow-700'
    return 'text-red-700'
  }

  return (
    <Badge 
      variant={getVariant()} 
      className={cn(
        'gap-1 font-medium',
        getTextColor(),
        score < 50 && 'bg-red-100 hover:bg-red-100 border-red-200',
        score >= 50 && score < 80 && 'bg-yellow-100 hover:bg-yellow-100 border-yellow-200',
        score >= 80 && 'bg-green-100 hover:bg-green-100 border-green-200',
        size === 'sm' && 'text-xs px-1.5 py-0',
        className
      )}
    >
      {showWarning && score < 50 && (
        <AlertCircle className={cn("h-3 w-3", size === 'sm' && "h-2.5 w-2.5")} />
      )}
      {score}%
    </Badge>
  )
}