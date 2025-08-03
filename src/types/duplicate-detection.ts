export interface DuplicateDetection {
  id: string
  task_id: string
  user_id: string
  duplicates: Array<{
    taskId: string
    similarity: number
    description: string
  }>
  detected_at: string
  status: 'pending' | 'dismissed' | 'grouped'
  created_at?: string
  updated_at?: string
}