'use client'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { 
  Settings2, 
  List, 
  LayoutGrid,
  ChevronDown
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface DisplaySettings {
  view: 'list' | 'board'
  grouping: 'status' | 'category' | 'priority' | 'date' | 'none'
  ordering: 'priority' | 'date' | 'status' | 'manual'
  orderDirection: 'asc' | 'desc'
  showCompletedByRecency: boolean
  completedIssues: 'all' | 'hide' | 'recent'
  showEmptyGroups: boolean
}

interface LinearDisplaySettingsProps {
  settings: DisplaySettings
  onSettingsChange: (settings: DisplaySettings) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function LinearDisplaySettings({ 
  settings, 
  onSettingsChange,
  isOpen,
  onOpenChange 
}: LinearDisplaySettingsProps) {
  const updateSetting = <K extends keyof DisplaySettings>(
    key: K, 
    value: DisplaySettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 font-normal"
        >
          <Settings2 className="h-4 w-4 mr-1" />
          Display
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[380px] p-4" 
        align="start"
        sideOffset={8}
      >
        <div className="space-y-4">
          {/* View Type */}
          <div className="flex gap-2">
            <Button
              variant={settings.view === 'list' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => updateSetting('view', 'list')}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={settings.view === 'board' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => updateSetting('view', 'board')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </Button>
          </div>

          <Separator />

          {/* Grouping */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <List className="h-3 w-3" />
              Grouping
            </Label>
            <Select 
              value={settings.grouping} 
              onValueChange={(value) => updateSetting('grouping', value as DisplaySettings['grouping'])}
            >
              <SelectTrigger className="w-full h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="none">No grouping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordering */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <ChevronDown className="h-3 w-3" />
              Ordering
            </Label>
            <div className="flex gap-2">
              <Select 
                value={settings.ordering} 
                onValueChange={(value) => updateSetting('ordering', value as DisplaySettings['ordering'])}
              >
                <SelectTrigger className="flex-1 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="date">Created date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => updateSetting('orderDirection', settings.orderDirection === 'asc' ? 'desc' : 'asc')}
              >
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  settings.orderDirection === 'asc' && "rotate-180"
                )} />
              </Button>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="completed-recency" className="text-sm">
                Order completed by recency
              </Label>
              <Switch
                id="completed-recency"
                checked={settings.showCompletedByRecency}
                onCheckedChange={(checked) => updateSetting('showCompletedByRecency', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Completed issues</Label>
              <Select 
                value={settings.completedIssues} 
                onValueChange={(value) => updateSetting('completedIssues', value as DisplaySettings['completedIssues'])}
              >
                <SelectTrigger className="w-full h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="recent">Last 7 days</SelectItem>
                  <SelectItem value="hide">Hide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* List Options */}
          <div>
            <h4 className="text-sm font-medium mb-3">List options</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="empty-groups" className="text-sm">
                Show empty groups
              </Label>
              <Switch
                id="empty-groups"
                checked={settings.showEmptyGroups}
                onCheckedChange={(checked) => updateSetting('showEmptyGroups', checked)}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}