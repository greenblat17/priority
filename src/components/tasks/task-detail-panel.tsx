'use client'

import { SlidePanel } from '@/components/ui/slide-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Clock, Calendar, User, Tag, AlertCircle, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { TaskWithAnalysis, TaskStatusType } from '@/types/task'
import { format } from 'date-fns'
import { PriorityDot } from './priority-dot'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskDetailPanelProps {
  task: TaskWithAnalysis
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateStatus: (taskId: string, status: TaskStatusType) => void
}

export function TaskDetailPanel({
  task,
  open,
  onOpenChange,
  onUpdateStatus,
}: TaskDetailPanelProps) {
  const copySpec = () => {
    if (task.analysis?.implementation_spec) {
      navigator.clipboard.writeText(task.analysis.implementation_spec)
      toast.success('Copied to clipboard')
    }
  }

  // Animation variants for consistent exit animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'blocked':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'in_progress':
        return 'text-blue-600'
      case 'blocked':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getCategoryVariant = (category?: string | null) => {
    if (!category) return 'outline'
    
    const categoryMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'feature': 'default',
      'bug': 'destructive',
      'improvement': 'secondary',
      'chore': 'outline',
      'research': 'outline',
    }
    
    return categoryMap[category.toLowerCase()] || 'outline'
  }

  const statusOptions: { value: TaskStatusType; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
  ]

  return (
    <SlidePanel
      open={open}
      onOpenChange={onOpenChange}
      width="lg"
      title={
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center gap-2', getStatusColor(task.status))}>
            {getStatusIcon(task.status)}
            <span className="text-sm font-medium capitalize">
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        {open && (
          <motion.div 
            className="px-6 py-4 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Task Description */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.1, duration: 0.4 }
                },
                exit: { 
                  opacity: 0, 
                  y: -10,
                  transition: { duration: 0.2 }
                }
              }}
            >
          <h3 className="text-xl font-semibold mb-2">{task.description}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <motion.div 
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(task.created_at), 'MMM d, yyyy')}
            </motion.div>
            {task.analysis?.time_estimate && (
              <motion.div 
                className="flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              >
                <Clock className="h-3.5 w-3.5" />
                {task.analysis.time_estimate}
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        >
          <Separator />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <h4 className="text-sm font-medium mb-3">Status</h4>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option, index) => (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  delay: 0.4 + index * 0.05,
                  duration: 0.2,
                  type: 'spring',
                  stiffness: 500,
                  damping: 25
                }}
              >
                <Button
                  variant={task.status === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    onUpdateStatus(task.id, option.value)
                    toast.success(`Status updated to ${option.label}`)
                  }}
                  className="gap-2 transition-all hover:scale-105"
                >
                  {option.value === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                  {option.value === 'in_progress' && <Clock className="h-3 w-3" />}
                  {option.value === 'blocked' && <AlertCircle className="h-3 w-3" />}
                  {option.value === 'pending' && <Circle className="h-3 w-3" />}
                  {option.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        >
          <Separator />
        </motion.div>

        {/* Task Analysis */}
        {task.analysis && (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.65, duration: 0.4 }}
          >
            <h4 className="text-sm font-medium">Analysis</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <p className="text-sm text-muted-foreground mb-1">Priority</p>
                <div className="flex items-center gap-2">
                  <PriorityDot priority={task.analysis.priority || 5} />
                  <motion.span 
                    className="font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.75, duration: 0.2 }}
                  >
                    {task.analysis.priority || 'N/A'}/10
                  </motion.span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.3 }}
              >
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <Badge variant={getCategoryVariant(task.analysis.category)}>
                  {task.analysis.category || 'Uncategorized'}
                </Badge>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${task.analysis.confidence_score || 0}%` }}
                      transition={{ delay: 0.85, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <motion.span 
                    className="text-sm font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.2 }}
                  >
                    {task.analysis.confidence_score || 0}%
                  </motion.span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.3 }}
              >
                <p className="text-sm text-muted-foreground mb-1">Complexity</p>
                <Badge variant="outline">
                  {task.analysis.complexity || 'Unknown'}
                </Badge>
              </motion.div>
            </div>

            {task.analysis?.reasoning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              >
                <p className="text-sm text-muted-foreground mb-1">Reasoning</p>
                <p className="text-sm">{task.analysis.reasoning}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {task.analysis?.implementation_spec && (
          <>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ delay: 0.95, duration: 0.3 }}
              style={{ transformOrigin: 'left' }}
            >
              <Separator />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 1, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Implementation Spec</h4>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copySpec}
                    className="gap-2"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </motion.div>
              </div>
              <motion.div 
                className="bg-muted rounded-lg p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.05, duration: 0.3 }}
              >
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {task.analysis.implementation_spec}
                </pre>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* Task Group */}
        {task.group && (
          <>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ delay: 1.05, duration: 0.3 }}
              style={{ transformOrigin: 'left' }}
            >
              <Separator />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 1.1, duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Group</h4>
              </div>
              <p className="text-sm text-muted-foreground">{task.group?.name}</p>
            </motion.div>
          </>
        )}

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          transition={{ delay: 1.1, duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        >
          <Separator />
        </motion.div>
        <motion.div 
          className="space-y-2 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span>Created {format(new Date(task.created_at), 'PPP')}</span>
          </div>
          {task.updated_at !== task.created_at && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>Updated {format(new Date(task.updated_at), 'PPP')}</span>
            </div>
          )}
        </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlidePanel>
  )
}