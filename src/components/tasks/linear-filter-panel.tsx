'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Filter, 
  ChevronRight, 
  Search,
  X,
  Hash,
  Circle,
  User,
  Users,
  BarChart3,
  Tag,
  Link2,
  Calendar,
  FileText,
  Package
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { TaskStatus } from '@/types/task'

interface FilterOption {
  id: string
  label: string
  icon: React.ReactNode
  hasSubmenu?: boolean
}

const filterOptions: FilterOption[] = [
  { id: 'ai', label: 'AI Filter', icon: <Search className="h-4 w-4" /> },
  { id: 'status', label: 'Status', icon: <Circle className="h-4 w-4" />, hasSubmenu: true },
  { id: 'category', label: 'Category', icon: <Tag className="h-4 w-4" />, hasSubmenu: true },
  { id: 'priority', label: 'Priority', icon: <BarChart3 className="h-4 w-4" />, hasSubmenu: true },
  { id: 'labels', label: 'Labels', icon: <Hash className="h-4 w-4" />, hasSubmenu: true },
  { id: 'dates', label: 'Dates', icon: <Calendar className="h-4 w-4" />, hasSubmenu: true },
  { id: 'content', label: 'Content', icon: <FileText className="h-4 w-4" />, hasSubmenu: true },
]

interface LinearFilterPanelProps {
  filters: any
  onFiltersChange: (filters: any) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function LinearFilterPanel({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onOpenChange 
}: LinearFilterPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  const activeFiltersCount = Object.values(filters).filter(f => f !== 'all').length

  const handleStatusFilter = (status: string) => {
    onFiltersChange({ ...filters, status })
    setActiveSubmenu(null)
  }

  const handleCategoryFilter = (category: string) => {
    onFiltersChange({ ...filters, category })
    setActiveSubmenu(null)
  }

  const handleClearFilters = () => {
    onFiltersChange({
      status: 'all',
      category: 'all',
      priority: 'all',
      confidence: 'all',
      sortBy: 'priority',
      sortOrder: 'desc'
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-8 px-2 font-normal",
            activeFiltersCount > 0 && "text-primary"
          )}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filter
          {activeFiltersCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-1.5 h-4 px-1 text-xs rounded-sm"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-0" 
        align="start"
        sideOffset={8}
      >
        <div className="flex flex-col">
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-8 w-8 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          <div className="py-1">
            {filterOptions.map((option) => (
              <div key={option.id}>
                <button
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-accent",
                    activeSubmenu === option.id && "bg-accent"
                  )}
                  onClick={() => {
                    if (option.hasSubmenu) {
                      setActiveSubmenu(activeSubmenu === option.id ? null : option.id)
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                  {option.hasSubmenu && (
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      activeSubmenu === option.id && "rotate-90"
                    )} />
                  )}
                </button>

                {/* Status Submenu */}
                {option.id === 'status' && activeSubmenu === 'status' && (
                  <div className="py-1 pl-4 border-l ml-4">
                    <button
                      className={cn(
                        "flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent rounded",
                        filters.status === 'all' && "bg-accent"
                      )}
                      onClick={() => handleStatusFilter('all')}
                    >
                      All statuses
                    </button>
                    {Object.entries(TaskStatus).map(([key, value]) => (
                      <button
                        key={value}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent rounded",
                          filters.status === value && "bg-accent"
                        )}
                        onClick={() => handleStatusFilter(value)}
                      >
                        {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                )}

                {/* Category Submenu */}
                {option.id === 'category' && activeSubmenu === 'category' && (
                  <div className="py-1 pl-4 border-l ml-4">
                    <button
                      className={cn(
                        "flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent rounded",
                        filters.category === 'all' && "bg-accent"
                      )}
                      onClick={() => handleCategoryFilter('all')}
                    >
                      All categories
                    </button>
                    {['bug', 'feature', 'improvement', 'business', 'other'].map(category => (
                      <button
                        key={category}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent rounded capitalize",
                          filters.category === category && "bg-accent"
                        )}
                        onClick={() => handleCategoryFilter(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-sm"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}