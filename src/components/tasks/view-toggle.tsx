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
      className="border rounded-md"
    >
      <ToggleGroupItem value="table" aria-label="Table view" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
        <Table className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="kanban" aria-label="Kanban view" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}