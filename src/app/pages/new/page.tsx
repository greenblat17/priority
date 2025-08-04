'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageEditor } from '@/components/pages/page-editor'
import { PageTags } from '@/components/pages/page-tags'
import { useCreatePage } from '@/hooks/use-pages'
import { usePageTags } from '@/hooks/use-page-search'
import { PAGE_TEMPLATES, PAGE_TEMPLATE_TYPES, type PageTemplateType } from '@/types/page'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

export default function NewPagePage() {
  const router = useRouter()
  const createPage = useCreatePage()
  const { data: availableTags } = usePageTags()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplateType>(PAGE_TEMPLATE_TYPES.BLANK)
  const [isCreating, setIsCreating] = useState(false)

  const handleTemplateChange = (templateType: PageTemplateType) => {
    setSelectedTemplate(templateType)
    const template = PAGE_TEMPLATES[templateType]
    
    // Replace placeholders
    const now = new Date()
    const formattedTitle = template.title
      .replace('{date}', now.toLocaleDateString())
      .replace('{week}', `${Math.ceil(now.getDate() / 7)}`)
    
    const formattedContent = template.content
      .replace('{date}', now.toLocaleDateString())
      .replace('{week}', `${Math.ceil(now.getDate() / 7)}`)
    
    setTitle(formattedTitle)
    setContent(formattedContent)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return
    
    setIsCreating(true)
    try {
      const page = await createPage.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        tags: tags,
        is_template: false,
      })
      
      router.push(`/pages/${page.slug}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Link href="/pages">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pages
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Create New Page</h1>
        <p className="text-muted-foreground">
          Start building your knowledge base
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Page Details
            </CardTitle>
            <CardDescription>
              Choose a template or start from scratch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={(value) => handleTemplateChange(value as PageTemplateType)}
              >
                <SelectTrigger id="template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PAGE_TEMPLATE_TYPES.BLANK}>
                    Blank Page
                  </SelectItem>
                  <SelectItem value={PAGE_TEMPLATE_TYPES.MEETING_NOTES}>
                    Meeting Notes
                  </SelectItem>
                  <SelectItem value={PAGE_TEMPLATE_TYPES.PROJECT_DOCS}>
                    Project Documentation
                  </SelectItem>
                  <SelectItem value={PAGE_TEMPLATE_TYPES.KNOWLEDGE_BASE}>
                    Knowledge Base Article
                  </SelectItem>
                  <SelectItem value={PAGE_TEMPLATE_TYPES.WEEKLY_REVIEW}>
                    Weekly Review
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title..."
                required
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <PageTags
                tags={tags}
                onTagsChange={setTags}
                availableTags={availableTags || []}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>
              Write your content using Markdown
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

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/pages')}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || !title.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {isCreating ? 'Creating...' : 'Create Page'}
          </Button>
        </div>
      </form>
    </div>
  )
}