'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [results, setResults] = useState<any>(null)

  const checkStatus = async () => {
    try {
      const response = await fetch(`${window.location.origin}/api/analyze/manual`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to check status:', error)
    }
  }

  const triggerManualAnalysis = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      const response = await fetch(`${window.location.origin}/api/analyze/manual`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(`Failed: ${error.error}`)
        return
      }

      const data = await response.json()
      setResults(data)
      
      if (data.tasksAnalyzed > 0) {
        toast.success(`Successfully analyzed ${data.tasksAnalyzed} tasks!`)
      } else {
        toast.info('No tasks needed analysis')
      }

      // Refresh stats
      await checkStatus()
    } catch (error) {
      console.error('Manual analysis failed:', error)
      toast.error('Failed to trigger analysis')
    } finally {
      setLoading(false)
    }
  }

  const triggerSingleAnalysis = async (taskId: string) => {
    try {
      const response = await fetch(`${window.location.origin}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(`Failed: ${error.error}`)
        return
      }

      toast.success('Task analysis triggered!')
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error('Single analysis failed:', error)
      toast.error('Failed to analyze task')
    }
  }

  // Check status on mount
  useState(() => {
    checkStatus()
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">AI Analysis Testing</h1>

      <div className="space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Status</CardTitle>
            <CardDescription>Current state of task analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-2">
                <p>Total Tasks: <span className="font-bold">{stats.totalTasks}</span></p>
                <p>Analyzed Tasks: <span className="font-bold text-green-600">{stats.analyzedTasks}</span></p>
                <p>Pending Analysis: <span className="font-bold text-orange-600">{stats.pendingAnalysis}</span></p>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading status...</p>
            )}
            <Button 
              onClick={checkStatus} 
              variant="outline" 
              size="sm" 
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        {/* Manual Trigger Card */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Analysis Trigger</CardTitle>
            <CardDescription>
              Analyze all tasks that don't have analysis yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={triggerManualAnalysis} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Tasks...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Analyze Pending Tasks
                </>
              )}
            </Button>

            {results && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">{results.message}</p>
                {results.results && results.results.length > 0 && (
                  <div className="space-y-1 text-sm">
                    {results.results.map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        {r.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-mono text-xs">{r.taskId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Single Task Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Analyze Specific Task</CardTitle>
            <CardDescription>
              Copy a task ID from the debug endpoint and analyze it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter task ID (e.g., d2f50dcc-082d-4515-ba32-6e8757717459)"
                className="w-full px-3 py-2 border rounded-md"
                id="taskId"
              />
              <Button 
                onClick={() => {
                  const input = document.getElementById('taskId') as HTMLInputElement
                  if (input?.value) {
                    triggerSingleAnalysis(input.value)
                  }
                }}
                variant="secondary"
                className="w-full"
              >
                Analyze This Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Links */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Links</CardTitle>
            <CardDescription>Useful endpoints for testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a 
                href="/api/test-ai" 
                target="_blank" 
                className="text-blue-600 hover:underline block"
              >
                /api/test-ai - Check OpenAI Configuration
              </a>
              <a 
                href="/api/debug-tasks" 
                target="_blank" 
                className="text-blue-600 hover:underline block"
              >
                /api/debug-tasks - View Tasks with Analysis
              </a>
              <a 
                href="/api/analyze/manual" 
                target="_blank" 
                className="text-blue-600 hover:underline block"
              >
                /api/analyze/manual - Check Analysis Status
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}