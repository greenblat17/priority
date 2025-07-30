'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowUpDown, Filter } from 'lucide-react'

interface TaskFiltersProps {
  statusFilter: string
  setStatusFilter: (value: string) => void
  categoryFilter: string
  setCategoryFilter: (value: string) => void
  sortBy: 'priority' | 'date' | 'status'
  setSortBy: (value: 'priority' | 'date' | 'status') => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (value: 'asc' | 'desc') => void
}

export function TaskFilters({
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Filters:</span>
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="bug">Bug</SelectItem>
          <SelectItem value="feature">Feature</SelectItem>
          <SelectItem value="improvement">Improvement</SelectItem>
          <SelectItem value="business">Business</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-4 ">
        <span className="text-sm font-semibold">Sort by:</span>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <ArrowUpDown className={`h-4 w-4 transition-transform ${
            sortOrder === 'asc' ? 'rotate-180' : ''
          }`} />
        </Button>
      </div>

      {(statusFilter !== 'all' || categoryFilter !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStatusFilter('all')
            setCategoryFilter('all')
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}