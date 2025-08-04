'use client'

import { useState, useCallback } from 'react'
import { Search, X, Calendar, Tag, SortAsc } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

interface PageSearchProps {
  onSearch: (query: string) => void
  onFiltersChange: (filters: SearchFilters) => void
  availableTags?: string[]
  className?: string
}

export interface SearchFilters {
  tags: string[]
  dateFrom?: string
  dateTo?: string
  sortBy: 'relevance' | 'date' | 'title'
}

export function PageSearch({ 
  onSearch, 
  onFiltersChange, 
  availableTags = [],
  className 
}: PageSearchProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    tags: [],
    sortBy: 'relevance'
  })
  const [showFilters, setShowFilters] = useState(false)
  
  const debouncedQuery = useDebounce(query, 300)
  
  // Trigger search when debounced query changes
  React.useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])
  
  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }, [filters, onFiltersChange])
  
  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    handleFilterChange({ tags: newTags })
  }
  
  const clearFilters = () => {
    setFilters({ tags: [], sortBy: 'relevance' })
    onFiltersChange({ tags: [], sortBy: 'relevance' })
  }
  
  const hasActiveFilters = filters.tags.length > 0 || filters.dateFrom || filters.dateTo
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(hasActiveFilters && "border-primary")}
        >
          <SortAsc className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort by</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange({ sortBy: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date (Newest)</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-from">From</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange({ dateFrom: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">To</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange({ dateTo: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
      
      {/* Active Filters Display */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          <div className="flex gap-1 flex-wrap">
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-1"
                  onClick={() => toggleTag(tag)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
            {(filters.dateFrom || filters.dateTo) && (
              <Badge variant="secondary" className="text-xs">
                Date range
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Re-export React for useEffect
import * as React from 'react'