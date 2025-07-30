'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useCreateTask } from '@/hooks/use-tasks'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

import { TaskInput, taskInputSchema, TaskSource } from '@/types/task'
import { DuplicateReviewDialog } from './duplicate-review-dialog'
import type { TaskSimilarity, DuplicateCheckResponse } from '@/types/duplicate'
import type { ExtendedDuplicateReviewAction } from '@/types/task-group'
import { createTaskGroupClient } from '@/lib/task-grouping-client'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const router = useRouter()
  
  // State for duplicate detection
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [potentialDuplicates, setPotentialDuplicates] = useState<TaskSimilarity[]>([])
  const [pendingTaskData, setPendingTaskData] = useState<TaskInput | null>(null)
  
  const form = useForm<TaskInput>({
    resolver: zodResolver(taskInputSchema),
    defaultValues: {
      source: TaskSource.INTERNAL,
      description: '',
      customerInfo: ''
    }
  })

  const createTaskMutation = useMutation({
    mutationFn: async (params: { 
      data: TaskInput, 
      groupWithTaskIds?: string[],
      similarities?: Array<{ taskId: string, similarity: number }>
    }) => {
      const { data, groupWithTaskIds, similarities } = params
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Insert task
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          description: data.description,
          source: data.source,
          customer_info: data.customerInfo || null,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Handle grouping if requested
      if (groupWithTaskIds && groupWithTaskIds.length > 0) {
        try {
          // Create group with the new task and similar tasks
          const allTaskIds = [task.id, ...groupWithTaskIds]
          
          // Prepare similarity data
          const similarityData = similarities?.map(sim => ({
            taskId: task.id,
            similarTaskId: sim.taskId,
            similarityScore: sim.similarity
          })) || []
          
          const group = await createTaskGroupClient({
            taskIds: allTaskIds,
            similarities: similarityData
          })
          
          if (group) {
            console.log('Task group created:', group)
          }
        } catch (error) {
          console.error('Failed to create task group:', error)
          // Non-critical error, continue
        }
      }

      // Trigger AI analysis
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id }),
          credentials: 'include' // Important: Include cookies for authentication
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('AI Analysis failed:', response.status, errorData)
          
          // Show user-friendly error message
          if (response.status === 401) {
            toast.error('Authentication error. Please login again.')
          } else if (response.status === 503) {
            toast.warning('AI service not configured. Analysis skipped.')
          } else {
            toast.warning(`AI analysis failed: ${errorData.error || 'Unknown error'}`)
          }
        } else {
          const result = await response.json()
          console.log('AI Analysis triggered successfully:', result)
        }
      } catch (error) {
        console.error('Failed to trigger analysis:', error)
        toast.error('Failed to analyze task. You can retry later.')
      }

      return task
    },
    onSuccess: () => {
      toast.success('Task added successfully', {
        description: 'AI is analyzing your task...',
      })
      form.reset()
      onClose()
      // Invalidate tasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: Error) => {
      toast.error('Failed to add task', {
        description: error.message || 'Please try again',
      })
    }
  })

  // Check for duplicates before creating task
  const checkDuplicatesMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await fetch('/api/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
        credentials: 'include'
      })

      if (!response.ok) {
        // If duplicate check fails, proceed with task creation
        return { potentialDuplicates: [], embedding: [] } as DuplicateCheckResponse
      }

      return response.json() as Promise<DuplicateCheckResponse>
    }
  })

  const handleSubmit = async (data: TaskInput) => {
    // Store the task data for later use
    setPendingTaskData(data)
    
    // Check for duplicates
    setIsCheckingDuplicates(true)
    
    try {
      const duplicateResult = await checkDuplicatesMutation.mutateAsync(data.description)
      
      if (duplicateResult.potentialDuplicates.length > 0) {
        // Show duplicate review dialog
        setPotentialDuplicates(duplicateResult.potentialDuplicates)
        setShowDuplicateDialog(true)
      } else {
        // No duplicates found, create task directly
        createTaskMutation.mutate({ data })
      }
    } catch (error) {
      // If duplicate check fails, proceed with task creation
      console.error('Duplicate check failed:', error)
      createTaskMutation.mutate(data)
    } finally {
      setIsCheckingDuplicates(false)
    }
  }

  const handleDuplicateAction = (action: ExtendedDuplicateReviewAction) => {
    setShowDuplicateDialog(false)
    
    switch (action.action) {
      case 'create_new':
        // Create the task anyway
        if (pendingTaskData) {
          createTaskMutation.mutate({ data: pendingTaskData })
        }
        break
      
      case 'create_and_group':
        // Create task and group with similar tasks
        if (pendingTaskData && 'selectedTaskIds' in action) {
          const similarities = potentialDuplicates
            .filter(dup => action.selectedTaskIds.includes(dup.taskId))
            .map(dup => ({ taskId: dup.taskId, similarity: dup.similarity }))
          
          createTaskMutation.mutate({ 
            data: pendingTaskData,
            groupWithTaskIds: action.selectedTaskIds,
            similarities
          })
        }
        break
      
      case 'view_existing':
        // Navigate to tasks page and close modal
        onClose()
        router.push('/tasks')
        // Optionally, we could highlight the selected task
        break
      
      case 'cancel':
        // Just close the duplicate dialog
        setPotentialDuplicates([])
        setPendingTaskData(null)
        break
    }
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Describe your task or paste user feedback. Our AI will analyze and prioritize it.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the task, bug, or feature request..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be as detailed as possible for better AI analysis
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Where did this task come from?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TaskSource.CUSTOMER_EMAIL}>Customer Email</SelectItem>
                      <SelectItem value={TaskSource.SUPPORT_TICKET}>Support Ticket</SelectItem>
                      <SelectItem value={TaskSource.SOCIAL_MEDIA}>Social Media</SelectItem>
                      <SelectItem value={TaskSource.INTERNAL}>Internal</SelectItem>
                      <SelectItem value={TaskSource.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customerInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Info (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Customer name or email" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createTaskMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTaskMutation.isPending || isCheckingDuplicates}
              >
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : isCheckingDuplicates ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Add Task'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    {/* Duplicate Review Dialog */}
    <DuplicateReviewDialog
      isOpen={showDuplicateDialog}
      onClose={() => setShowDuplicateDialog(false)}
      newTaskDescription={pendingTaskData?.description || ''}
      potentialDuplicates={potentialDuplicates}
      onAction={handleDuplicateAction}
    />
  </>
  )
}