'use client'

import { FeedbackNotification } from '@/types/notification'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Mail, AlertCircle, MessageSquare, Heart, Bug, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EmailPreview } from '@/components/tasks/email-preview'

interface NotificationItemProps {
  notification: FeedbackNotification
  onAccept: () => void
  onDecline: () => void
  isProcessing: boolean
}

export function NotificationItem({ 
  notification, 
  onAccept, 
  onDecline,
  isProcessing 
}: NotificationItemProps) {
  const getFeedbackIcon = () => {
    switch (notification.feedback_type) {
      case 'bug_report':
        return <Bug className="h-4 w-4 text-red-500" />
      case 'feature_request':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'question':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'complaint':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'praise':
        return <Heart className="h-4 w-4 text-pink-500" />
      default:
        return <Mail className="h-4 w-4 text-gray-500" />
    }
  }

  const getFeedbackBadgeVariant = (type: string | null) => {
    switch (type) {
      case 'bug_report':
        return 'destructive'
      case 'feature_request':
        return 'default'
      case 'question':
        return 'secondary'
      case 'complaint':
        return 'outline'
      case 'praise':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const formatFeedbackType = (type: string | null) => {
    if (!type) return 'Feedback'
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-0.5">{getFeedbackIcon()}</div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium truncate">
                {notification.title}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant={getFeedbackBadgeVariant(notification.feedback_type)} 
                  className="text-xs"
                >
                  {formatFeedbackType(notification.feedback_type)}
                </Badge>
                {notification.confidence_score && (
                  <span className="text-xs text-gray-500">
                    {Math.round(notification.confidence_score * 100)}% confidence
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {format(new Date(notification.created_at), 'MMM d')}
          </span>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {notification.summary}
        </p>

        {/* Email info */}
        {notification.processed_email && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail className="h-3 w-3" />
            <span>
              From {notification.processed_email.from_name || notification.processed_email.from_email}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="default"
            className="h-8"
            onClick={onAccept}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" />
                Accept
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={onDecline}
            disabled={isProcessing}
          >
            <X className="h-3 w-3 mr-1" />
            Decline
          </Button>
          
          {/* View full email dialog */}
          {notification.processed_email && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 ml-auto"
                  disabled={isProcessing}
                >
                  View Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Email Details</DialogTitle>
                  <DialogDescription>
                    Review the full email content before accepting
                  </DialogDescription>
                </DialogHeader>
                <EmailPreview 
                  email={{
                    id: notification.processed_email_id,
                    user_id: notification.user_id,
                    gmail_message_id: '',
                    from_email: notification.processed_email.from_email,
                    from_name: notification.processed_email.from_name,
                    subject: notification.processed_email.subject,
                    content: notification.processed_email.content,
                    received_at: notification.processed_email.received_at,
                    is_feedback: true,
                    feedback_type: notification.feedback_type,
                    confidence_score: notification.confidence_score,
                    ai_summary: notification.summary,
                    processed_at: notification.created_at,
                    created_at: notification.created_at
                  }} 
                  confidenceScore={notification.confidence_score}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}