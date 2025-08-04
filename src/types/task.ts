import { z } from 'zod'

// Task source enum
export const TaskSource = {
  INTERNAL: 'internal',
  TELEGRAM: 'telegram',
  REDDIT: 'reddit',
  MAIL: 'mail',
  YOUTUBE: 'youtube',
  TWITTER: 'twitter',
  APP_STORE: 'app_store',
  GOOGLE_PLAY: 'google_play'
} as const

export type TaskSourceType = typeof TaskSource[keyof typeof TaskSource]

// Task status enum
export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked'
} as const

export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus]

// Form input schema
export const taskInputSchema = z.object({
  description: z.string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters'),
  source: z.enum([
    TaskSource.INTERNAL,
    TaskSource.TELEGRAM,
    TaskSource.REDDIT,
    TaskSource.MAIL,
    TaskSource.YOUTUBE,
    TaskSource.TWITTER,
    TaskSource.APP_STORE,
    TaskSource.GOOGLE_PLAY
  ]).default(TaskSource.INTERNAL),
  customerInfo: z.string().optional()
})

export type TaskInput = z.infer<typeof taskInputSchema>

// Database task type (matches Supabase schema)
export interface Task {
  id: string
  user_id: string
  description: string
  source: string | null
  customer_info: string | null
  status: TaskStatusType
  group_id: string | null
  created_at: string
  updated_at: string
  // Extended fields from analysis for display
  priority?: number
  category?: string
  complexity?: string
}

// Task with analysis (joined data)
export interface TaskWithAnalysis extends Task {
  analysis?: {
    id: string
    task_id: string
    category: 'bug' | 'feature' | 'improvement' | 'business' | 'other' | null
    priority: number | null
    complexity: 'easy' | 'medium' | 'hard' | null
    estimated_hours: number | null
    confidence_score: number | null
    implementation_spec: string | null
    duplicate_of: string | null
    similar_tasks: any | null
    analyzed_at: string
  }
}