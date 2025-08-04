import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Comment input schema
const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  parent_comment_id: z.string().uuid().optional().nullable(),
})

// GET /api/pages/[id]/comments - Get comments for a page
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: pageId } = await params
    
    // Get comments with user info
    const { data: comments, error } = await supabase
      .from('page_comments')
      .select(`
        *,
        user:auth.users!user_id(email)
      `)
      .eq('page_id', pageId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }
    
    // Format comments with user email
    const formattedComments = comments?.map((comment: any) => ({
      id: comment.id,
      page_id: comment.page_id,
      content: comment.content,  
      parent_comment_id: comment.parent_comment_id,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user_id: comment.user_id,
      user_email: comment.user?.email || null,
    })) || []
    
    return NextResponse.json({ comments: formattedComments })
  } catch (error) {
    console.error('Error in GET /api/pages/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/pages/[id]/comments - Create a comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: pageId } = await params
    const body = await request.json()
    
    // Validate input
    const validationResult = createCommentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
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
    
    // Create the comment
    const { data: comment, error } = await supabase
      .from('page_comments')
      .insert({
        page_id: pageId,
        user_id: user.id,
        content: validationResult.data.content,
        parent_comment_id: validationResult.data.parent_comment_id,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/pages/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/pages/[id]/comments/[commentId] - Update a comment
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    await params // Consume params even though we don't use it
    const url = new URL(request.url)
    const commentId = url.pathname.split('/').pop()
    const body = await request.json()
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }
    
    // Validate input
    const contentSchema = z.object({
      content: z.string().min(1).max(5000),
    })
    
    const validationResult = contentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
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
    
    // Update the comment (RLS will ensure user owns it)
    const { data: comment, error } = await supabase
      .from('page_comments')
      .update({ content: validationResult.data.content })
      .eq('id', commentId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error || !comment) {
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: error?.code === 'PGRST116' ? 404 : 500 }
      )
    }
    
    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Error in PUT /api/pages/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/pages/[id]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    await params // Consume params even though we don't use it
    const url = new URL(request.url)
    const commentId = url.pathname.split('/').pop()
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('page_comments')
      .delete()
      .eq('id', commentId)
    
    if (error) {
      console.error('Error deleting comment:', error)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/pages/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}