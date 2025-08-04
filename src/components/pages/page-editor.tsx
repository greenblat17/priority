'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote,
  Code,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Toggle } from '@/components/ui/toggle'
import { MarkdownRenderer } from '@/components/pages/markdown-renderer'

interface PageEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function PageEditor({ 
  content, 
  onChange, 
  placeholder = 'Start writing...',
  className,
  autoFocus
}: PageEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const adjustHeight = () => {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    adjustHeight()
    textarea.addEventListener('input', adjustHeight)

    return () => {
      textarea.removeEventListener('input', adjustHeight)
    }
  }, [content])

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    onChange(newText)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }, [content, onChange])

  const toolbarActions = [
    { icon: Heading1, label: 'Heading 1', action: () => insertMarkdown('# ') },
    { icon: Heading2, label: 'Heading 2', action: () => insertMarkdown('## ') },
    { icon: Heading3, label: 'Heading 3', action: () => insertMarkdown('### ') },
    { divider: true },
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`') },
    { divider: true },
    { icon: List, label: 'Bullet List', action: () => insertMarkdown('- ') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertMarkdown('1. ') },
    { icon: Quote, label: 'Quote', action: () => insertMarkdown('> ') },
    { divider: true },
    { icon: Link, label: 'Link', action: () => insertMarkdown('[', '](url)') },
  ]


  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border rounded-lg p-1 bg-muted/30">
        <div className="flex items-center gap-1">
          {toolbarActions.map((action, index) => {
            if (action.divider) {
              return <div key={index} className="w-px h-6 bg-border mx-1" />
            }
            
            const Icon = action.icon
            if (!Icon) return null
            return (
              <Toggle
                key={index}
                size="sm"
                onPressedChange={() => action.action?.()}
                aria-label={action.label}
              >
                <Icon className="h-4 w-4" />
              </Toggle>
            )
          })}
        </div>
        
        <Toggle
          size="sm"
          pressed={showPreview}
          onPressedChange={setShowPreview}
          aria-label="Toggle preview"
        >
          {showPreview ? (
            <Edit3 className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Toggle>
      </div>

      {/* Editor/Preview */}
      {showPreview ? (
        <div className="min-h-[400px] p-4 border rounded-lg bg-background">
          <MarkdownRenderer content={content || placeholder} />
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[400px] resize-none font-mono text-sm"
          autoFocus={autoFocus}
        />
      )}
    </div>
  )
}