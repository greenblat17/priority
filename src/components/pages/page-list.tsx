'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { 
  FileText, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy,
  ExternalLink,
  Calendar,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageWithRelations } from '@/types/page'
import { useDeletePage } from '@/hooks/use-pages'
import { cn } from '@/lib/utils'

interface PageListProps {
  pages: PageWithRelations[]
  isLoading?: boolean
  onEdit?: (page: PageWithRelations) => void
}

export function PageList({ pages, isLoading, onEdit }: PageListProps) {
  const deletePage = useDeletePage()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (page: PageWithRelations) => {
    if (!confirm(`Are you sure you want to delete "${page.title}"?`)) {
      return
    }

    setDeletingId(page.id)
    try {
      await deletePage.mutateAsync(page.id)
    } finally {
      setDeletingId(null)
    }
  }

  const copyPageLink = (page: PageWithRelations) => {
    const url = `${window.location.origin}/pages/${page.slug}`
    navigator.clipboard.writeText(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No pages yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first page to start building your knowledge base
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {pages.map((page) => (
        <Card 
          key={page.id} 
          className={cn(
            "group hover:shadow-md transition-shadow duration-200",
            deletingId === page.id && "opacity-50"
          )}
        >
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/pages/${page.slug}`}
                  className="block group/link"
                >
                  <h3 className="text-lg font-medium group-hover/link:text-primary transition-colors line-clamp-1">
                    {page.title}
                  </h3>
                </Link>
                
                {page.content && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {page.content.substring(0, 150)}
                    {page.content.length > 150 && '...'}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDistanceToNow(new Date(page.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {page.tags && page.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      <div className="flex gap-1">
                        {page.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.tag_name}
                          </Badge>
                        ))}
                        {page.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{page.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/pages/${page.slug}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Page
                    </Link>
                  </DropdownMenuItem>
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(page)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => copyPageLink(page)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(page)}
                    disabled={deletingId === page.id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}