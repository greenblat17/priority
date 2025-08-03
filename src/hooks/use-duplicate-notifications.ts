'use client'

import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { DuplicateDetection } from '@/types/duplicate-detection'
import type { Task } from '@/types/task'

const POLL_INTERVAL = 5000 // Check every 5 seconds
const NOTIFICATION_DURATION = 30000 // 30 seconds

export function useDuplicateNotifications() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()
  const shownNotifications = useRef<Set<string>>(new Set())

  // Query for pending duplicate detections
  const { data: pendingDetections } = useQuery({
    queryKey: ['duplicate-detections', 'pending'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('duplicate_detections')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('detected_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch duplicate detections:', error)
        return []
      }

      return data as DuplicateDetection[]
    },
    refetchInterval: POLL_INTERVAL,
    enabled: true
  })

  // Mutation to update detection status
  const updateDetectionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'dismissed' | 'grouped' }) => {
      const { error } = await supabase
        .from('duplicate_detections')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duplicate-detections'] })
    }
  })

  // Show notifications for new detections
  useEffect(() => {
    if (!pendingDetections || pendingDetections.length === 0) return

    pendingDetections.forEach(async (detection) => {
      // Skip if already shown
      if (shownNotifications.current.has(detection.id)) return
      shownNotifications.current.add(detection.id)

      // Get the task details
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', detection.task_id)
        .single()

      if (!task) return

      const duplicateCount = detection.duplicates.length
      const topDuplicate = detection.duplicates[0]

      // Show persistent toast with actions
      const taskPreview = task.description.length > 60 
        ? `${task.description.substring(0, 60)}...` 
        : task.description;
      
      const title = 'Found similar tasks!';
      const message = `"${taskPreview}" is ${Math.round(topDuplicate.similarity * 100)}% similar to ${duplicateCount} other task${duplicateCount > 1 ? 's' : ''}`;
      
      toast(title, {
          description: message,
          duration: NOTIFICATION_DURATION,
          id: detection.id,
          action: {
            label: 'Review & Group',
            onClick: () => {
              // Open the duplicate review dialog
              openDuplicateReviewDialog(detection, task)
              updateDetectionStatus.mutate({ id: detection.id, status: 'grouped' })
            }
          },
          cancel: {
            label: 'Quick Group',
            onClick: () => {
              // Quick group without review
              quickGroupTasks(detection, task)
              updateDetectionStatus.mutate({ id: detection.id, status: 'grouped' })
            }
          },
          onDismiss: () => {
            // Mark as dismissed if user closes the toast
            updateDetectionStatus.mutate({ id: detection.id, status: 'dismissed' })
          },
          closeButton: true,
          style: {
            maxWidth: '520px',
            padding: '16px',
          },
          classNames: {
            toast: 'group-[.toaster]:text-base',
            title: 'group-[.toaster]:font-semibold group-[.toaster]:text-base',
            description: 'group-[.toaster]:text-sm group-[.toaster]:leading-relaxed',
            actionButton: 'group-[.toaster]:bg-gray-900 group-[.toaster]:text-white',
            cancelButton: 'group-[.toaster]:bg-gray-100 group-[.toaster]:text-gray-700',
          }
        }
      )
    })
  }, [pendingDetections])

  const openDuplicateReviewDialog = async (detection: DuplicateDetection, task: Task) => {
    try {
      console.log('[Duplicate Review] Opening dialog for task:', task.id)
      console.log('[Duplicate Review] Detection:', detection)
      
      // Get full task details for duplicates
      const duplicateTaskIds = detection.duplicates.map(d => d.taskId)
      const { data: duplicateTasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          group:task_groups!group_id (*),
          analysis:task_analyses (*)
        `)
        .in('id', duplicateTaskIds)

      if (error) {
        console.error('[Duplicate Review] Error fetching duplicate tasks:', error)
        toast.error('Failed to load duplicate tasks')
        return
      }

      if (!duplicateTasks || duplicateTasks.length === 0) {
        console.error('[Duplicate Review] No duplicate tasks found')
        toast.error('Could not find duplicate tasks')
        return
      }

      console.log('[Duplicate Review] Found duplicate tasks:', duplicateTasks)

      // Get the full task data with analysis
      const { data: fullTask, error: taskError } = await supabase
        .from('tasks')
        .select(`
          *,
          group:task_groups!group_id (*),
          analysis:task_analyses (*)
        `)
        .eq('id', task.id)
        .single()

      if (taskError || !fullTask) {
        console.error('[Duplicate Review] Error fetching full task:', taskError)
        toast.error('Failed to load task details')
        return
      }

      // Store data in session storage for the dialog
      const reviewData = {
        newTask: fullTask,
        duplicates: duplicateTasks,
        similarities: detection.duplicates
      }
      
      sessionStorage.setItem('duplicateReviewData', JSON.stringify(reviewData))
      console.log('[Duplicate Review] Stored review data:', reviewData)

      // Navigate to tasks page with dialog open
      // If already on tasks page, force a refresh of the component
      const currentPath = window.location.pathname
      if (currentPath === '/tasks') {
        // Dispatch a custom event to open the dialog
        window.dispatchEvent(new CustomEvent('openDuplicateReview', { 
          detail: reviewData 
        }))
      } else {
        router.push('/tasks?showDuplicateReview=true')
      }
    } catch (error) {
      console.error('[Duplicate Review] Unexpected error:', error)
      toast.error('Failed to open duplicate review dialog')
    }
  }

  const quickGroupTasks = async (detection: DuplicateDetection, task: Task) => {
    try {
      // Create a group with all similar tasks
      const allTaskIds = [task.id, ...detection.duplicates.map(d => d.taskId)]
      
      const response = await fetch('/api/tasks/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskIds: allTaskIds,
          similarities: detection.duplicates.map(d => ({
            taskId: task.id,
            similarTaskId: d.taskId,
            similarityScore: d.similarity
          }))
        }),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to group tasks')

      toast.success('Tasks grouped successfully!', {
        description: `${allTaskIds.length} similar tasks have been grouped together.`
      })

      // Invalidate task queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    } catch (error) {
      console.error('Failed to group tasks:', error)
      toast.error('Failed to group tasks', {
        description: 'Please try again or use the review dialog.'
      })
    }
  }

  return {
    pendingDetections,
    updateDetectionStatus
  }
}