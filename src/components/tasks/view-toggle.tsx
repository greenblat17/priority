'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { LayoutGrid, Table } from 'lucide-react'

export type ViewType = 'table' | 'kanban'

interface ViewToggleProps {
  view: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={view} 
      onValueChange={(value) => value && onViewChange(value as ViewType)}
      className="border border-border/50 rounded-lg bg-muted/30"
    >
      <ToggleGroupItem 
        value="table" 
        aria-label="Table view" 
        className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        <Table className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="kanban" 
        aria-label="Kanban view" 
        className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}