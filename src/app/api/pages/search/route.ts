import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || ''
    const tags = searchParams.getAll('tags[]')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const sortBy = searchParams.get('sort_by') || 'relevance' // relevance, date, title
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Build base query
    let pagesQuery = supabase
      .from('pages')
      .select(`
        *,
        parent:parent_id(id, title, slug),
        tags:page_tags(id, tag_name),
        _relevance:search_vector
      `)
      .eq('user_id', user.id)
    
    // Apply full-text search if query provided
    if (query.trim()) {
      pagesQuery = pagesQuery.textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english'
      })
    }
    
    // Filter by tags if provided
    if (tags.length > 0) {
      // Get page IDs that have all the specified tags
      const { data: taggedPages } = await supabase
        .from('page_tags')
        .select('page_id')
        .in('tag_name', tags)
      
      if (taggedPages && taggedPages.length > 0) {
        const pageIds = taggedPages.map(tp => tp.page_id)
        pagesQuery = pagesQuery.in('id', pageIds)
      }
    }
    
    // Filter by date range
    if (dateFrom) {
      pagesQuery = pagesQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      pagesQuery = pagesQuery.lte('created_at', dateTo)
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'date':
        pagesQuery = pagesQuery.order('created_at', { ascending: false })
        break
      case 'title':
        pagesQuery = pagesQuery.order('title', { ascending: true })
        break
      case 'relevance':
      default:
        if (query.trim()) {
          // Sort by relevance is default when searching
          pagesQuery = pagesQuery.order('search_vector', { ascending: false })
        } else {
          // Fall back to date when not searching
          pagesQuery = pagesQuery.order('created_at', { ascending: false })
        }
    }
    
    // Apply pagination
    pagesQuery = pagesQuery.range(offset, offset + limit - 1)
    
    const { data: pages, error, count } = await pagesQuery
    
    if (error) {
      console.error('Error searching pages:', error)
      return NextResponse.json(
        { error: 'Failed to search pages' },
        { status: 500 }
      )
    }
    
    // Get all unique tags for filter suggestions
    const { data: allTags } = await supabase
      .from('page_tags')
      .select('tag_name')
      .eq('user_id', user.id)
    
    const uniqueTags = Array.from(new Set(allTags?.map(t => t.tag_name) || []))
    
    // Calculate reading time for each page
    const pagesWithMetadata = pages?.map(page => ({
      ...page,
      reading_time: Math.ceil((page.content?.split(' ').length || 0) / 200), // 200 words per minute
      excerpt: page.content?.substring(0, 200) + '...' || ''
    }))
    
    return NextResponse.json({
      pages: pagesWithMetadata || [],
      total: count || 0,
      tags: uniqueTags,
      query,
      filters: {
        tags,
        dateFrom,
        dateTo,
        sortBy
      }
    })
  } catch (error) {
    console.error('Error in GET /api/pages/search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}