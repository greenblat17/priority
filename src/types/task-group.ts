import type { Task } from './task'

// Task group type (matches Supabase schema)
export interface TaskGroup {
  id: string
  name: string | null
  created_at: string
  updated_at: string
}

// Task similarity type (matches Supabase schema)
export interface TaskSimilarity {
  id: string
  task_id: string
  similar_task_id: string
  similarity_score: number
  created_at: string
}

// Task with group information
export interface TaskWithGroup extends Task {
  group_id: string | null
  group?: TaskGroup
}

// Task group with tasks
export interface TaskGroupWithTasks extends TaskGroup {
  tasks: TaskWithGroup[]
  similarities?: TaskSimilarity[]
}

// Group creation request
export interface CreateTaskGroupRequest {
  name?: string
  taskIds: string[]
  similarities?: Array<{
    taskId: string
    similarTaskId: string
    similarityScore: number
  }>
}

// Group action types for duplicate dialog
export interface GroupAction {
  action: 'create_and_group'
  selectedTaskIds: string[]
  groupName?: string
}

// Extended duplicate review action
export type ExtendedDuplicateReviewAction = 
  | { action: 'create_new' }
  | { action: 'view_existing'; selectedTaskId: string }
  | { action: 'cancel' }
  | GroupAction