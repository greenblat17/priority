'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Copy, Calendar, User, Hash, Brain, Clock, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { TaskWithAnalysis, TaskStatusType } from '@/types/task'
import { format } from 'date-fns'

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
      toast.success('Implementation spec copied to clipboard')
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>
            Complete information about this task and its AI analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Task Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{task.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Status
                  </p>
                  <Badge variant="outline">{task.status.replace('_', ' ')}</Badge>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" /> Source
                  </p>
                  <p className="text-sm">{task.source?.replace('_', ' ') || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Created
                  </p>
                  <p className="text-sm">{formatDate(task.created_at)}</p>
                </div>
                
                {task.customer_info && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Customer</p>
                    <p className="text-sm">{task.customer_info}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* AI Analysis */}
          {task.analysis ? (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5" /> AI Analysis
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <Badge>{task.analysis.category}</Badge>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Priority</p>
                  <p className="text-lg font-bold">{task.analysis.priority}/10</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Complexity
                  </p>
                  <Badge variant="outline">{task.analysis.complexity}</Badge>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Est. Hours
                  </p>
                  <p className="text-sm">{task.analysis.estimated_hours}h</p>
                </div>
              </div>

              {task.analysis.confidence_score && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Confidence Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${task.analysis.confidence_score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{task.analysis.confidence_score}%</span>
                  </div>
                </div>
              )}

              {task.analysis.implementation_spec && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Implementation Specification</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={copySpec}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Spec
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">{task.analysis.implementation_spec}</pre>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  Analyzed at: {formatDate(task.analysis.analyzed_at)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No AI analysis available yet</p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <p className="text-sm text-muted-foreground">Update Status:</p>
              {(['pending', 'in_progress', 'completed', 'blocked'] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={task.status === status ? 'default' : 'outline'}
                  onClick={() => {
                    onUpdateStatus(task.id, status)
                    onOpenChange(false)
                  }}
                  disabled={task.status === status}
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>
            
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}