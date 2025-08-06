'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { TaskWithAnalysis, TaskStatusType } from '@/types/task'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { taskKeys } from '@/hooks/use-tasks'

interface TaskEditDialogProps {
  task: TaskWithAnalysis
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskEditDialog({
  task,
  open,
  onOpenChange,
}: TaskEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  // Form state
  const [title, setTitle] = useState(task.title || '')
  const [description, setDescription] = useState(task.description || '')
  const [status, setStatus] = useState<TaskStatusType>(task.status)
  const [source, setSource] = useState(task.source || '')
  const [customerInfo, setCustomerInfo] = useState(task.customer_info || '')
  const [priority, setPriority] = useState(task.analysis?.priority || 5)
  const [category, setCategory] = useState(task.analysis?.category || 'feature')
  const [complexity, setComplexity] = useState(task.analysis?.complexity || 'medium')
  
  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title || '')
    setDescription(task.description || '')
    setStatus(task.status)
    setSource(task.source || '')
    setCustomerInfo(task.customer_info || '')
    setPriority(task.analysis?.priority || 5)
    setCategory(task.analysis?.category || 'feature')
    setComplexity(task.analysis?.complexity || 'medium')
  }, [task])
  
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Update task basic info
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          status,
          source: source || null,
          customer_info: customerInfo || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id)
      
      if (taskError) throw taskError
      
      // Update or create task analysis if any AI fields changed
      const analysisChanged = priority !== task.analysis?.priority || 
                            category !== task.analysis?.category || 
                            complexity !== task.analysis?.complexity
      
      if (analysisChanged && task.analysis) {
        const { error: analysisError } = await supabase
          .from('task_analyses')
          .update({
            priority,
            category,
            complexity,
            updated_at: new Date().toISOString(),
          })
          .eq('task_id', task.id)
        
        if (analysisError) throw analysisError
      } else if (analysisChanged && !task.analysis) {
        // Create new analysis if it doesn't exist
        const { error: analysisError } = await supabase
          .from('task_analyses')
          .insert({
            task_id: task.id,
            priority,
            category,
            complexity,
            confidence_score: 80, // Default confidence for manual entries
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        
        if (analysisError) throw analysisError
      }
      
      // Invalidate and refetch tasks
      await queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      
      toast.success('Task updated successfully')
      onOpenChange(false)
      
      // If description changed significantly, trigger re-analysis
      if (description.trim() !== task.description) {
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id }),
        }).catch(console.error)
        
        toast.info('AI is re-analyzing the updated task...')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as TaskStatusType)}>
              <SelectTrigger id="status" disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select value={source || "none"} onValueChange={(value) => setSource(value === "none" ? "" : value)}>
              <SelectTrigger id="source" disabled={isLoading}>
                <SelectValue placeholder="Select source..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer">Customer Info</Label>
            <Input
              id="customer"
              value={customerInfo}
              onChange={(e) => setCustomerInfo(e.target.value)}
              placeholder="Customer name or info..."
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority (1-10)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="priority"
                min={1}
                max={10}
                step={1}
                value={[priority]}
                onValueChange={(value) => setPriority(value[0])}
                disabled={isLoading}
                className="flex-1"
              />
              <span className="w-8 text-center font-medium">{priority}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
              <SelectTrigger id="category" disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="complexity">Complexity</Label>
            <Select value={complexity} onValueChange={(value: any) => setComplexity(value)}>
              <SelectTrigger id="complexity" disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}