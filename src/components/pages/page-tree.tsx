'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PageWithRelations } from '@/types/page'

interface PageTreeProps {
  pages: PageWithRelations[]
  currentPageId?: string
  className?: string
}

interface PageTreeNodeProps {
  page: PageWithRelations
  level: number
  currentPageId?: string
}

function PageTreeNode({ page, level, currentPageId }: PageTreeNodeProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = page.children && page.children.length > 0
  const isActive = page.id === currentPageId
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
    router.push(`/pages/${page.slug}`)
  }
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }
  
  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-1 py-1 px-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer",
          isActive && "bg-accent text-accent-foreground",
          level > 0 && "ml-4"
        )}
        onClick={handleClick}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        
        {!hasChildren && <div className="w-4" />}
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
            )
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          
          <span className="truncate text-sm">{page.title}</span>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {page.children!.map(child => (
            <PageTreeNode
              key={child.id}
              page={child}
              level={level + 1}
              currentPageId={currentPageId}
            />
          ))}
        </div>
      )}
    </>
  )
}

export function PageTree({ pages, currentPageId, className }: PageTreeProps) {
  // Build tree structure from flat list
  const buildTree = (pages: PageWithRelations[]): PageWithRelations[] => {
    const pageMap = new Map<string, PageWithRelations>()
    const rootPages: PageWithRelations[] = []
    
    // First pass: create map and initialize children
    pages.forEach(page => {
      pageMap.set(page.id, { ...page, children: [] })
    })
    
    // Second pass: build tree
    pages.forEach(page => {
      const mappedPage = pageMap.get(page.id)!
      
      if (page.parent_id) {
        const parent = pageMap.get(page.parent_id)
        if (parent) {
          parent.children!.push(mappedPage)
        } else {
          // Parent not found, treat as root
          rootPages.push(mappedPage)
        }
      } else {
        rootPages.push(mappedPage)
      }
    })
    
    // Sort children alphabetically
    const sortPages = (pages: PageWithRelations[]) => {
      pages.sort((a, b) => a.title.localeCompare(b.title))
      pages.forEach(page => {
        if (page.children && page.children.length > 0) {
          sortPages(page.children)
        }
      })
    }
    
    sortPages(rootPages)
    
    return rootPages
  }
  
  const treePages = buildTree(pages)
  
  return (
    <nav className={cn("space-y-1", className)}>
      {treePages.length === 0 ? (
        <p className="text-sm text-muted-foreground px-2 py-4">
          No pages yet. Create your first page to get started.
        </p>
      ) : (
        treePages.map(page => (
          <PageTreeNode
            key={page.id}
            page={page}
            level={0}
            currentPageId={currentPageId}
          />
        ))
      )}
    </nav>
  )
}