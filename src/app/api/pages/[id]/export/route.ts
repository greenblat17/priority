import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/pages/[id]/export?format=markdown - Export page in specified format
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id: pageId } = params
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'markdown'
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get page with linked tasks
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select(`
        *,
        page_task_links!inner(
          task:tasks(*)
        )
      `)
      .eq('id', pageId)
      .eq('user_id', user.id)
      .single()
    
    if (pageError || !page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    
    // Get linked tasks
    const linkedTasks = page.page_task_links?.map((link: any) => link.task) || []
    
    // Export based on format
    if (format === 'markdown') {
      const markdown = generateMarkdown(page, linkedTasks)
      
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${page.slug}.md"`,
        },
      })
    }
    
    return NextResponse.json(
      { error: 'Unsupported export format' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in GET /api/pages/[id]/export:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateMarkdown(page: any, linkedTasks: any[]): string {
  let markdown = ''
  
  // Add frontmatter
  markdown += '---\n'
  markdown += `title: ${page.title}\n`
  markdown += `slug: ${page.slug}\n`
  if (page.description) {
    markdown += `description: ${page.description}\n`
  }
  markdown += `created: ${new Date(page.created_at).toISOString()}\n`
  markdown += `updated: ${new Date(page.updated_at).toISOString()}\n`
  markdown += `status: ${page.status}\n`
  markdown += '---\n\n'
  
  // Add main content
  markdown += page.content || ''
  
  // Add linked tasks section if any
  if (linkedTasks.length > 0) {
    markdown += '\n\n## Linked Tasks\n\n'
    
    // Group tasks by status
    const tasksByStatus = linkedTasks.reduce((acc, task) => {
      const status = task.status || 'pending'
      if (!acc[status]) acc[status] = []
      acc[status].push(task)
      return acc
    }, {} as Record<string, any[]>)
    
    // Add tasks by status
    const statusOrder = ['pending', 'in_progress', 'completed']
    statusOrder.forEach(status => {
      if (tasksByStatus[status]?.length > 0) {
        markdown += `\n### ${formatStatus(status)}\n\n`
        tasksByStatus[status].forEach(task => {
          const checkbox = task.status === 'completed' ? '[x]' : '[ ]'
          markdown += `- ${checkbox} **${task.name}**`
          
          if (task.priority) {
            markdown += ` _(Priority: ${task.priority}/10)_`
          }
          
          if (task.category) {
            markdown += ` [${task.category}]`
          }
          
          if (task.description) {
            markdown += `\n  ${task.description.replace(/\n/g, '\n  ')}`
          }
          
          markdown += '\n'
        })
      }
    })
  }
  
  return markdown
}

function formatStatus(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending Tasks'
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed Tasks'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}