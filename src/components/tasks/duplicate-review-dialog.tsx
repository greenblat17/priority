'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, Plus, X, Users } from 'lucide-react'
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
  console.log('[DUPLICATE DIALOG] Render - isOpen:', isOpen)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  
  // Group duplicates by their existing groups
  const groupedDuplicates = potentialDuplicates.reduce((acc, dup) => {
    const groupId = dup.task.group?.id || 'ungrouped'
    if (!acc[groupId]) {
      acc[groupId] = {
        group: dup.task.group,
        tasks: []
      }
    }
    acc[groupId].tasks.push(dup)
    return acc
  }, {} as Record<string, { group: any; tasks: TaskSimilarity[] }>)

  const handleCreateNew = () => {
    console.log('[DUPLICATE DIALOG] Create new clicked - closing dialog')
    onAction({ action: 'create_new' })
    onClose()
  }

  const handleCancel = () => {
    console.log('[DUPLICATE DIALOG] Cancel clicked - closing dialog')
    onAction({ action: 'cancel' })
    onClose()
  }

  const handleAddToGroup = () => {
    console.log('[DUPLICATE DIALOG] handleAddToGroup called')
    console.log('[DUPLICATE DIALOG] selectedGroupId:', selectedGroupId)
    console.log('[DUPLICATE DIALOG] selectedTaskIds:', Array.from(selectedTaskIds))
    console.log('[DUPLICATE DIALOG] hasGroupSelection:', hasGroupSelection)
    console.log('[DUPLICATE DIALOG] hasTaskSelection:', hasTaskSelection)
    
    if (selectedGroupId && selectedGroupId !== 'ungrouped') {
      // Add to existing group - get all task IDs from that group
      const groupTasks = groupedDuplicates[selectedGroupId].tasks
      const taskIds = groupTasks.map(t => t.taskId)
      console.log('[DUPLICATE DIALOG] Adding to existing group:', taskIds)
      onAction({ 
        action: 'create_and_group', 
        selectedTaskIds: taskIds
      })
    } else if (selectedTaskIds.size > 0) {
      // Create new group with selected ungrouped tasks
      const taskIds = Array.from(selectedTaskIds)
      console.log('[DUPLICATE DIALOG] Creating new group with tasks:', taskIds)
      onAction({ 
        action: 'create_and_group', 
        selectedTaskIds: taskIds 
      })
    }
    
    // Close dialog immediately regardless of the action - multiple approaches
    console.log('[DUPLICATE DIALOG] Closing dialog after action')
    
    // Try multiple ways to close the dialog
    onClose()
    
    // Also try to trigger the dialog close via DOM
    setTimeout(() => {
      const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement
      if (closeButton) {
        closeButton.click()
      }
    }, 50)
    
    // Force the dialog to close by finding the dialog element
    setTimeout(() => {
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      if (dialog) {
        const event = new KeyboardEvent('keydown', { key: 'Escape' })
        dialog.dispatchEvent(event)
      }
      
      // As a last resort, hide the dialog with CSS
      const dialogOverlay = document.querySelector('[data-state="open"]') as HTMLElement
      if (dialogOverlay) {
        dialogOverlay.style.display = 'none'
      }
    }, 100)
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
  
  const hasGroupSelection = selectedGroupId && selectedGroupId !== 'ungrouped'
  const hasTaskSelection = selectedTaskIds.size > 0
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" data-dialog-close>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Potential Duplicate Tasks Found
          </DialogTitle>
          <DialogDescription>
            We found {potentialDuplicates.length} existing task{potentialDuplicates.length > 1 ? 's' : ''} 
            similar to your new task.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 py-4">
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
              <h4 className="text-sm font-medium mb-3">Similar Existing Tasks:</h4>
              <div className="space-y-3">
                {/* Show grouped tasks first */}
                {Object.entries(groupedDuplicates)
                  .filter(([groupId]) => groupId !== 'ungrouped')
                  .map(([groupId, { group, tasks }]) => {
                    const avgSimilarity = tasks.reduce((sum, t) => sum + t.similarity, 0) / tasks.length
                    const isSelected = selectedGroupId === groupId
                    
                    return (
                      <Card 
                        key={groupId}
                        className={`cursor-pointer transition-colors bg-blue-50/30 border-blue-200/50 ${
                          isSelected 
                            ? 'border-primary ring-2 ring-primary/20 bg-blue-100/40' 
                            : 'hover:border-blue-300/60 hover:bg-blue-50/50'
                        }`}
                        onClick={() => {
                          setSelectedGroupId(groupId)
                          setSelectedTaskIds(new Set()) // Clear individual selections
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                                  Group
                                </Badge>
                                <span className="text-sm font-medium text-gray-900">
                                  {group?.name || `Group of ${tasks.length} tasks`}
                                </span>
                                <Badge 
                                  variant={avgSimilarity >= 0.90 ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  ~{Math.round(avgSimilarity * 100)}% match
                                </Badge>
                              </CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {tasks.length} similar task{tasks.length > 1 ? 's' : ''} in this group
                              </CardDescription>
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {tasks.slice(0, 3).map((task) => (
                              <div key={task.taskId} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="secondary" className="text-xs">
                                  {getSimilarityPercentage(task.similarity)} match
                                </Badge>
                                <span className="truncate flex-1">{task.task.description}</span>
                              </div>
                            ))}
                            {tasks.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                ...and {tasks.length - 3} more
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                {/* Show ungrouped tasks */}
                {groupedDuplicates.ungrouped && (
                  <>
                    {groupedDuplicates.ungrouped.tasks.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Individual tasks (select to create a new group):
                        </p>
                        {groupedDuplicates.ungrouped.tasks.map((duplicate) => (
                          <Card 
                            key={duplicate.taskId}
                            className={`cursor-pointer transition-colors mb-2 ${
                              selectedTaskIds.has(duplicate.taskId)
                                ? 'border-primary ring-2 ring-primary/20' 
                                : 'hover:border-gray-400'
                            }`}
                            onClick={() => {
                              toggleTaskSelection(duplicate.taskId)
                              setSelectedGroupId(null) // Clear group selection
                            }}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={selectedTaskIds.has(duplicate.taskId)}
                                  onCheckedChange={() => toggleTaskSelection(duplicate.taskId)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-1"
                                />
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
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-sm text-muted-foreground">
                                {duplicate.task.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex gap-2 justify-between w-full">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('[DUPLICATE DIALOG] Button clicked - forcing close')
                  if (hasGroupSelection || hasTaskSelection) {
                    handleAddToGroup()
                  } else {
                    // If nothing selected, just close
                    onClose()
                  }
                }}
                disabled={!hasGroupSelection && !hasTaskSelection}
              >
                <Users className="mr-2 h-4 w-4" />
                {hasGroupSelection ? 'Add to Group' : 'Create Group'} 
                {hasTaskSelection && ` (${selectedTaskIds.size})`}
              </Button>
              
              <Button
                onClick={handleCreateNew}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Task Anyway
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}