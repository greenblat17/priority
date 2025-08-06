export interface GmailIntegration {
  id: string
  user_id: string
  access_token: string | null
  refresh_token: string | null
  token_expiry: string | null
  email_address: string
  is_active: boolean
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export type FeedbackType = 'bug_report' | 'feature_request' | 'question' | 'complaint' | 'praise'

export interface ProcessedEmail {
  id: string
  user_id: string
  gmail_message_id: string
  gmail_thread_id?: string
  from_email: string
  from_name?: string
  subject: string
  content: string
  received_at: string
  is_feedback: boolean
  feedback_type?: FeedbackType
  confidence_score?: number
  ai_summary?: string
  processed_at: string
  task_id?: string
  created_at: string
}

export interface EmailClassification {
  isFeedback: boolean
  confidence: number
  // Only set if isFeedback is true
  category?: FeedbackType
  suggestedPriority?: number
  summary?: string
  suggestedTitle?: string
}

export interface GmailOAuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
  token_type: string
}

export interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  payload: {
    headers: Array<{
      name: string
      value: string
    }>
    body: {
      data?: string
    }
    parts?: Array<{
      mimeType: string
      body: {
        data?: string
      }
    }>
  }
  internalDate: string
}