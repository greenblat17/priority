import { z } from 'zod'

// Task source enum
export const TaskSource = {
  INTERNAL: 'internal',
  MCP: 'mcp',
  TELEGRAM: 'telegram',
  REDDIT: 'reddit',
  MAIL: 'mail',
  YOUTUBE: 'youtube',
  TWITTER: 'twitter',
  APP_STORE: 'app_store',
  GOOGLE_PLAY: 'google_play'
} as const

export type TaskSourceType = typeof TaskSource[keyof typeof TaskSource]

// Task status enum - Linear style
export const TaskStatus = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  CANCELED: 'canceled',
  DUPLICATE: 'duplicate'
} as const

export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus]

// For backward compatibility and migration
export const LegacyStatusMapping = {
  'pending': TaskStatus.TODO,
  'in_progress': TaskStatus.IN_PROGRESS,
  'completed': TaskStatus.DONE,
  'blocked': TaskStatus.CANCELED
} as const

// Form input schema
export const taskInputSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  source: z.enum([
    TaskSource.INTERNAL,
    TaskSource.MCP,
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
  // Gmail integration fields
  source_type?: 'manual' | 'gmail' | 'feedback'
  original_email_id?: string | null
  title?: string
  metadata?: any
}

// ICE reasoning type
export interface ICEReasoning {
  impact: string
  confidence: string
  ease: string
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
    time_estimate?: string | null
    confidence_score: number | null
    implementation_spec: string | null
    reasoning?: string | null
    duplicate_of: string | null
    similar_tasks: any | null
    analyzed_at: string
    // ICE prioritization fields
    ice_impact: number | null
    ice_confidence: number | null
    ice_ease: number | null
    ice_score: number | null
    ice_reasoning: ICEReasoning | null
  }
  group?: {
    id: string
    name: string | null
  } | null
}