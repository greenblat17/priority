'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { TaskWithAnalysis, TaskStatusType } from '@/types/task'
import { format } from 'date-fns'
import { PriorityDot } from './priority-dot'
import { DialogTitle } from '@/components/ui/dialog'

interface TaskDetailDialogProps {
  task: TaskWithAnalysis
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateStatus: (taskId: string, status: TaskStatusType) => void
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onUpdateStatus,
}: TaskDetailDialogProps) {
  const copySpec = () => {
    if (task.analysis?.implementation_spec) {
      navigator.clipboard.writeText(task.analysis.implementation_spec)
      toast.success('Copied to clipboard')
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in_progress':
        return 'secondary'
      case 'blocked':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getCategoryVariant = (category?: string | null) => {
    switch (category) {
      case 'bug':
        return 'destructive'
      case 'feature':
        return 'default'
      case 'improvement':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getComplexityVariant = (complexity?: string | null) => {
    switch (complexity) {
      case 'easy':
        return 'secondary'
      case 'medium':
        return 'default'
      case 'hard':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-muted-foreground">Task Details</DialogTitle>
          <div className="text-2xl font-semibold leading-relaxed mt-3">
            {task.description}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Task Information */}
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/30 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="mt-1">{task.status.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div className="mt-1">{format(new Date(task.created_at), 'MMM d, yyyy')}</div>
                </div>
                {task.source && (
                  <div>
                    <div className="text-muted-foreground">Source</div>
                    <div className="mt-1">{task.source.replace('_', ' ')}</div>
                  </div>
                )}
                {task.customer_info && (
                  <div>
                    <div className="text-muted-foreground">Customer</div>
                    <div className="mt-1">{task.customer_info}</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status Actions - Placed logically after status */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {(['pending', 'in_progress', 'completed', 'blocked'] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={task.status === status ? 'secondary' : 'outline'}
                    onClick={() => {
                      onUpdateStatus(task.id, status)
                      onOpenChange(false)
                    }}
                    disabled={task.status === status}
                    className="text-xs"
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {task.analysis ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">AI Analysis</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/20">
                <div>
                  <span className="text-xs text-muted-foreground">Priority</span>
                  <div className="flex items-center gap-2 mt-1">
                    <PriorityDot priority={task.analysis.priority} className="h-3 w-3" />
                    <span className="text-sm font-medium">{task.analysis.priority}/10</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground">Category</span>
                  <div className="mt-1">
                    <Badge variant={getCategoryVariant(task.analysis.category)} className="text-xs">
                      {task.analysis.category}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground">Complexity</span>
                  <div className="mt-1">
                    <Badge variant={getComplexityVariant(task.analysis.complexity)} className="text-xs">
                      {task.analysis.complexity}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground">Time Estimate</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{task.analysis.estimated_hours}h</span>
                  </div>
                </div>
              </div>

              {task.analysis.confidence_score && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Confidence Score</span>
                    <span className={task.analysis.confidence_score < 50 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      {task.analysis.confidence_score}%
                      {task.analysis.confidence_score < 50 && ' - Low confidence'}
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500"
                      style={{ width: `${task.analysis.confidence_score}%` }}
                    />
                  </div>
                </div>
              )}

              {task.analysis.implementation_spec && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Implementation Specification</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={copySpec}
                      className="h-8 px-2 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                    <pre className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed font-mono">{task.analysis.implementation_spec}</pre>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-8 rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">AI analysis not available yet</p>
              <p className="text-xs text-muted-foreground mt-1">Analysis will appear here once processed</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}