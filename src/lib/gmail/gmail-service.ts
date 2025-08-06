import { createClient } from '@/lib/supabase/server'
import { GmailIntegration, GmailMessage } from '@/types/gmail'

const GMAIL_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1'

export class GmailService {
  private integration: GmailIntegration | null = null
  private supabase: any

  constructor(private userId: string) {}

  async initialize() {
    this.supabase = await createClient()
    
    // Fetch integration from database
    const { data, error } = await this.supabase
      .from('gmail_integrations')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      throw new Error('Gmail integration not found')
    }

    this.integration = data
    
    // Check if token needs refresh
    if (this.isTokenExpired()) {
      await this.refreshAccessToken()
    }
  }

  private isTokenExpired(): boolean {
    if (!this.integration?.token_expiry) return true
    
    const expiry = new Date(this.integration.token_expiry)
    const now = new Date()
    // Refresh if less than 5 minutes remaining
    return expiry.getTime() - now.getTime() < 5 * 60 * 1000
  }

  private async refreshAccessToken() {
    if (!this.integration?.refresh_token) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch(GMAIL_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: this.integration.refresh_token,
          client_id: process.env.GMAIL_CLIENT_ID!,
          client_secret: process.env.GMAIL_CLIENT_SECRET!,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const tokens = await response.json()
      
      // Calculate new expiry
      const tokenExpiry = new Date()
      tokenExpiry.setSeconds(tokenExpiry.getSeconds() + tokens.expires_in)

      // Update in database
      const { error } = await this.supabase
        .from('gmail_integrations')
        .update({
          access_token: tokens.access_token,
          token_expiry: tokenExpiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', this.integration.id)

      if (error) {
        throw new Error('Failed to update tokens in database')
      }

      // Update local integration
      this.integration.access_token = tokens.access_token
      this.integration.token_expiry = tokenExpiry.toISOString()
    } catch (error) {
      console.error('Token refresh error:', error)
      // Mark integration as inactive if refresh fails
      await this.supabase
        .from('gmail_integrations')
        .update({ is_active: false })
        .eq('id', this.integration!.id)
      
      throw error
    }
  }

  async fetchEmails(query: string = 'is:unread', maxResults: number = 50): Promise<GmailMessage[]> {
    if (!this.integration?.access_token) {
      throw new Error('No access token available')
    }

    const url = `${GMAIL_API_BASE}/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.integration.access_token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Try refreshing token once
        await this.refreshAccessToken()
        // Retry request
        const retryResponse = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.integration.access_token}`,
          },
        })
        
        if (!retryResponse.ok) {
          throw new Error('Failed to fetch emails after token refresh')
        }
        
        const data = await retryResponse.json()
        return this.fetchEmailDetails(data.messages || [])
      }
      
      throw new Error(`Failed to fetch emails: ${response.status}`)
    }

    const data = await response.json()
    return this.fetchEmailDetails(data.messages || [])
  }

  private async fetchEmailDetails(messages: Array<{ id: string }>): Promise<GmailMessage[]> {
    if (!this.integration?.access_token) return []
    
    const emails = await Promise.all(
      messages.map(async (message) => {
        const response = await fetch(
          `${GMAIL_API_BASE}/users/me/messages/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${this.integration!.access_token}`,
            },
          }
        )

        if (!response.ok) {
          console.error(`Failed to fetch message ${message.id}`)
          return null
        }

        return response.json() as Promise<GmailMessage>
      })
    )

    return emails.filter((email): email is GmailMessage => email !== null)
  }

  async markAsRead(messageId: string) {
    if (!this.integration?.access_token) {
      throw new Error('No access token available')
    }

    const response = await fetch(
      `${GMAIL_API_BASE}/users/me/messages/${messageId}/modify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.integration.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          removeLabelIds: ['UNREAD']
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to mark message as read: ${response.status}`)
    }
  }

  static extractEmailContent(message: GmailMessage): {
    from: string
    fromName?: string
    subject: string
    content: string
    date: Date
  } {
    const headers = message.payload.headers
    const fromHeader = headers.find(h => h.name === 'From')?.value || ''
    const subjectHeader = headers.find(h => h.name === 'Subject')?.value || ''
    
    // Extract email and name from "Name <email@example.com>" format
    const fromMatch = fromHeader.match(/^(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)$/)
    const fromName = fromMatch?.[1] || undefined
    const from = fromMatch?.[2] || fromHeader

    // Extract body content
    let content = ''
    
    if (message.payload.body?.data) {
      content = Buffer.from(message.payload.body.data, 'base64').toString('utf-8')
    } else if (message.payload.parts) {
      // Look for text/plain or text/html parts
      const textPart = message.payload.parts.find(
        part => part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      )
      
      if (textPart?.body?.data) {
        content = Buffer.from(textPart.body.data, 'base64').toString('utf-8')
      }
    }

    // Clean up HTML if present
    if (content.includes('<') && content.includes('>')) {
      content = content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace HTML spaces
        .replace(/&amp;/g, '&') // Replace HTML entities
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
    }

    return {
      from,
      fromName,
      subject: subjectHeader,
      content,
      date: new Date(parseInt(message.internalDate))
    }
  }
}