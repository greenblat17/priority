'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useCreateTask, taskKeys } from '@/hooks/use-tasks'
import { useEscapeKey } from '@/hooks/use-keyboard-shortcuts'
import {
  Building,
  Send,
  MessageSquare,
  Mail,
  Youtube,
  Twitter,
  Smartphone,
  Play,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/animated-dialog'
import { motion } from 'framer-motion'
import { springs } from '@/lib/animations'
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
import { Checkbox } from '@/components/ui/checkbox'

import { TaskInput, taskInputSchema, TaskSource } from '@/types/task'
import { DuplicateReviewDialog } from './duplicate-review-dialog'
import type { TaskSimilarity, DuplicateCheckResponse } from '@/types/duplicate'
import type {
  ExtendedDuplicateReviewAction,
  TaskGroup,
} from '@/types/task-group'
import { createTaskGroupClient } from '@/lib/task-grouping-client'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const router = useRouter()

  // State for duplicate detection (kept for future dialog use)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [potentialDuplicates, setPotentialDuplicates] = useState<
    TaskSimilarity[]
  >([])
  const [pendingTaskData, setPendingTaskData] = useState<TaskInput | null>(null)

  // Detect platform for keyboard shortcut display
  const [isMac, setIsMac] = useState(false)
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskInputSchema) as any,
    defaultValues: {
      source: TaskSource.INTERNAL,
      description: '',
      customerInfo: '',
    },
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [title, setTitle] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)

  // Close on escape key
  useEscapeKey(onClose, isOpen)

  // Submit on Cmd/Ctrl + Enter
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Cmd (Mac) or Ctrl (Windows/Linux) + Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        // Only submit if form is valid
        form.handleSubmit(handleSubmit)()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, form])

  const createTaskMutation = useMutation({
    mutationFn: async (params: {
      data: TaskInput
      groupWithTaskIds?: string[]
      similarities?: Array<{ taskId: string; similarity: number }>
      existingGroup?: TaskGroup | null
    }) => {
      const { data, groupWithTaskIds, similarities, existingGroup } = params
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Insert task
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          title: (data.title ?? title) || null,
          description: data.description,
          source: data.source,
          customer_info: data.customerInfo || null,
          user_id: user.id,
          status: 'todo',
        })
        .select()
        .single()

      if (error) throw error

      let taskGroup = existingGroup

      // Handle grouping if requested
      if (groupWithTaskIds && groupWithTaskIds.length > 0) {
        try {
          // Create group with the new task and similar tasks
          const allTaskIds = [task.id, ...groupWithTaskIds]

          // Prepare similarity data
          const similarityData =
            similarities?.map((sim) => ({
              taskId: task.id,
              similarTaskId: sim.taskId,
              similarityScore: sim.similarity,
            })) || []

          const group = await createTaskGroupClient({
            taskIds: allTaskIds,
            similarities: similarityData,
          })

          if (group) {
            console.log('Task group created:', group)
            taskGroup = group
          }
        } catch (error) {
          console.error('Failed to create task group:', error)
          // Non-critical error, continue
        }
      }

      // Invalidate queries immediately to show the new task
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })

      // Trigger AI analysis asynchronously (fire and forget)

      // Trigger duplicate check in background
      fetch('/api/tasks/check-duplicates-async', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          description: task.description,
          userId: user.id,
        }),
        credentials: 'include',
      }).catch((error) => {
        console.error('Background duplicate check failed:', error)
      })
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id }),
        credentials: 'include',
      })
        .then((response) => {
          if (!response.ok) {
            console.error(
              '[AI Analysis] Background analysis failed:',
              response.status
            )
          } else {
            console.log(
              '[AI Analysis] Background analysis started for task:',
              task.id
            )
          }
        })
        .catch((error) => {
          console.error('[AI Analysis] Background analysis error:', error)
          // Silent failure - don't interrupt user flow
        })

      // Return task with group information for optimistic updates
      return { ...task, group: taskGroup }
    },
    onMutate: async (params) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.lists())

      // Optimistically update to the new value
      queryClient.setQueryData(taskKeys.lists(), (old: any) => {
        if (!old) return old

        // Create optimistic task with temporary ID
        const optimisticTask = {
          id: 'temp-' + Date.now(),
          description: params.data.description,
          source: params.data.source,
          customer_info: params.data.customerInfo || null,
          status: 'todo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          analysis: null,
          group:
            params.existingGroup ||
            (params.groupWithTaskIds
              ? {
                  id: 'temp-group-' + Date.now(),
                  name: 'New Group',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              : null),
        }

        return [optimisticTask, ...old]
      })

      // Return a context with the previous tasks for rollback
      return { previousTasks }
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context-value from onMutate
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks)
      }
      toast.error('Failed to add task', {
        description: error.message || 'Please try again',
      })
    },
    onSuccess: async (created) => {
      toast.success('Task added successfully', {
        description: 'AI is analyzing your task...',
      })
      // If an attachment is selected, upload it now
      const file = attachment
      if (file && created?.id) {
        const formData = new FormData()
        formData.append('file', file)
        try {
          await fetch(`/api/tasks/${created.id}/attachments`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          })
        } catch (e) {
          console.error('Attachment upload failed', e)
        }
        const el = document.getElementById(
          'file-input'
        ) as HTMLInputElement | null
        if (el) el.value = ''
        setAttachment(null)
      }
      form.reset()
      onClose()
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })

  // Check for duplicates before creating task
  const checkDuplicatesMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await fetch('/api/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
        credentials: 'include',
      })

      if (!response.ok) {
        // If duplicate check fails, proceed with task creation
        return {
          potentialDuplicates: [],
          embedding: [],
        } as DuplicateCheckResponse
      }

      return response.json() as Promise<DuplicateCheckResponse>
    },
  })

  const handleSubmit = async (data: TaskInput) => {
    const combinedDescription = (data.description || '').trim()

    createTaskMutation.mutate({
      data: {
        ...data,
        title: title.trim() || undefined,
        description: combinedDescription,
      },
    })
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
            .filter((dup) => action.selectedTaskIds.includes(dup.taskId))
            .map((dup) => ({ taskId: dup.taskId, similarity: dup.similarity }))

          // Get the group from one of the selected tasks (if they're already grouped)
          const selectedTasks = potentialDuplicates.filter((dup) =>
            action.selectedTaskIds.includes(dup.taskId)
          )
          // Check if all selected tasks belong to the same group
          const existingGroup =
            selectedTasks.length > 0 &&
            selectedTasks.every(
              (t) => t.task.group?.id === selectedTasks[0].task.group?.id
            )
              ? selectedTasks[0].task.group
              : null

          createTaskMutation.mutate({
            data: pendingTaskData,
            groupWithTaskIds: action.selectedTaskIds,
            similarities,
            existingGroup,
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
        <DialogContent className="max-w-lg max-h-[90vh] bg-white rounded-2xl flex flex-col overflow-hidden">
          <DialogHeader className="space-y-2 flex-shrink-0">
            <DialogTitle className="text-xl font-semibold text-black">
              Add New Task
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Describe your task and our AI will analyze it for you
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6">
            <Form {...form}>
              <form
                id="quick-add-form"
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6 pb-2"
              >
                {/* Short title (optional) */}
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="text-lg border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="What needs to be done?"
                          className="min-h-[100px] text-base resize-none border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                          autoFocus
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        Shift+Enter for new line · {isMac ? '⌘' : 'Ctrl'}+Enter
                        to add
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Source and Customer Info fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Source</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-200">
                              <SelectValue placeholder="Where did this task come from?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={TaskSource.INTERNAL}>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                <span>Internal</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskSource.TELEGRAM}>
                              <div className="flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                <span>Telegram</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskSource.REDDIT}>
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                <span>Reddit</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskSource.MAIL}>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>Mail</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskSource.YOUTUBE}>
                              <div className="flex items-center gap-2">
                                <Youtube className="h-4 w-4" />
                                <span>YouTube</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskSource.TWITTER}>
                              <div className="flex items-center gap-2">
                                <Twitter className="h-4 w-4" />
                                <span>Twitter</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskSource.APP_STORE}>
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                <span>App Store</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskSource.GOOGLE_PLAY}>
                              <div className="flex items-center gap-2">
                                <Play className="h-4 w-4" />
                                <span>Google Play</span>
                              </div>
                            </SelectItem>
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
                        <FormLabel className="text-sm">Customer Info</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Customer name or email"
                            className="border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Collapsible advanced options */}
                <details className="group">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-black transition-colors">
                    Advanced options
                  </summary>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={springs.smooth}
                    className="mt-4 space-y-4 overflow-hidden"
                  >
                    <p className="text-xs text-gray-500">
                      Coming soon: Priority override, category, estimated hours,
                      due date, tags, and notes.
                    </p>
                  </motion.div>
                </details>
              </form>
            </Form>
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-3 flex items-center justify-between gap-3">
            <form
              id="attach-form"
              className="flex items-center gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  id="file-input"
                  name="file"
                  type="file"
                  className="hidden"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                />
                <span className="inline-flex items-center rounded border border-gray-200 px-2 py-1">
                  {attachment ? `Attached: ${attachment.name}` : 'Attach'}
                </span>
              </label>
            </form>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="quick-add-form"
              disabled={createTaskMutation.isPending}
              title={`Add Task (${isMac ? '⌘' : 'Ctrl'} + Enter)`}
            >
              {createTaskMutation.isPending ? (
                'Adding...'
              ) : (
                <>
                  Add Task
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-black/5 rounded ml-1">
                    <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>
                    <span className="text-xs">↵</span>
                  </kbd>
                </>
              )}
            </Button>
          </div>
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
