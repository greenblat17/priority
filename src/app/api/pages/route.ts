import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createPageSchema } from '@/types/page'
import { generateSlug } from '@/lib/pages/slug-generator'

// GET /api/pages - List all pages for the user
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const parentId = searchParams.get('parent_id')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build query
    let query = supabase
      .from('pages')
      .select(`
        *,
        parent:parent_id(id, title, slug),
        tags:page_tags(id, tag_name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Filter by parent_id if provided
    if (parentId) {
      query = query.eq('parent_id', parentId)
    } else if (parentId === 'null') {
      // Get root pages
      query = query.is('parent_id', null)
    }
    
    // Search if provided
    if (search) {
      query = query.textSearch('search_vector', search)
    }
    
    const { data: pages, error } = await query
    
    if (error) {
      console.error('Error fetching pages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pages' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error in GET /api/pages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/pages - Create a new page
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validate input
    const validationResult = createPageSchema.safeParse(body)
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
    
    const input = validationResult.data
    
    // Generate unique slug
    const baseSlug = generateSlug(input.title)
    let slug = baseSlug
    let counter = 1
    
    // Check for existing slugs and make unique
    while (true) {
      const { data: existing } = await supabase
        .from('pages')
        .select('id')
        .eq('user_id', user.id)
        .eq('slug', slug)
        .single()
      
      if (!existing) break
      
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    // Extract tags from input
    const { tags, ...pageData } = input
    
    // Create the page
    const { data: page, error } = await supabase
      .from('pages')
      .insert({
        ...pageData,
        user_id: user.id,
        slug,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating page:', error)
      return NextResponse.json(
        { error: 'Failed to create page' },
        { status: 500 }
      )
    }
    
    // Create initial version
    await supabase
      .from('page_versions')
      .insert({
        page_id: page.id,
        user_id: user.id,
        title: page.title,
        content: page.content,
        version_number: 1,
      })
    
    // Create tags if provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map(tag => ({
        page_id: page.id,
        user_id: user.id,
        tag_name: tag.toLowerCase().trim()
      }))
      
      await supabase
        .from('page_tags')
        .insert(tagInserts)
    }
    
    // Fetch the page with tags
    const { data: pageWithTags } = await supabase
      .from('pages')
      .select(`
        *,
        tags:page_tags(id, tag_name)
      `)
      .eq('id', page.id)
      .single()
    
    return NextResponse.json({ page: pageWithTags || page }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/pages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}