'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { getSimilarityPercentage } from '@/lib/duplicate-detection-utils'
import type { DuplicateCheckResponse } from '@/types/duplicate'

export default function TestDuplicatesPage() {
  const [description, setDescription] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<DuplicateCheckResponse | null>(null)

  const checkDuplicates = async () => {
    if (!description.trim()) {
      toast.error('Please enter a task description')
      return
    }

    setIsChecking(true)
    setResults(null)

    try {
      const response = await fetch('/api/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to check duplicates')
      }

      const data: DuplicateCheckResponse = await response.json()
      setResults(data)
      
      if (data.potentialDuplicates.length === 0) {
        toast.success('No duplicates found!')
      } else {
        toast.info(`Found ${data.potentialDuplicates.length} potential duplicate(s)`)
      }
    } catch (error) {
      console.error('Error checking duplicates:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to check duplicates')
    } finally {
      setIsChecking(false)
    }
  }

  const testDescriptions = [
    "Fix payment processing error when users try to upgrade to premium",
    "Add dark mode toggle to settings page",
    "Implement user authentication with OAuth",
    "Improve dashboard loading performance",
    "Fix bug where app crashes on iOS when uploading large images",
    "Add real-time collaboration features like Figma",
    "Create API documentation for developers",
    "Optimize database queries for better performance"
  ]

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Duplicate Detection</CardTitle>
          <CardDescription>
            Test the duplicate detection system by entering task descriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Task Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a task description to check for duplicates..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={checkDuplicates}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check for Duplicates'
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setDescription('')
                setResults(null)
              }}
            >
              Clear
            </Button>
          </div>

          {/* Test Descriptions */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Quick test descriptions:
            </p>
            <div className="flex flex-wrap gap-2">
              {testDescriptions.map((desc, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => setDescription(desc)}
                  className="text-xs"
                >
                  Test {i + 1}
                </Button>
              ))}
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium">Results:</h3>
              
              {results.potentialDuplicates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No duplicates found. This appears to be a unique task.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Found {results.potentialDuplicates.length} potential duplicate(s):
                  </p>
                  {results.potentialDuplicates.map((dup) => (
                    <Card key={dup.taskId}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge 
                            variant={dup.similarity >= 0.95 ? 'destructive' : 'secondary'}
                          >
                            {getSimilarityPercentage(dup.similarity)} match
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {dup.task.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm">{dup.task.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(dup.task.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Embedding info */}
              <div className="text-xs text-muted-foreground">
                <p>Embedding generated: {results.embedding ? '✓' : '✗'}</p>
                {results.embedding && (
                  <p>Embedding dimensions: {results.embedding.length}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}