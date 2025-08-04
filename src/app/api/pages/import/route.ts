import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import matter from 'gray-matter'

// Import schema
const importSchema = z.object({
  content: z.string(),
  filename: z.string().optional(),
})

// POST /api/pages/import - Import a markdown file as a new page
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validate input
    const validationResult = importSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse markdown with frontmatter
    const { data: frontmatter, content } = matter(validationResult.data.content)
    
    // Extract page data from frontmatter
    const title = frontmatter.title || validationResult.data.filename?.replace(/\.md$/i, '') || 'Untitled Page'
    const description = frontmatter.description || null
    const status = frontmatter.status || 'active'
    const tags = frontmatter.tags || []
    
    // Generate slug from title if not provided
    let slug = frontmatter.slug
    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      // Ensure unique slug
      const timestamp = Date.now().toString(36)
      slug = `${slug}-${timestamp}`
    }
    
    // Create the page
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .insert({
        user_id: user.id,
        title,
        slug,
        content,
        description,
        status,
      })
      .select()
      .single()
    
    if (pageError) {
      console.error('Error creating page:', pageError)
      return NextResponse.json(
        { error: 'Failed to create page' },
        { status: 500 }
      )
    }
    
    // Add tags if any
    if (tags.length > 0 && page) {
      const tagInserts = tags.map((tag: string) => ({
        page_id: page.id,
        tag_name: tag,
        user_id: user.id,
      }))
      
      await supabase
        .from('page_tags')
        .insert(tagInserts)
    }
    
    // Extract and process task embeds
    const taskMatches = content.matchAll(/```tasks\n([\s\S]*?)```/g)
    const linkedTaskIds: string[] = []
    
    for (const match of taskMatches) {
      const taskBlock = match[1]
      const lines = taskBlock.split('\n').filter(line => line.trim())
      
      // Look for task references in the format: - [ ] Task Name
      for (const line of lines) {
        const taskMatch = line.match(/^\s*-\s*\[([ x])\]\s*(.+)$/)
        if (taskMatch) {
          const taskName = taskMatch[2].trim()
          
          // Try to find existing task by name
          const { data: existingTask } = await supabase
            .from('tasks')
            .select('id')
            .eq('user_id', user.id)
            .ilike('name', taskName)
            .single()
          
          if (existingTask) {
            linkedTaskIds.push(existingTask.id)
          }
        }
      }
    }
    
    // Link tasks if any were found
    if (linkedTaskIds.length > 0 && page) {
      const linkInserts = linkedTaskIds.map(taskId => ({
        page_id: page.id,
        task_id: taskId,
        user_id: user.id,
      }))
      
      await supabase
        .from('page_task_links')
        .insert(linkInserts)
    }
    
    return NextResponse.json({ 
      page,
      message: `Page imported successfully${linkedTaskIds.length > 0 ? ` with ${linkedTaskIds.length} linked tasks` : ''}` 
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/pages/import:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}