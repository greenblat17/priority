import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'
import { detectDuplicates } from '@/lib/duplicate-detection'
import type { Task } from '@/types/task'

export async function POST(request: Request) {
  console.log('[Async Duplicate Check] Starting background duplicate detection')
  
  try {
    const body = await request.json()
    const { taskId, description, userId } = body
    
    if (!taskId || !description || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = await createClient()

    // Fetch user's existing tasks (last 30 days, max 100 tasks)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: existingTasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        group:task_groups!group_id (*)
      `)
      .eq('user_id', userId)
      .neq('id', taskId) // Exclude the newly created task
      .in('status', ['pending', 'in_progress'])
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    if (tasksError) {
      console.error('[Async Duplicate Check] Failed to fetch tasks:', tasksError)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    // Detect potential duplicates
    const potentialDuplicates = await detectDuplicates(
      description,
      existingTasks as Task[],
      0.80 // 80% similarity threshold
    )

    if (potentialDuplicates.length > 0) {
      console.log(`[Async Duplicate Check] Found ${potentialDuplicates.length} duplicates for task ${taskId}`)
      
      // Store duplicate info in a new table for later retrieval
      const { error: storeError } = await supabase
        .from('duplicate_detections')
        .insert({
          task_id: taskId,
          user_id: userId,
          duplicates: potentialDuplicates.map(d => ({
            taskId: d.taskId,
            similarity: d.similarity,
            description: d.task.description
          })),
          detected_at: new Date().toISOString(),
          status: 'pending' // pending, dismissed, grouped
        })

      if (storeError) {
        console.error('[Async Duplicate Check] Failed to store duplicates:', storeError)
      }

      return NextResponse.json({
        taskId,
        duplicatesFound: true,
        count: potentialDuplicates.length,
        topDuplicates: potentialDuplicates.slice(0, 5)
      })
    }

    return NextResponse.json({
      taskId,
      duplicatesFound: false,
      count: 0
    })

  } catch (error) {
    console.error('[Async Duplicate Check] Error:', error)
    // Don't fail the overall process
    return NextResponse.json({
      duplicatesFound: false,
      error: 'Failed to check duplicates'
    })
  }
}