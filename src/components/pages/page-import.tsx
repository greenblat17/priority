'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PageImportProps {
  onSuccess?: () => void
}

export function PageImport({ onSuccess }: PageImportProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [importResults, setImportResults] = useState<Array<{ name: string; status: 'pending' | 'success' | 'error'; message?: string }>>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFiles(files)
      const results = Array.from(files).map(file => ({
        name: file.name,
        status: 'pending' as const,
      }))
      setImportResults(results)
    }
  }

  const handleImport = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select at least one file')
      return
    }

    setIsImporting(true)
    const newResults = [...importResults]
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      newResults[i] = { ...newResults[i], status: 'pending' }
      setImportResults([...newResults])

      try {
        // Read file content
        const content = await file.text()
        
        // Import the file
        const response = await fetch('/api/pages/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            filename: file.name,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Import failed')
        }

        const result = await response.json()
        newResults[i] = {
          ...newResults[i],
          status: 'success',
          message: result.message || 'Imported successfully',
        }
        successCount++
      } catch (error) {
        console.error(`Error importing ${file.name}:`, error)
        newResults[i] = {
          ...newResults[i],
          status: 'error',
          message: error instanceof Error ? error.message : 'Import failed',
        }
        errorCount++
      }

      setImportResults([...newResults])
    }

    setIsImporting(false)

    // Show summary toast
    if (successCount > 0 && errorCount === 0) {
      toast.success(`Successfully imported ${successCount} page${successCount > 1 ? 's' : ''}`)
      setTimeout(() => {
        setOpen(false)
        onSuccess?.()
        router.refresh()
      }, 1000)
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`Imported ${successCount} page${successCount > 1 ? 's' : ''}, ${errorCount} failed`)
    } else {
      toast.error('All imports failed')
    }
  }

  const handleReset = () => {
    setSelectedFiles(null)
    setImportResults([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Pages
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import Pages from Markdown</DialogTitle>
          <DialogDescription>
            Select one or more Markdown files to import as pages. Files should have frontmatter with title and optional metadata.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Markdown Files</Label>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".md,.markdown,.txt"
              multiple
              onChange={handleFileSelect}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isImporting}
            />
          </div>

          {importResults.length > 0 && (
            <div className="space-y-2">
              <Label>Import Status</Label>
              <div className="max-h-[200px] overflow-y-auto space-y-1 rounded-md border p-3">
                {importResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="truncate max-w-[300px]">{result.name}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {result.status === 'pending' && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {result.status === 'success' && (
                        <span className="text-green-600 text-xs">✓ {result.message}</span>
                      )}
                      {result.status === 'error' && (
                        <span className="text-destructive text-xs">✗ {result.message}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Example Markdown format:</p>
            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`---
title: My Page Title
description: Optional description
tags: [tag1, tag2]
---

# Page Content

Your markdown content here...`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          {selectedFiles && selectedFiles.length > 0 && !isImporting && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="mr-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
          <Button
            onClick={handleImport}
            disabled={!selectedFiles || selectedFiles.length === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {selectedFiles ? `${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}` : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}