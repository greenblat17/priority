'use client'

import { useState, useCallback } from 'react'
import { Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageList } from '@/components/pages/page-list'
import { PageSearch, type SearchFilters } from '@/components/pages/page-search'
import { PageImport } from '@/components/pages/page-import'
import { usePageSearch, usePageTags } from '@/hooks/use-page-search'
import { useRouter } from 'next/navigation'

export default function PagesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    tags: [],
    sortBy: 'relevance'
  })
  
  const { data: searchResults, isLoading } = usePageSearch({
    query: searchQuery,
    filters: searchFilters,
  })
  
  const { data: availableTags } = usePageTags()
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])
  
  const handleFiltersChange = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters)
  }, [])

  const handleCreatePage = () => {
    router.push('/pages/new')
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pages</h1>
        <p className="text-muted-foreground">
          Create and manage your knowledge base
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <PageSearch 
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            availableTags={availableTags || []}
          />
        </div>
        <div className="flex gap-2">
          <PageImport />
          <Button onClick={handleCreatePage} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Pages
          </CardTitle>
          <CardDescription>
            {searchResults?.total || 0} page{searchResults?.total !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PageList 
            pages={searchResults?.pages || []} 
            isLoading={isLoading}
            onEdit={(page) => router.push(`/pages/${page.slug}/edit`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}