import { createClient } from '@/lib/supabase/server'
import type { TaskGroup, TaskSimilarity, CreateTaskGroupRequest, TaskWithGroup } from '@/types/task-group'
import type { Task } from '@/types/task'

/**
 * Create a new task group with the specified tasks
 */
export async function createTaskGroup(
  request: CreateTaskGroupRequest
): Promise<TaskGroup | null> {
  const supabase = await createClient()
  
  try {
    // Get the current user to ensure we're authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User not authenticated:', userError)
      return null
    }
    
    // Start a transaction by creating the group first
    const groupName = request.name || generateGroupName(request.taskIds.length)
    
    // Create the group - log any errors
    const { data: group, error: groupError } = await supabase
      .from('task_groups')
      .insert({ name: groupName })
      .select()
      .single()
    
    if (groupError || !group) {
      console.error('Failed to create task group:', {
        error: groupError,
        code: groupError?.code,
        message: groupError?.message,
        details: groupError?.details,
        hint: groupError?.hint,
        user_id: user.id
      })
      return null
    }
    
    // Update tasks to belong to this group
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ group_id: group.id })
      .in('id', request.taskIds)
    
    if (updateError) {
      console.error('Failed to update tasks with group:', updateError)
      // TODO: Rollback group creation
      return null
    }
    
    // Store similarity scores if provided
    if (request.similarities && request.similarities.length > 0) {
      const similarityRecords = request.similarities.map(sim => ({
        task_id: sim.taskId,
        similar_task_id: sim.similarTaskId,
        similarity_score: sim.similarityScore
      }))
      
      const { error: simError } = await supabase
        .from('task_similarities')
        .insert(similarityRecords)
      
      if (simError) {
        console.error('Failed to store similarity scores:', simError)
        // Non-critical error, continue
      }
    }
    
    return group
  } catch (error) {
    console.error('Error creating task group:', error)
    return null
  }
}

/**
 * Add a task to an existing group
 */
export async function addTaskToGroup(
  taskId: string,
  groupId: string,
  similarities?: Array<{ similarTaskId: string; similarityScore: number }>
): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    // Update task with group ID
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ group_id: groupId })
      .eq('id', taskId)
    
    if (updateError) {
      console.error('Failed to add task to group:', updateError)
      return false
    }
    
    // Store similarity scores with other group members
    if (similarities && similarities.length > 0) {
      const similarityRecords = similarities.map(sim => ({
        task_id: taskId,
        similar_task_id: sim.similarTaskId,
        similarity_score: sim.similarityScore
      }))
      
      const { error: simError } = await supabase
        .from('task_similarities')
        .insert(similarityRecords)
      
      if (simError) {
        console.error('Failed to store similarity scores:', simError)
        // Non-critical error, continue
      }
    }
    
    return true
  } catch (error) {
    console.error('Error adding task to group:', error)
    return false
  }
}

/**
 * Store similarity scores between tasks
 */
export async function storeSimilarityScores(
  similarities: Array<{
    taskId: string
    similarTaskId: string
    similarityScore: number
  }>
): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    // Store bidirectional similarities
    const records: any[] = []
    
    for (const sim of similarities) {
      // Store both directions for easier querying
      records.push({
        task_id: sim.taskId,
        similar_task_id: sim.similarTaskId,
        similarity_score: sim.similarityScore
      })
      records.push({
        task_id: sim.similarTaskId,
        similar_task_id: sim.taskId,
        similarity_score: sim.similarityScore
      })
    }
    
    const { error } = await supabase
      .from('task_similarities')
      .upsert(records, { onConflict: 'task_id,similar_task_id' })
    
    if (error) {
      console.error('Failed to store similarity scores:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error storing similarity scores:', error)
    return false
  }
}

/**
 * Detect if a new task matches tasks from multiple existing groups
 */
export async function detectGroupConflicts(
  similarTaskIds: string[]
): Promise<{ hasConflict: boolean; groups: TaskGroup[] }> {
  const supabase = await createClient()
  
  try {
    // Get tasks with their groups
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, group_id, task_groups!inner(id, name)')
      .in('id', similarTaskIds)
      .not('group_id', 'is', null)
    
    if (error || !tasks) {
      console.error('Failed to detect group conflicts:', error)
      return { hasConflict: false, groups: [] }
    }
    
    // Extract unique groups
    const uniqueGroups = new Map<string, TaskGroup>()
    tasks.forEach(task => {
      if (task.group_id && task.task_groups) {
        const group = task.task_groups as unknown as TaskGroup
        uniqueGroups.set(group.id, group)
      }
    })
    
    const groups = Array.from(uniqueGroups.values())
    return {
      hasConflict: groups.length > 1,
      groups
    }
  } catch (error) {
    console.error('Error detecting group conflicts:', error)
    return { hasConflict: false, groups: [] }
  }
}

/**
 * Generate an automatic group name based on the number of tasks
 */
function generateGroupName(taskCount: number): string {
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  return `Group of ${taskCount} tasks - ${timestamp}`
}

/**
 * Merge multiple groups into one
 */
export async function mergeGroups(
  groupIds: string[],
  targetGroupId?: string
): Promise<TaskGroup | null> {
  const supabase = await createClient()
  
  try {
    // If no target specified, use the first group
    const targetId = targetGroupId || groupIds[0]
    const groupsToMerge = groupIds.filter(id => id !== targetId)
    
    if (groupsToMerge.length === 0) {
      // Nothing to merge
      const { data } = await supabase
        .from('task_groups')
        .select()
        .eq('id', targetId)
        .single()
      return data
    }
    
    // Update all tasks from other groups to the target group
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ group_id: targetId })
      .in('group_id', groupsToMerge)
    
    if (updateError) {
      console.error('Failed to merge groups:', updateError)
      return null
    }
    
    // Delete the now-empty groups
    const { error: deleteError } = await supabase
      .from('task_groups')
      .delete()
      .in('id', groupsToMerge)
    
    if (deleteError) {
      console.error('Failed to delete merged groups:', deleteError)
      // Non-critical error
    }
    
    // Return the target group
    const { data } = await supabase
      .from('task_groups')
      .select()
      .eq('id', targetId)
      .single()
    
    return data
  } catch (error) {
    console.error('Error merging groups:', error)
    return null
  }
}

/**
 * Remove a task from its group
 */
export async function removeTaskFromGroup(taskId: string): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ group_id: null })
      .eq('id', taskId)
    
    if (error) {
      console.error('Failed to remove task from group:', error)
      return false
    }
    
    // Note: We keep similarity scores for historical reference
    
    return true
  } catch (error) {
    console.error('Error removing task from group:', error)
    return false
  }
}

/**
 * Get similarity scores for a task
 */
export async function getTaskSimilarities(taskId: string): Promise<TaskSimilarity[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('task_similarities')
      .select('*')
      .eq('task_id', taskId)
      .order('similarity_score', { ascending: false })
    
    if (error) {
      console.error('Failed to get task similarities:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error getting task similarities:', error)
    return []
  }
}