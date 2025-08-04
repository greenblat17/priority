'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag,
  FileText,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useDeletePage } from '@/hooks/use-pages'
import { MarkdownRenderer } from '@/components/pages/markdown-renderer'
import { PageBreadcrumbs } from '@/components/pages/page-breadcrumbs'
import type { PageWithRelations } from '@/types/page'

interface PageViewProps {
  params: {
    slug: string
  }
}

export default function PageView({ params }: PageViewProps) {
  const router = useRouter()
  const [page, setPage] = useState<PageWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const deletePage = useDeletePage()
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchPage() {
      const supabase = createClient()
      
      // First get the page by slug
      const { data: pageData, error } = await supabase
        .from('pages')
        .select(`
          *,
          parent:parent_id(id, title, slug),
          tags:page_tags(id, tag_name)
        `)
        .eq('slug', params.slug)
        .single()
      
      if (error || !pageData) {
        notFound()
      }
      
      setPage(pageData)
      setIsLoading(false)
    }
    
    fetchPage()
  }, [params.slug])

  const handleDelete = async () => {
    if (!page || !confirm(`Are you sure you want to delete "${page.title}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deletePage.mutateAsync(page.id)
      router.push('/pages')
    } catch (error) {
      setIsDeleting(false)
    }
  }


  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!page) {
    return notFound()
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <PageBreadcrumbs page={page} className="mb-4" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Created {formatDistanceToNow(new Date(page.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                {page.updated_at !== page.created_at && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    <span>
                      Updated {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
              
              {page.tags && page.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex gap-1 flex-wrap">
                    {page.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.tag_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isDeleting}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/pages/${page.slug}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {page.content ? (
            <MarkdownRenderer content={page.content} />
          ) : (
            <p className="text-muted-foreground italic">No content yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}