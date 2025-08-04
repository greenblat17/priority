'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageEditor } from '@/components/pages/page-editor'
import { PageTags } from '@/components/pages/page-tags'
import { PageTaskLink } from '@/components/pages/page-task-link'
import { useUpdatePage } from '@/hooks/use-pages'
import { usePageTags } from '@/hooks/use-page-search'
import { usePageTasks, useLinkTask, useUnlinkTask } from '@/hooks/use-page-tasks'
import { useTasks } from '@/hooks/use-tasks'
import { createClient } from '@/lib/supabase/client'
import type { PageWithRelations } from '@/types/page'
import { toast } from 'sonner'

interface EditPageProps {
  params: {
    slug: string
  }
}

export default function EditPagePage({ params }: EditPageProps) {
  const router = useRouter()
  const updatePage = useUpdatePage()
  const { data: availableTags } = usePageTags()
  const [page, setPage] = useState<PageWithRelations | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Task linking
  const { data: linkedTasks = [] } = usePageTasks(page?.id)
  const { data: allTasks = [] } = useTasks()
  const linkTask = useLinkTask(page?.id || '')
  const unlinkTask = useUnlinkTask(page?.id || '')

  useEffect(() => {
    async function fetchPage() {
      const supabase = createClient()
      
      const { data: pageData, error } = await supabase
        .from('pages')
        .select(`
          *,
          tags:page_tags(id, tag_name)
        `)
        .eq('slug', params.slug)
        .single()
      
      if (error || !pageData) {
        notFound()
      }
      
      setPage(pageData)
      setTitle(pageData.title)
      setContent(pageData.content || '')
      setTags(pageData.tags?.map((t: any) => t.tag_name) || [])
      setIsLoading(false)
    }
    
    fetchPage()
  }, [params.slug])

  // Track changes
  useEffect(() => {
    if (page) {
      const titleChanged = title !== page.title
      const contentChanged = content !== (page.content || '')
      const tagsChanged = JSON.stringify(tags.sort()) !== JSON.stringify((page.tags?.map(t => t.tag_name) || []).sort())
      setHasChanges(titleChanged || contentChanged || tagsChanged)
    }
  }, [title, content, tags, page])

  // Auto-save functionality
  useEffect(() => {
    if (!hasChanges || !page) return

    const autoSaveTimer = setTimeout(() => {
      handleSave(true)
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [title, content, hasChanges, page])

  const handleSave = async (isAutoSave = false) => {
    if (!page || !title.trim()) return
    
    setIsSaving(true)
    try {
      await updatePage.mutateAsync({
        id: page.id,
        title: title.trim(),
        content: content.trim(),
        tags: tags,
      })
      
      if (!isAutoSave) {
        toast.success('Page saved successfully')
        router.push(`/pages/${page.slug}`)
      } else {
        // For auto-save, show a subtle notification
        toast.success('Auto-saved', {
          duration: 1000,
        })
      }
      
      setHasChanges(false)
    } catch (error) {
      if (!isAutoSave) {
        toast.error('Failed to save page')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return
    }
    router.push(`/pages/${page?.slug || '/pages'}`)
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!page) {
    return notFound()
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Link href={`/pages/${page.slug}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Page
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Page</h1>
            <p className="text-muted-foreground">
              Make changes to your page
            </p>
          </div>
          {hasChanges && (
            <Badge variant="secondary">Unsaved changes</Badge>
          )}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
            <CardDescription>
              Update your page title and content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <PageTags
                tags={tags}
                onTagsChange={setTags}
                availableTags={(availableTags as string[]) || []}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>
              Edit your content using Markdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your page content..."
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Task Integration</CardTitle>
            <CardDescription>
              Link related tasks to this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageTaskLink
              pageId={page?.id || ''}
              linkedTasks={linkedTasks}
              availableTasks={allTasks}
              onLink={linkTask.mutate}
              onUnlink={unlinkTask.mutate}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving || !hasChanges || !title.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}