import { z } from 'zod'

// Page type (matches Supabase schema)
export interface Page {
  id: string
  user_id: string
  parent_id: string | null
  title: string
  slug: string
  content: string | null
  content_type: string
  is_published: boolean
  is_template: boolean
  template_type: string | null
  meta_data: Record<string, any>
  created_at: string
  updated_at: string
  search_vector?: any
}

// Page with relations
export interface PageWithRelations extends Page {
  parent?: Page
  children?: Page[]
  tags?: PageTag[]
  versions?: PageVersion[]
  task_links?: PageTaskLink[]
}

// Page version type
export interface PageVersion {
  id: string
  page_id: string
  user_id: string
  title: string
  content: string | null
  version_number: number
  created_at: string
}

// Page tag type
export interface PageTag {
  id: string
  page_id: string
  tag_name: string
  created_at: string
}

// Page-task link type
export interface PageTaskLink {
  id: string
  page_id: string
  task_id: string
  created_at: string
}

// Page comment type
export interface PageComment {
  id: string
  page_id: string
  user_id: string
  user_email?: string
  parent_comment_id: string | null
  content: string
  created_at: string
  updated_at: string
  replies?: PageComment[]
}

// Zod schemas for validation
export const createPageSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  content: z.string().optional(),
  parent_id: z.string().uuid().optional().nullable(),
  is_published: z.boolean().default(true),
  is_template: z.boolean().default(false),
  template_type: z.string().optional().nullable(),
  meta_data: z.record(z.any()).default({}),
  tags: z.array(z.string()).optional().default([]),
})

export const updatePageSchema = createPageSchema.partial()

export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>

// Page tree node for navigation
export interface PageTreeNode extends Page {
  children: PageTreeNode[]
  level: number
}

// Page template types
export const PAGE_TEMPLATE_TYPES = {
  MEETING_NOTES: 'meeting_notes',
  PROJECT_DOCS: 'project_docs',
  KNOWLEDGE_BASE: 'knowledge_base',
  WEEKLY_REVIEW: 'weekly_review',
  BLANK: 'blank',
} as const

export type PageTemplateType = typeof PAGE_TEMPLATE_TYPES[keyof typeof PAGE_TEMPLATE_TYPES]

// Page content templates
export const PAGE_TEMPLATES: Record<PageTemplateType, { title: string; content: string }> = {
  [PAGE_TEMPLATE_TYPES.MEETING_NOTES]: {
    title: 'Meeting Notes - {date}',
    content: `# Meeting Notes

**Date:** {date}
**Attendees:** 
**Topic:** 

## Agenda
1. 
2. 
3. 

## Discussion Points

## Action Items
- [ ] 
- [ ] 

## Next Steps

## Notes
`,
  },
  [PAGE_TEMPLATE_TYPES.PROJECT_DOCS]: {
    title: 'Project Documentation',
    content: `# Project Title

## Overview

## Goals & Objectives

## Scope

## Timeline

## Resources

## Technical Details

## Risks & Mitigation

## References
`,
  },
  [PAGE_TEMPLATE_TYPES.KNOWLEDGE_BASE]: {
    title: 'Knowledge Base Article',
    content: `# Title

## Summary

## Background

## Solution/Information

### Step 1

### Step 2

### Step 3

## Examples

## Related Articles

## References
`,
  },
  [PAGE_TEMPLATE_TYPES.WEEKLY_REVIEW]: {
    title: 'Weekly Review - Week {week}',
    content: `# Weekly Review - Week {week}

## Accomplishments
- 
- 
- 

## Challenges
- 
- 

## Next Week's Priorities
1. 
2. 
3. 

## Learnings

## Notes
`,
  },
  [PAGE_TEMPLATE_TYPES.BLANK]: {
    title: 'Untitled Page',
    content: '',
  },
}