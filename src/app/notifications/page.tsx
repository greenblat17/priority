'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { CheckCircle, XCircle, AlertCircle, FileText, Bug, MessageSquare, ThumbsUp, ThumbsDown, Mail, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ProcessedEmail } from '@/types/gmail'

interface FeedbackNotification {
  id: string
  user_id: string
  processed_email_id: string
  title: string
  summary: string
  feedback_type: 'bug_report' | 'feature_request' | 'question' | 'complaint' | 'praise' | null
  suggested_priority: number | null
  confidence_score: number | null
  status: 'pending' | 'accepted' | 'declined'
  reviewed_at: string | null
  created_at: string
  updated_at: string
  processed_emails?: ProcessedEmail | null
}

const feedbackTypeConfig = {
  bug_report: { 
    label: 'Bug Report', 
    icon: Bug, 
    color: 'bg-red-100 text-red-700 border-red-200' 
  },
  feature_request: { 
    label: 'Feature Request', 
    icon: FileText, 
    color: 'bg-blue-100 text-blue-700 border-blue-200' 
  },
  question: { 
    label: 'Question', 
    icon: MessageSquare, 
    color: 'bg-purple-100 text-purple-700 border-purple-200' 
  },
  complaint: { 
    label: 'Complaint', 
    icon: ThumbsDown, 
    color: 'bg-orange-100 text-orange-700 border-orange-200' 
  },
  praise: { 
    label: 'Praise', 
    icon: ThumbsUp, 
    color: 'bg-green-100 text-green-700 border-green-200' 
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<FeedbackNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending')
  const supabase = useMemo(() => createClient(), [])

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('feedback_notifications')
        .select(`
          *,
          processed_emails!processed_email_id(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter === 'pending') {
        query = query.eq('status', 'pending')
      } else if (filter === 'reviewed') {
        query = query.in('status', ['accepted', 'declined'])
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }
      
      console.log('Fetched notifications:', data)
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [filter, supabase])

  const handleAccept = async (notification: FeedbackNotification) => {
    try {
      const response = await fetch('/api/notifications/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notification.id })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to accept notification')
      }

      const { task } = await response.json()
      toast.success(`Task created: ${task.title || task.description}`)
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, status: 'accepted' as const, reviewed_at: new Date().toISOString() } 
            : n
        )
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept notification')
    }
  }

  const handleDecline = async (notification: FeedbackNotification) => {
    try {
      const response = await fetch('/api/notifications/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notification.id })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to decline notification')
      }

      toast.success('Notification declined')
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, status: 'declined' as const, reviewed_at: new Date().toISOString() } 
            : n
        )
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to decline notification')
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])
  
  useEffect(() => {
    // Set up real-time subscription
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'feedback_notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
    
    const cleanup = setupSubscription()
    
    return () => {
      cleanup.then(fn => fn && fn())
    }
  }, [supabase, fetchNotifications])

  const pendingCount = notifications.filter(n => n.status === 'pending').length

  return (
    <div className="h-full">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feedback Notifications</h1>
          <p className="text-gray-500 mt-2">
            Review feedback emails before converting them to tasks
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending Review
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={filter === 'reviewed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('reviewed')}
            >
              Reviewed
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'pending' 
                  ? 'No pending notifications' 
                  : 'No notifications found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const feedbackConfig = notification.feedback_type 
                ? feedbackTypeConfig[notification.feedback_type] 
                : null
              const FeedbackIcon = feedbackConfig?.icon || FileText

              return (
                <Card key={notification.id} className={notification.status !== 'pending' ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {feedbackConfig && (
                            <Badge className={feedbackConfig.color}>
                              <FeedbackIcon className="h-3 w-3 mr-1" />
                              {feedbackConfig.label}
                            </Badge>
                          )}
                          {notification.confidence_score && (
                            <Badge variant="outline">
                              {Math.round(notification.confidence_score * 100)}% confidence
                            </Badge>
                          )}
                          {notification.status !== 'pending' && (
                            <Badge variant={notification.status === 'accepted' ? 'default' : 'secondary'}>
                              {notification.status === 'accepted' ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Accepted
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Declined
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {notification.processed_emails?.from_email || 'Unknown sender'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">
                        {notification.summary}
                      </p>
                    </div>
                    
                    {notification.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(notification)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept as Task
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecline(notification)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                    
                    {notification.reviewed_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Reviewed {formatDistanceToNow(new Date(notification.reviewed_at), { addSuffix: true })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}