'use client'

import { cn } from '@/lib/utils'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Target, Gauge } from 'lucide-react'

interface ICEScoreBadgeProps {
  impact?: number | null
  confidence?: number | null
  ease?: number | null
  score?: number | null
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  className?: string
}

export function ICEScoreBadge({
  impact,
  confidence,
  ease,
  score,
  size = 'md',
  showDetails = true,
  className
}: ICEScoreBadgeProps) {
  if (!impact || !confidence || !ease) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)}>
        No ICE Score
      </Badge>
    )
  }

  const calculatedScore = score || (impact * confidence * ease)
  
  // Determine color based on score ranges
  const getScoreColor = (score: number) => {
    if (score >= 500) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 300) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (score >= 150) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getMetricColor = (value: number) => {
    if (value >= 8) return 'text-green-600'
    if (value >= 6) return 'text-yellow-600'
    if (value >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  if (!showDetails) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          getScoreColor(calculatedScore),
          sizeClasses[size],
          "font-semibold",
          className
        )}
      >
        ICE: {calculatedScore}
      </Badge>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              getScoreColor(calculatedScore),
              sizeClasses[size],
              "font-semibold cursor-help",
              className
            )}
          >
            ICE: {calculatedScore}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="p-3 max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold text-sm mb-2">ICE Prioritization Score</div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">Impact</span>
                </div>
                <span className={cn("text-sm font-semibold", getMetricColor(impact))}>
                  {impact}/10
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">Confidence</span>
                </div>
                <span className={cn("text-sm font-semibold", getMetricColor(confidence))}>
                  {confidence}/10
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">Ease</span>
                </div>
                <span className={cn("text-sm font-semibold", getMetricColor(ease))}>
                  {ease}/10
                </span>
              </div>
            </div>
            
            <div className="pt-2 mt-2 border-t">
              <div className="text-xs text-muted-foreground">
                Score = {impact} × {confidence} × {ease} = <span className="font-semibold">{calculatedScore}</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}