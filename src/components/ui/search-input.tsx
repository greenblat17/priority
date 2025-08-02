'use client'

import { useEffect, useState, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useHotkeys } from '@/hooks/use-hotkeys'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  debounceMs = 300
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, onChange, value, debounceMs])

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Focus search on "/" key
  useHotkeys({
    keys: '/',
    description: 'Focus search',
    action: () => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  })

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-20"
        aria-label="Search"
        aria-keyshortcuts="/"
      />
      {!localValue && (
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          /
        </kbd>
      )}
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  )
}