import type { TaskGroup, CreateTaskGroupRequest } from '@/types/task-group'

/**
 * Client-side wrapper for task grouping API
 */
export async function createTaskGroupClient(
  request: CreateTaskGroupRequest
): Promise<TaskGroup | null> {
  try {
    const response = await fetch('/api/tasks/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_group',
        data: request
      }),
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to create task group:', error)
      return null
    }

    const { group } = await response.json()
    return group
  } catch (error) {
    console.error('Error creating task group:', error)
    return null
  }
}

/**
 * Add a task to an existing group (client-side)
 */
export async function addTaskToGroupClient(
  taskId: string,
  groupId: string,
  similarities?: Array<{ similarTaskId: string; similarityScore: number }>
): Promise<boolean> {
  try {
    const response = await fetch('/api/tasks/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_to_group',
        data: { taskId, groupId, similarities }
      }),
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to add task to group:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error adding task to group:', error)
    return false
  }
}

/**
 * Store similarity scores between tasks (client-side)
 */
export async function storeSimilarityScoresClient(
  similarities: Array<{
    taskId: string
    similarTaskId: string
    similarityScore: number
  }>
): Promise<boolean> {
  try {
    const response = await fetch('/api/tasks/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'store_similarities',
        data: { similarities }
      }),
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to store similarity scores:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error storing similarity scores:', error)
    return false
  }
}