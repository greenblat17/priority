import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'
import { detectDuplicates, getEmbedding } from '@/lib/duplicate-detection'
import type { DuplicateCheckRequest, DuplicateCheckResponse } from '@/types/duplicate'
import type { Task } from '@/types/task'

export async function POST(request: Request) {
  console.log('[Duplicate Check] Starting duplicate detection')
  
  try {
    // Parse request body
    const body: DuplicateCheckRequest = await request.json()
    const { description, excludeTaskId } = body
    
    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Task description is required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[Duplicate Check] Authentication error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's existing tasks (last 30 days, max 100 tasks for performance)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: existingTasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        group:task_groups!group_id (*)
      `)
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_progress']) // Only fetch active tasks
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100) // Limit to 100 most recent tasks

    if (tasksError) {
      console.error('[Duplicate Check] Failed to fetch tasks:', tasksError)
      return NextResponse.json(
        { error: 'Failed to fetch existing tasks' },
        { status: 500 }
      )
    }

    // Filter out excluded task if provided (useful for edit scenarios)
    let tasksToCheck = existingTasks as Task[]
    if (excludeTaskId) {
      tasksToCheck = tasksToCheck.filter(task => task.id !== excludeTaskId)
    }

    console.log(`[Duplicate Check] Checking against ${tasksToCheck.length} existing tasks`)

    // Detect potential duplicates
    const potentialDuplicates = await detectDuplicates(
      description,
      tasksToCheck,
      0.80 // 80% similarity threshold (lowered for better performance)
    )

    // Generate embedding for the new task (for potential storage)
    const newTaskEmbedding = await getEmbedding(description)

    console.log(`[Duplicate Check] Found ${potentialDuplicates.length} potential duplicates`)

    // Limit to top 5 most similar tasks
    const topDuplicates = potentialDuplicates.slice(0, 5)

    const response: DuplicateCheckResponse = {
      potentialDuplicates: topDuplicates,
      embedding: newTaskEmbedding
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Duplicate Check] Error during duplicate detection:', error)
    
    // Check if it's an OpenAI API error
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service not configured' },
          { status: 503 }
        )
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    }
    
    // Return empty duplicates on error to not block task creation
    return NextResponse.json({
      potentialDuplicates: [],
      embedding: []
    })
  }
}