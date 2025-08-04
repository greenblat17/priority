import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updatePageSchema } from '@/types/page'

// GET /api/pages/[id] - Get a single page
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    
    const { data: page, error } = await supabase
      .from('pages')
      .select(`
        *,
        parent:parent_id(id, title, slug),
        children:pages!parent_id(id, title, slug),
        tags:page_tags(id, tag_name),
        task_links:page_task_links(
          id,
          task:tasks(id, description, status)
        )
      `)
      .eq('id', id)
      .single()
    
    if (error || !page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ page })
  } catch (error) {
    console.error('Error in GET /api/pages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/pages/[id] - Update a page
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()
    
    // Validate input
    const validationResult = updatePageSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
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
    
    // Get current page to check ownership and version
    const { data: currentPage } = await supabase
      .from('pages')
      .select('*, page_versions(version_number)')
      .eq('id', id)
      .single()
    
    if (!currentPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    
    // Extract tags from input
    const { tags, ...pageData } = validationResult.data
    
    // Update the page
    const { data: page, error } = await supabase
      .from('pages')
      .update(pageData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating page:', error)
      return NextResponse.json(
        { error: 'Failed to update page' },
        { status: 500 }
      )
    }
    
    // Update tags if provided
    if (tags !== undefined) {
      // Delete existing tags
      await supabase
        .from('page_tags')
        .delete()
        .eq('page_id', id)
      
      // Insert new tags
      if (tags.length > 0) {
        const tagInserts = tags.map(tag => ({
          page_id: id,
          user_id: user.id,
          tag_name: tag.toLowerCase().trim()
        }))
        
        await supabase
          .from('page_tags')
          .insert(tagInserts)
      }
    }
    
    // Create new version if content or title changed
    if (
      validationResult.data.content !== undefined || 
      validationResult.data.title !== undefined
    ) {
      const latestVersion = Math.max(
        ...currentPage.page_versions.map(v => v.version_number),
        0
      )
      
      await supabase
        .from('page_versions')
        .insert({
          page_id: page.id,
          user_id: user.id,
          title: page.title,
          content: page.content,
          version_number: latestVersion + 1,
        })
    }
    
    return NextResponse.json({ page })
  } catch (error) {
    console.error('Error in PUT /api/pages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/pages/[id] - Delete a page
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    
    // Check if page has children
    const { data: children } = await supabase
      .from('pages')
      .select('id')
      .eq('parent_id', id)
      .limit(1)
    
    if (children && children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete page with children' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting page:', error)
      return NextResponse.json(
        { error: 'Failed to delete page' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/pages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}