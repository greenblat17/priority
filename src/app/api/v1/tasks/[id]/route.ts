import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'
import { supabaseService } from '@/lib/supabase/service'
import { verifyApiKeyAuth } from '@/lib/api-auth-middleware'

// GET /api/v1/tasks/[id] - Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const dbClient = useServiceRole ? supabaseService : await createClient()

    const { data: task, error } = await dbClient
      .from('tasks')
      .select('*')
      .eq('id', (await params).id)
      .eq('user_id', userId)
      .single()

    if (error || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/tasks/[id] - Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const dbClient = useServiceRole ? supabaseService : await createClient()

    const body = await request.json()
    
    // Only allow updating certain fields
    const allowedFields = ['status', 'description', 'customer_info']
    const updates: any = {}
    
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data: task, error } = await dbClient
      .from('tasks')
      .update(updates)
      .eq('id', (await params).id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error || !task) {
      return NextResponse.json(
        { error: 'Task not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const dbClient = useServiceRole ? supabaseService : await createClient()

    const { error } = await dbClient
      .from('tasks')
      .delete()
      .eq('id', (await params).id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting task:', error)
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}