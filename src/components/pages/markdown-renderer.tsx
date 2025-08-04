'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'
import { TaskEmbed } from '@/components/pages/task-embed'
import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [processedContent, setProcessedContent] = useState(content)
  const [taskEmbeds, setTaskEmbeds] = useState<Record<string, any>>({})
  
  useEffect(() => {
    // Process task embeds
    const taskEmbedRegex = /```tasks\n([\s\S]*?)```/g
    const embeds: Record<string, any> = {}
    let embedIndex = 0
    
    const processed = content.replace(taskEmbedRegex, (match, config) => {
      try {
        const lines = config.trim().split('\n')
        const embedConfig: any = {
          title: 'Tasks',
          filter: 'all',
          showStatus: true,
          showPriority: true,
          showCategory: true
        }
        
        lines.forEach((line: string) => {
          const [key, value] = line.split(':').map(s => s.trim())
          if (key && value) {
            if (key === 'tasks') {
              embedConfig.taskIds = value.split(',').map(s => s.trim())
            } else if (key === 'show') {
              const showOptions = value.split(',').map(s => s.trim())
              embedConfig.showStatus = showOptions.includes('status')
              embedConfig.showPriority = showOptions.includes('priority')
              embedConfig.showCategory = showOptions.includes('category')
            } else {
              embedConfig[key] = value
            }
          }
        })
        
        const placeholder = `__TASK_EMBED_${embedIndex}__`
        embeds[placeholder] = embedConfig
        embedIndex++
        return placeholder
      } catch (error) {
        console.error('Error parsing task embed:', error)
        return match
      }
    })
    
    setProcessedContent(processed)
    setTaskEmbeds(embeds)
  }, [content])
  
  return (
    <div className={cn("prose prose-slate max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom heading renderers with better styling
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground">{children}</h3>
          ),
          // Better paragraph spacing
          p: ({ children }) => {
            // Check if this paragraph contains a task embed placeholder
            if (typeof children === 'string' && children.startsWith('__TASK_EMBED_')) {
              const config = taskEmbeds[children]
              if (config) {
                return (
                  <div className="my-4 not-prose">
                    <TaskEmbed {...config} />
                  </div>
                )
              }
            }
            return (
              <p className="mb-4 text-foreground/90 leading-relaxed">{children}</p>
            )
          },
          // Styled lists
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground/90">{children}</li>
          ),
          // Better blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/20 pl-4 py-2 italic text-muted-foreground my-4">
              {children}
            </blockquote>
          ),
          // Code blocks with syntax highlighting
          pre: ({ children }) => (
            <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 overflow-x-auto my-4">
              {children}
            </pre>
          ),
          code: ({ children, inline, ...props }: any) => {
            if (inline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              )
            }
            return <code {...props}>{children}</code>
          },
          // Tables with better styling
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border">{children}</tbody>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-foreground/90">{children}</td>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary hover:underline"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          // Horizontal rule
          hr: () => <hr className="border-border my-8" />,
          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-lg shadow-md max-w-full h-auto my-4"
            />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}