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
    const { authorized: apiKeyAuth, context: apiContext } =
      await verifyApiKeyAuth(request)

    if (apiKeyAuth && apiContext) {
      userId = apiContext.userId
      useServiceRole = true
    } else {
      // Fall back to session authentication
      const supabase = await createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = user.id
    }

    // Use appropriate client based on auth method
    const dbClient = useServiceRole ? supabaseService : await createClient()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const q = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const cursor = searchParams.get('cursor') // format: `${created_at_iso}::${id}`

    // Build query
    let query = dbClient
      .from('tasks')
      .select(
        `
        id, user_id, description, source, customer_info, status, created_at, updated_at, group_id,
        task_analyses:task_analyses!task_id (
          category, priority, complexity, estimated_hours, confidence_score,
          ice_impact, ice_confidence, ice_ease, ice_score
        ),
        group:task_groups!group_id (
          id,
          name
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Cursor pagination: created_at DESC, id as tiebreaker
    if (cursor) {
      const [createdAtIso, id] = cursor.split('::')
      // fetch rows where (created_at < cursorCreatedAt) OR (created_at == cursorCreatedAt AND id < cursorId)
      query = query.or(
        `created_at.lt.${createdAtIso},and(created_at.eq.${createdAtIso},id.lt.${id})`
      )
    }

    // Full-text search (optional): match against stored tsvector
    if (q && q.trim().length > 1) {
      // Use plainto_tsquery over 'simple' config; relies on search_tsv generated column
      query = query.textSearch('search_tsv', q, { type: 'plain' as any })
    }

    // Limit after cursor filters
    query = query.limit(limit)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    let nextCursor: string | null = null
    if (data && data.length === limit) {
      const last = data[data.length - 1]
      nextCursor = `${last.created_at}::${last.id}`
    }

    const tasks = (data || []).map((task: any) => ({
      ...task,
      analysis: task.task_analyses || null,
      group: task.group || null,
    }))

    return NextResponse.json({ tasks, nextCursor })
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
    const { authorized: apiKeyAuth, context: apiContext } =
      await verifyApiKeyAuth(request)

    if (apiKeyAuth && apiContext) {
      userId = apiContext.userId
      useServiceRole = true // Use service role when authenticated via API key
    } else {
      // Fall back to session authentication
      const supabase = await createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    console.log(
      '[API] Task created, triggering analysis. Auth type:',
      apiKeyAuth ? 'API Key' : 'Session'
    )
    console.log('[API] User ID:', userId)
    console.log('[API] Task ID:', task.id)

    // Always use the direct analysis function to avoid authentication issues
    // The analyzeTask function uses service role and bypasses RLS
    analyzeTask(task.id, userId).catch((error) => {
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
