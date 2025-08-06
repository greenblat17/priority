'use client'

import { useState } from 'react'
import { FeedbackNotification } from '@/types/notification'
import { NotificationItem } from './notification-item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Inbox } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface NotificationListProps {
  notifications: FeedbackNotification[]
  isLoading: boolean
  onReview: () => void
  onClose: () => void
}

export function NotificationList({ 
  notifications, 
  isLoading, 
  onReview,
  onClose 
}: NotificationListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const supabase = createClient()

  const handleAccept = async (notification: FeedbackNotification) => {
    setProcessingId(notification.id)
    
    try {
      // Call API to accept feedback and create task
      const response = await fetch('/api/notifications/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notification.id })
      })

      if (!response.ok) throw new Error('Failed to accept feedback')

      toast.success('Feedback accepted and task created')
      onReview() // Refresh the list
    } catch (error) {
      console.error('Error accepting feedback:', error)
      toast.error('Failed to accept feedback')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (notification: FeedbackNotification) => {
    setProcessingId(notification.id)
    
    try {
      // Update notification status to declined
      const { error } = await supabase
        .from('feedback_notifications')
        .update({ 
          status: 'declined',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', notification.id)

      if (error) throw error

      toast.success('Feedback declined')
      onReview() // Refresh the list
    } catch (error) {
      console.error('Error declining feedback:', error)
      toast.error('Failed to decline feedback')
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Inbox className="h-12 w-12 mb-3 text-gray-300" />
        <p className="text-sm font-medium">No new feedback</p>
        <p className="text-xs text-gray-400 mt-1">
          Feedback from emails will appear here
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onAccept={() => handleAccept(notification)}
            onDecline={() => handleDecline(notification)}
            isProcessing={processingId === notification.id}
          />
        ))}
      </div>
    </ScrollArea>
  )
}