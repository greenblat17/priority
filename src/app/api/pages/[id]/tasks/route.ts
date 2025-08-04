import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/pages/[id]/tasks - Get tasks linked to a page
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: pageId } = await params
    
    // Get linked tasks
    const { data: taskLinks, error } = await supabase
      .from('page_task_links')
      .select(`
        id,
        task:tasks(*)
      `)
      .eq('page_id', pageId)
    
    if (error) {
      console.error('Error fetching page tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch page tasks' },
        { status: 500 }
      )
    }
    
    const tasks = taskLinks?.map(link => link.task).filter(Boolean) || []
    
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error in GET /api/pages/[id]/tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/pages/[id]/tasks - Link a task to a page
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: pageId } = await params
    const body = await request.json()
    const { taskId } = body
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if page exists and belongs to user
    const { data: page } = await supabase
      .from('pages')
      .select('id')
      .eq('id', pageId)
      .eq('user_id', user.id)
      .single()
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    
    // Check if task exists and belongs to user
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Create the link
    const { data: link, error } = await supabase
      .from('page_task_links')
      .insert({
        page_id: pageId,
        task_id: taskId,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) {
      // Check if it's a unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Task is already linked to this page' },
          { status: 409 }
        )
      }
      
      console.error('Error linking task to page:', error)
      return NextResponse.json(
        { error: 'Failed to link task to page' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ link }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/pages/[id]/tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/pages/[id]/tasks/[taskId] - Unlink a task from a page
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: pageId } = await params
    const url = new URL(request.url)
    const taskId = url.pathname.split('/').pop()
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('page_task_links')
      .delete()
      .eq('page_id', pageId)
      .eq('task_id', taskId)
    
    if (error) {
      console.error('Error unlinking task from page:', error)
      return NextResponse.json(
        { error: 'Failed to unlink task from page' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/pages/[id]/tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}