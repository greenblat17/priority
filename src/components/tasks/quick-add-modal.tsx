'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  const form = useForm<TaskInput>({
    resolver: zodResolver(taskInputSchema),
    defaultValues: {
      source: TaskSource.INTERNAL,
      description: '',
      customerInfo: ''
    }
  })

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskInput) => {
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

      // Trigger AI analysis (placeholder for now)
      try {
        await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id }),
        })
      } catch (error) {
        console.error('Failed to trigger analysis:', error)
        // Don't fail the mutation if analysis fails
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

  const handleSubmit = (data: TaskInput) => {
    createTaskMutation.mutate(data)
  }

  return (
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
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
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
  )
}