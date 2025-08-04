'use client'

import { useState, useCallback } from 'react'
import { X, Plus, Tag as TagIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface PageTagsProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  availableTags?: string[]
  className?: string
  readOnly?: boolean
}

export function PageTags({ 
  tags, 
  onTagsChange, 
  availableTags = [],
  className,
  readOnly = false
}: PageTagsProps) {
  const [newTag, setNewTag] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)
  
  const handleAddTag = useCallback(() => {
    const tag = newTag.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag])
      setNewTag('')
      setIsAddingTag(false)
    }
  }, [newTag, tags, onTagsChange])
  
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove))
  }, [tags, onTagsChange])
  
  const handleSelectTag = useCallback((tag: string) => {
    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag])
    }
  }, [tags, onTagsChange])
  
  const suggestedTags = availableTags.filter(tag => 
    !tags.includes(tag) && 
    (!newTag || tag.includes(newTag.toLowerCase()))
  ).slice(0, 5)
  
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {tags.map(tag => (
        <Badge key={tag} variant="secondary" className="gap-1">
          <TagIcon className="h-3 w-3" />
          {tag}
          {!readOnly && (
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 rounded-full outline-none ring-offset-background transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          )}
        </Badge>
      ))}
      
      {!readOnly && (
        <Popover open={isAddingTag} onOpenChange={setIsAddingTag}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 gap-1"
            >
              <Plus className="h-3 w-3" />
              Add tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="h-8"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </div>
              
              {suggestedTags.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Suggestions:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestedTags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          handleSelectTag(tag)
                          setIsAddingTag(false)
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}