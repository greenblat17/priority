'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Page } from '@/types/page'

interface PageBreadcrumbsProps {
  page: Page & { parent?: Page }
  className?: string
}

interface BreadcrumbItem {
  id: string
  title: string
  slug: string
}

export function PageBreadcrumbs({ page, className }: PageBreadcrumbsProps) {
  // Build breadcrumb path
  const buildPath = (currentPage: Page & { parent?: Page }): BreadcrumbItem[] => {
    const path: BreadcrumbItem[] = []
    let current: (Page & { parent?: Page }) | undefined = currentPage
    
    while (current) {
      path.unshift({
        id: current.id,
        title: current.title,
        slug: current.slug,
      })
      current = current.parent
    }
    
    return path
  }
  
  const breadcrumbs = buildPath(page)
  
  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      <Link
        href="/pages"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          
          {index === breadcrumbs.length - 1 ? (
            <span className="ml-1 font-medium">{item.title}</span>
          ) : (
            <Link
              href={`/pages/${item.slug}`}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.title}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}