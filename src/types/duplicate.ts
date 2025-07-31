import { Task } from './task'
import { TaskGroup } from './task-group'

export interface TaskWithGroup extends Task {
  group?: TaskGroup | null
}

export interface TaskSimilarity {
  taskId: string
  task: TaskWithGroup
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