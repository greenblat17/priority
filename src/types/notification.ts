import { FeedbackType } from './gmail'

export interface FeedbackNotification {
  id: string
  user_id: string
  processed_email_id: string
  title: string
  summary: string
  feedback_type: FeedbackType | null
  suggested_priority: number | null
  confidence_score: number | null
  status: 'pending' | 'accepted' | 'declined'
  reviewed_at: string | null
  created_at: string
  updated_at: string
  // Relations
  processed_email?: {
    from_email: string
    from_name?: string
    subject: string
    content: string
    received_at: string
  }
}