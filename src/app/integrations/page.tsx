'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, CheckCircle, Clock, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface GmailIntegration {
  id: string
  email_address: string
  is_active: boolean
  last_sync_at: string | null
  created_at: string
}

export default function IntegrationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [integration, setIntegration] = useState<GmailIntegration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const [taskCount, setTaskCount] = useState(0)
  const [syncKey, setSyncKey] = useState(0) // Force re-render key

  // Check for OAuth callback parameters
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    
    if (success === 'true') {
      toast.success('Gmail connected successfully!')
      // Clean up URL
      router.replace('/integrations')
    } else if (error) {
      const errorMessage = error === 'auth_failed' 
        ? 'Failed to connect Gmail. Please try again.'
        : `Connection error: ${error}`
      toast.error(errorMessage)
      // Clean up URL
      router.replace('/integrations')
    }
  }, [searchParams, router])

  // Fetch Gmail integration status
  useEffect(() => {
    fetchIntegration()
  }, [])

  const fetchIntegration = async (forceRefresh = false) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user ID:', user?.id)
      
      // Always query with user_id for proper data isolation
      const query = supabase
        .from('gmail_integrations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single()

      const { data, error } = await query

      console.log('Integration query result:', { data, error })

      if (!error && data) {
        setIntegration(data)
        
        // Fetch email processing stats
        const { count: processed } = await supabase
          .from('processed_emails')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id)
        
        // Count accepted notifications (which became tasks)
        const { count: tasks } = await supabase
          .from('feedback_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id)
          .eq('status', 'accepted')
        
        setProcessedCount(processed || 0)
        setTaskCount(tasks || 0)
      }
    } catch (error) {
      console.error('Error fetching integration:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectGmail = async () => {
    setIsConnecting(true)
    // Redirect to OAuth endpoint
    window.location.href = '/api/auth/gmail'
  }

  const handleDisconnect = async () => {
    if (!integration) return
    
    if (!confirm('Are you sure you want to disconnect Gmail? This will stop automatic email imports.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('gmail_integrations')
        .update({ is_active: false })
        .eq('id', integration.id)

      if (error) throw error

      toast.success('Gmail disconnected')
      setIntegration(null)
    } catch (error) {
      toast.error('Failed to disconnect Gmail')
      console.error('Disconnect error:', error)
    }
  }

  const handleSyncNow = async () => {
    if (!integration) return
    
    setIsSyncing(true)
    try {
      const response = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Sync failed')
      }

      const result = await response.json()
      
      if (result.stats.processed === 0) {
        toast.info('No new emails to process')
      } else {
        const message = result.stats.feedbackFound > 0
          ? `Processed ${result.stats.processed} email${result.stats.processed !== 1 ? 's' : ''}, found ${result.stats.feedbackFound} feedback email${result.stats.feedbackFound !== 1 ? 's' : ''}`
          : `Processed ${result.stats.processed} email${result.stats.processed !== 1 ? 's' : ''}, no feedback found`
        toast.success(message)
        
        // If feedback was found, show a message to check notifications
        if (result.stats.feedbackFound > 0) {
          setTimeout(() => {
            toast.info(
              <div className="flex items-center gap-2">
                <span>Check your notifications to review the feedback</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push('/notifications')}
                  className="ml-2"
                >
                  View
                </Button>
              </div>,
              { duration: 5000 }
            )
          }, 1000)
        }
      }

      // Update the integration state immediately with new timestamp
      if (integration) {
        const newTimestamp = new Date().toISOString()
        console.log('Updating integration state with new timestamp:', newTimestamp)
        setIntegration({
          ...integration,
          last_sync_at: newTimestamp
        })
        // Force re-render to update the time display
        setSyncKey(prev => prev + 1)
      }
      
      // Also update the counts if new feedback was found
      if (result.stats.processed > 0) {
        setProcessedCount(prev => prev + result.stats.processed)
        if (result.stats.feedbackFound > 0) {
          // Note: This is approximate since not all notifications become tasks
          setTaskCount(prev => prev + result.stats.feedbackFound)
        }
      }
      
      // Fetch fresh data after a short delay to get exact server values
      setTimeout(() => {
        fetchIntegration(true)
      }, 1000)
    } catch (error: any) {
      toast.error(error.message || 'Sync failed')
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="h-full">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-500 mt-2">
            Connect your tools to automate task creation from external sources
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Gmail Integration Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Gmail</CardTitle>
                    <CardDescription>Import feedback from emails</CardDescription>
                  </div>
                </div>
                {integration && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : !integration ? (
                <>
                  <p className="text-sm text-gray-600">
                    Automatically detect and import feedback emails as tasks. We'll check for new emails hourly.
                  </p>
                  <Button 
                    onClick={handleConnectGmail}
                    className="w-full"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Connect Gmail
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{integration.email_address}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last sync:</span>
                      <span key={syncKey} className="font-medium">
                        {integration.last_sync_at 
                          ? (() => {
                              const syncDate = new Date(integration.last_sync_at)
                              const now = new Date()
                              const diffInSeconds = Math.floor((now.getTime() - syncDate.getTime()) / 1000)
                              
                              // Show "just now" for very recent syncs
                              if (diffInSeconds < 10) {
                                return 'just now'
                              } else if (diffInSeconds < 60) {
                                return 'a few seconds ago'
                              } else {
                                return formatDistanceToNow(syncDate, { addSuffix: true })
                              }
                            })()
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Emails processed:</span>
                      <span className="font-medium">{processedCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tasks created:</span>
                      <span className="font-medium">{taskCount}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={handleSyncNow}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync Now
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={handleDisconnect}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Placeholder for future integrations */}
          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Slack</CardTitle>
                  <CardDescription>Coming soon</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Import messages and threads from Slack channels as tasks.
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Discord</CardTitle>
                  <CardDescription>Coming soon</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Track feedback and requests from Discord communities.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}