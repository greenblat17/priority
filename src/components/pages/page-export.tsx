'use client'

import { useState } from 'react'
import { Download, FileText, FileImage, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface PageExportProps {
  pageId: string
  pageSlug: string
}

export function PageExport({ pageId, pageSlug }: PageExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)

  const handleExport = async (format: 'markdown' | 'pdf') => {
    setIsExporting(true)
    setExportFormat(format)
    
    try {
      const response = await fetch(`/api/pages/${pageId}/export?format=${format}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }
      
      // Get the blob from response
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${pageSlug}.${format === 'markdown' ? 'md' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Page exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to export page')
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport('markdown')}
          disabled={isExporting}
        >
          <FileText className="mr-2 h-4 w-4" />
          Markdown (.md)
          {isExporting && exportFormat === 'markdown' && (
            <Loader2 className="ml-auto h-4 w-4 animate-spin" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting || true} // PDF export not implemented yet
          className="opacity-50"
        >
          <FileImage className="mr-2 h-4 w-4" />
          PDF (Coming Soon)
          {isExporting && exportFormat === 'pdf' && (
            <Loader2 className="ml-auto h-4 w-4 animate-spin" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}