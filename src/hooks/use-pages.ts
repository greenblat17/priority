'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Page, PageWithRelations, CreatePageInput, UpdatePageInput } from '@/types/page'

// Query keys factory
export const pageKeys = {
  all: ['pages'] as const,
  lists: () => [...pageKeys.all, 'list'] as const,
  list: (filters?: any) => [...pageKeys.lists(), filters] as const,
  details: () => [...pageKeys.all, 'detail'] as const,
  detail: (id: string) => [...pageKeys.details(), id] as const,
  tree: () => [...pageKeys.all, 'tree'] as const,
}

// Fetch pages with optional filters
export function usePages(filters?: {
  parentId?: string | null
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: pageKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters?.parentId !== undefined) {
        params.append('parent_id', filters.parentId || 'null')
      }
      if (filters?.search) {
        params.append('search', filters.search)
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString())
      }
      if (filters?.offset) {
        params.append('offset', filters.offset.toString())
      }
      
      const response = await fetch(`/api/pages?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch pages')
      }
      
      const { pages } = await response.json()
      return pages as PageWithRelations[]
    },
  })
}

// Fetch a single page by ID
export function usePage(id: string | undefined) {
  return useQuery({
    queryKey: id ? pageKeys.detail(id) : [],
    queryFn: async () => {
      if (!id) return null
      
      const response = await fetch(`/api/pages/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch page')
      }
      
      const { page } = await response.json()
      return page as PageWithRelations
    },
    enabled: !!id,
  })
}

// Create a new page
export function useCreatePage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: CreatePageInput) => {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create page')
      }
      
      const { page } = await response.json()
      return page as Page
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() })
      toast.success('Page created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create page')
    },
  })
}

// Update a page
export function useUpdatePage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdatePageInput & { id: string }) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update page')
      }
      
      const { page } = await response.json()
      return page as Page
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(page.id) })
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() })
      toast.success('Page updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update page')
    },
  })
}

// Delete a page
export function useDeletePage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete page')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() })
      toast.success('Page deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete page')
    },
  })
}

// Build page tree from flat list
export function buildPageTree(pages: PageWithRelations[]): PageWithRelations[] {
  const pageMap = new Map<string, PageWithRelations>()
  const rootPages: PageWithRelations[] = []
  
  // First pass: create map
  pages.forEach(page => {
    pageMap.set(page.id, { ...page, children: [] })
  })
  
  // Second pass: build tree
  pages.forEach(page => {
    const mappedPage = pageMap.get(page.id)!
    
    if (page.parent_id) {
      const parent = pageMap.get(page.parent_id)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(mappedPage)
      }
    } else {
      rootPages.push(mappedPage)
    }
  })
  
  return rootPages
}