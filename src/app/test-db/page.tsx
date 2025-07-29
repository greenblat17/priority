'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function TestDatabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const supabase = createClient()
      
      // Test connection by attempting to fetch from a table
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .limit(1)

      if (error) {
        // If error is about missing table, the connection works but migration hasn't run
        if (error.message.includes('relation "public.tasks" does not exist')) {
          setConnectionStatus('connected')
          setError('Connected to Supabase, but tables not created yet. Please run the migration.')
        } else {
          setConnectionStatus('error')
          setError(error.message)
        }
      } else {
        setConnectionStatus('connected')
        setTestResult(data)
      }
    } catch (err) {
      setConnectionStatus('error')
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const testInsert = async () => {
    try {
      const supabase = createClient()
      
      // For testing, we'll use a dummy user ID
      // In production, this would come from auth
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          description: 'Test task from database connection test',
          source: 'internal',
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        setError(`Insert error: ${error.message}`)
      } else {
        setTestResult(data)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <CardDescription>
            Testing connection to Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <Badge variant={
              connectionStatus === 'connected' ? 'default' :
              connectionStatus === 'error' ? 'destructive' :
              'secondary'
            }>
              {connectionStatus}
            </Badge>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {connectionStatus === 'connected' && (
            <>
              <div className="p-4 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 rounded-md">
                <p className="text-sm">✅ Successfully connected to Supabase!</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Connection details:
                </p>
                <code className="block p-2 bg-muted rounded text-xs">
                  URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
                </code>
              </div>

              <Button onClick={testInsert} variant="outline">
                Test Insert (Requires Auth)
              </Button>

              {testResult && (
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-2">Test Result:</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to SQL Editor</li>
              <li>Run the migration from <code>supabase/migrations/001_initial_schema.sql</code></li>
              <li>Refresh this page to verify tables are created</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}