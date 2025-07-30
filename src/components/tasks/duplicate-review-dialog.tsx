'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, Eye, Plus, X, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import type { TaskSimilarity } from '@/types/duplicate'
import type { ExtendedDuplicateReviewAction } from '@/types/task-group'
import { getSimilarityPercentage } from '@/lib/duplicate-detection-utils'

interface DuplicateReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  newTaskDescription: string
  potentialDuplicates: TaskSimilarity[]
  onAction: (action: ExtendedDuplicateReviewAction) => void
}

export function DuplicateReviewDialog({
  isOpen,
  onClose,
  newTaskDescription,
  potentialDuplicates,
  onAction
}: DuplicateReviewDialogProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())

  const handleCreateNew = () => {
    onAction({ action: 'create_new' })
  }

  const handleViewExisting = () => {
    if (selectedTaskId) {
      onAction({ action: 'view_existing', selectedTaskId })
    }
  }

  const handleCancel = () => {
    onAction({ action: 'cancel' })
  }

  const handleCreateAndGroup = () => {
    // Use all duplicates by default, or selected ones if any
    const taskIdsToGroup = selectedTaskIds.size > 0 
      ? Array.from(selectedTaskIds)
      : potentialDuplicates.map(d => d.taskId)
    
    onAction({ 
      action: 'create_and_group',
      selectedTaskIds: taskIdsToGroup
    })
  }

  const toggleTaskSelection = (taskId: string) => {
    const newSelection = new Set(selectedTaskIds)
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId)
    } else {
      newSelection.add(taskId)
    }
    setSelectedTaskIds(newSelection)
  }

  // Get the most similar task
  const mostSimilar = potentialDuplicates[0]
  const hasHighConfidenceDuplicate = mostSimilar && mostSimilar.similarity >= 0.95

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Potential Duplicate Tasks Found
          </DialogTitle>
          <DialogDescription>
            We found {potentialDuplicates.length} existing task{potentialDuplicates.length > 1 ? 's' : ''} 
            that {potentialDuplicates.length > 1 ? 'are' : 'is'} similar to your new task. 
            Would you like to review {potentialDuplicates.length > 1 ? 'them' : 'it'} before creating a duplicate?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* New Task Preview */}
          <div>
            <h4 className="text-sm font-medium mb-2">Your New Task:</h4>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm">{newTaskDescription}</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Similar Tasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Similar Existing Tasks:</h4>
              {potentialDuplicates.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  Select tasks to group together
                </p>
              )}
            </div>
            <div className="space-y-3">
              {potentialDuplicates.map((duplicate) => (
                <Card 
                  key={duplicate.taskId}
                  className={`cursor-pointer transition-colors ${
                    selectedTaskId === duplicate.taskId 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedTaskId(duplicate.taskId)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {potentialDuplicates.length > 1 && (
                        <Checkbox
                          checked={selectedTaskIds.has(duplicate.taskId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectedTaskIds.add(duplicate.taskId)
                            } else {
                              selectedTaskIds.delete(duplicate.taskId)
                            }
                            setSelectedTaskIds(new Set(selectedTaskIds))
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Badge 
                            variant={duplicate.similarity >= 0.95 ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {getSimilarityPercentage(duplicate.similarity)} match
                          </Badge>
                          {duplicate.task.status && (
                            <Badge variant="outline" className="text-xs">
                              {duplicate.task.status}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Created {format(new Date(duplicate.task.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {duplicate.task.group_id && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Grouped
                          </Badge>
                        )}
                        {selectedTaskId === duplicate.taskId && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {duplicate.task.description}
                    </p>
                    {duplicate.task.source && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Source: {duplicate.task.source}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            
            <Button
              variant="outline"
              onClick={handleViewExisting}
              disabled={!selectedTaskId}
              className="w-full sm:w-auto"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Selected Task
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCreateAndGroup}
              className="w-full sm:w-auto"
            >
              <Users className="mr-2 h-4 w-4" />
              Create and Group Together
            </Button>
            
            <Button
              onClick={handleCreateNew}
              className="w-full sm:w-auto"
              variant={hasHighConfidenceDuplicate ? 'outline' : 'default'}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Task Anyway
            </Button>
          </div>
        </DialogFooter>

        {hasHighConfidenceDuplicate && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            <AlertTriangle className="inline h-3 w-3 mr-1" />
            The top match has {getSimilarityPercentage(mostSimilar.similarity)} similarity. 
            Consider reviewing it before creating a duplicate.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}