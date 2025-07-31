'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bookmark, BookmarkPlus, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

interface FilterPreset {
  id: string
  name: string
  filters: {
    status: string
    category: string
    confidence: string
    sortBy: 'priority' | 'date' | 'status'
    sortOrder: 'asc' | 'desc'
  }
}

interface FilterPresetsProps {
  currentFilters: FilterPreset['filters']
  onApplyPreset: (filters: FilterPreset['filters']) => void
}

const PRESETS_STORAGE_KEY = 'taskpriority-filter-presets'

export function FilterPresets({ currentFilters, onApplyPreset }: FilterPresetsProps) {
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')

  const savePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name')
      return
    }

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: currentFilters
    }

    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)
    
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets))
      toast.success(`Preset "${presetName}" saved`)
      setShowSaveDialog(false)
      setPresetName('')
    } catch {
      toast.error('Failed to save preset')
    }
  }

  const deletePreset = (id: string) => {
    const updatedPresets = presets.filter(p => p.id !== id)
    setPresets(updatedPresets)
    
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets))
      toast.success('Preset deleted')
    } catch {
      toast.error('Failed to delete preset')
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Bookmark className="h-4 w-4" />
            Presets
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Filter Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
            <BookmarkPlus className="h-4 w-4 mr-2" />
            Save Current Filters
          </DropdownMenuItem>
          
          {presets.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {presets.map(preset => (
                <DropdownMenuItem
                  key={preset.id}
                  onClick={() => onApplyPreset(preset.filters)}
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{preset.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePreset(preset.id)
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a preset for quick access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., High Priority Bugs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    savePreset()
                  }
                }}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Current filters:</p>
              <ul className="mt-1 space-y-1">
                <li>• Status: {currentFilters.status}</li>
                <li>• Category: {currentFilters.category}</li>
                <li>• Sort: {currentFilters.sortBy} ({currentFilters.sortOrder})</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={savePreset}>
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}