'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TaskViewTabsProps {
  activeView: 'all' | 'active' | 'backlog'
  onViewChange: (view: 'all' | 'active' | 'backlog') => void
  counts?: {
    all: number
    active: number
    backlog: number
  }
}

export function TaskViewTabs({ activeView, onViewChange, counts }: TaskViewTabsProps) {
  return (
    <Tabs value={activeView} onValueChange={(value) => onViewChange(value as 'all' | 'active' | 'backlog')}>
      <TabsList className="h-auto p-0 bg-transparent border-b rounded-none w-full justify-start">
        <TabsTrigger 
          value="all" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          <span className="font-medium">All issues</span>
          {counts && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {counts.all}
            </Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger 
          value="active" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          <span className="font-medium">Active</span>
          {counts && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {counts.active}
            </Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger 
          value="backlog" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
        >
          <span className="font-medium">Backlog</span>
          {counts && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {counts.backlog}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}