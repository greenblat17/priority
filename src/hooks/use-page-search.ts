import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { PageWithRelations } from '@/types/page'
import type { SearchFilters } from '@/components/pages/page-search'

interface SearchResult {
  pages: (PageWithRelations & {
    reading_time: number
    excerpt: string
  })[]
  total: number
  tags: string[]
  query: string
  filters: SearchFilters
}

interface UsePageSearchOptions {
  query?: string
  filters?: SearchFilters
  limit?: number
  offset?: number
}

export function usePageSearch({
  query = '',
  filters = { tags: [], sortBy: 'relevance' },
  limit = 20,
  offset = 0
}: UsePageSearchOptions = {}) {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useQuery<SearchResult>({
    queryKey: ['pages', 'search', query, filters, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        sort_by: filters.sortBy,
        limit: limit.toString(),
        offset: offset.toString(),
      })
      
      // Add tags
      filters.tags.forEach(tag => {
        params.append('tags[]', tag)
      })
      
      // Add date filters
      if (filters.dateFrom) {
        params.append('date_from', filters.dateFrom)
      }
      if (filters.dateTo) {
        params.append('date_to', filters.dateTo)
      }
      
      const response = await fetch(`/api/pages/search?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to search pages')
      }
      
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}

// Hook to get all available tags
export function usePageTags() {
  const supabase = createClient()
  
  return useQuery<string[]>({
    queryKey: ['pages', 'tags'],
    queryFn: async (): Promise<string[]> => {
      const { data: tags, error } = await supabase
        .from('page_tags')
        .select('tag_name')
        .order('tag_name')
      
      if (error) {
        throw error
      }
      
      // Get unique tags
      const uniqueTags = Array.from(new Set(tags?.map((t: { tag_name: string }) => t.tag_name) || [])) as string[]
      return uniqueTags
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  })
}