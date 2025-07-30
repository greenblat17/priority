import { Task } from './task'

export interface TaskSimilarity {
  taskId: string
  task: Task
  similarity: number
  embedding?: number[]
}

export interface DuplicateCheckRequest {
  description: string
  excludeTaskId?: string // Exclude a specific task from comparison (e.g., when editing)
}

export interface DuplicateCheckResponse {
  potentialDuplicates: TaskSimilarity[]
  embedding: number[]
}

export interface DuplicateReviewAction {
  action: 'create_new' | 'view_existing' | 'cancel'
  selectedTaskId?: string
}