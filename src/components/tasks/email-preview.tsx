'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Mail, User, Calendar, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { ProcessedEmail, FeedbackType } from '@/types/gmail'

interface EmailPreviewProps {
  email: ProcessedEmail
  confidenceScore?: number
}

const getFeedbackTypeBadgeVariant = (type: FeedbackType) => {
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
      return 'success' as any // Custom variant we might add later
    default:
      return 'secondary'
  }
}

const getFeedbackTypeLabel = (type: FeedbackType) => {
  switch (type) {
    case 'bug_report':
      return 'Bug Report'
    case 'feature_request':
      return 'Feature Request'
    case 'question':
      return 'Question'
    case 'complaint':
      return 'Complaint'
    case 'praise':
      return 'Praise'
    default:
      return type
  }
}

export function EmailPreview({ email, confidenceScore }: EmailPreviewProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Original Email
          </h4>
          <div className="flex items-center gap-2">
            {email.feedback_type && (
              <Badge variant={getFeedbackTypeBadgeVariant(email.feedback_type)} className="text-xs">
                {getFeedbackTypeLabel(email.feedback_type)}
              </Badge>
            )}
            {confidenceScore !== undefined && (
              <Badge variant="outline" className="text-xs">
                {Math.round(confidenceScore * 100)}% confidence
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span className="font-medium">From:</span>
            <span>
              {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">Received:</span>
            <span>{format(new Date(email.received_at), 'MMM dd, yyyy at h:mm a')}</span>
          </div>

          <div className="flex items-start gap-2 text-muted-foreground">
            <Tag className="h-3.5 w-3.5 mt-0.5" />
            <span className="font-medium">Subject:</span>
            <span className="flex-1">{email.subject}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        {email.ai_summary && (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">AI Summary</p>
            <p className="text-sm text-blue-800 dark:text-blue-200">{email.ai_summary}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-2">Email Content</p>
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
            <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {email.content}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}