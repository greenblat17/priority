import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'
import { supabaseService } from '@/lib/supabase/service'
import { verifyApiKeyAuth } from '@/lib/api-auth-middleware'
import type { TaskInput } from '@/types/task'
import { taskInputSchema } from '@/types/task'
import { analyzeTask } from '@/lib/task-analysis'

// GET /api/v1/tasks - List tasks
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null
    let useServiceRole = false

    // Try API key authentication first
    const { authorized: apiKeyAuth, context: apiContext } = await verifyApiKeyAuth(request)
    
    if (apiKeyAuth && apiContext) {
      userId = apiContext.userId
      useServiceRole = true
    } else {
      // Fall back to session authentication
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      userId = user.id
    }

    // Use appropriate client based on auth method
    const dbClient = useServiceRole ? supabaseService : await createClient()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = dbClient
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    // Note: Filtering by category would require a join or subquery
    // For now, we'll filter on the client side if needed

    const { data: tasks, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/v1/tasks - Create task
export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null
    let useServiceRole = false

    // Try API key authentication first
    const { authorized: apiKeyAuth, context: apiContext } = await verifyApiKeyAuth(request)
    
    if (apiKeyAuth && apiContext) {
      userId = apiContext.userId
      useServiceRole = true // Use service role when authenticated via API key
    } else {
      // Fall back to session authentication
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      userId = user.id
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = taskInputSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const taskInput: TaskInput = validationResult.data

    // Use appropriate client based on auth method
    const dbClient = useServiceRole ? supabaseService : await createClient()

    // Create task
    const { data: task, error } = await dbClient
      .from('tasks')
      .insert({
        user_id: userId,
        description: taskInput.description,
        source: taskInput.source,
        customer_info: taskInput.customerInfo,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      )
    }

    // Trigger AI analysis (fire and forget)
    console.log('[API] Task created, triggering analysis. Auth type:', apiKeyAuth ? 'API Key' : 'Session')
    console.log('[API] User ID:', userId)
    console.log('[API] Task ID:', task.id)
    
    // Always use the direct analysis function to avoid authentication issues
    // The analyzeTask function uses service role and bypasses RLS
    analyzeTask(task.id, userId).catch(error => {
      console.error('[API] Failed to trigger analysis:', error)
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}