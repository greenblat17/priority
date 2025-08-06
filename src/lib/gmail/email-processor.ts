import { createClient } from '@/lib/supabase/server'
import { GmailService } from './gmail-service'
import { EmailClassifier } from './email-classifier'
import { ProcessedEmail, GmailMessage } from '@/types/gmail'
import { TaskStatus } from '@/types/task'

// Import service client conditionally
let supabaseService: any
try {
  supabaseService = require('@/lib/supabase/service').supabaseService
} catch (error) {
  console.warn('Service role client not available, will use regular client')
}

export class EmailProcessor {
  private classifier: EmailClassifier | null = null

  /**
   * Process emails for a specific user
   */
  async processUserEmails(userId: string): Promise<{
    processed: number
    feedbackFound: number
    tasksCreated: number
  }> {
    const supabase = await createClient()
    const stats = {
      processed: 0,
      feedbackFound: 0,
      tasksCreated: 0
    }

    try {
      // Initialize classifier with user context
      this.classifier = new EmailClassifier(userId)
      await this.classifier.initialize()
      // Initialize Gmail service
      const gmailService = new GmailService(userId)
      await gmailService.initialize()

      // Get last sync time
      const { data: integration } = await supabase
        .from('gmail_integrations')
        .select('last_sync_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (!integration) {
        throw new Error('No active Gmail integration found')
      }

      // Build query for new emails
      let query = 'is:unread'
      if (integration.last_sync_at) {
        const lastSync = new Date(integration.last_sync_at)
        const dateString = lastSync.toISOString().split('T')[0]
        query += ` after:${dateString}`
      }

      // Fetch emails
      console.log(`Fetching emails for user ${userId} with query: ${query}`)
      const emails = await gmailService.fetchEmails(query)
      
      if (emails.length === 0) {
        console.log('No new emails to process')
        return stats
      }

      console.log(`Found ${emails.length} emails to process`)

      // Check which emails have already been processed
      const messageIds = emails.map(e => e.id)
      const { data: processedEmails } = await supabase
        .from('processed_emails')
        .select('gmail_message_id')
        .in('gmail_message_id', messageIds)

      const processedIds = new Set(processedEmails?.map(e => e.gmail_message_id) || [])
      const newEmails = emails.filter(e => !processedIds.has(e.id))

      if (newEmails.length === 0) {
        console.log('All emails already processed')
        return stats
      }

      // Process new emails
      for (const email of newEmails) {
        try {
          const processed = await this.processEmail(email, userId, gmailService)
          stats.processed++
          
          if (processed.is_feedback) {
            stats.feedbackFound++
            // Note: We're not creating tasks directly anymore, just notifications
          }
        } catch (error) {
          console.error(`Error processing email ${email.id}:`, error)
        }
      }

      // Note: last_sync_at is now updated in the sync route directly
      console.log('Email processing completed for user:', userId)

      console.log(`Processing complete. Stats:`, stats)
      return stats
    } catch (error) {
      console.error('Email processing error:', error)
      throw error
    }
  }

  /**
   * Process a single email
   */
  private async processEmail(
    email: GmailMessage,
    userId: string,
    gmailService: GmailService
  ): Promise<ProcessedEmail> {
    const supabase = await createClient()
    
    // Extract email content
    const emailContent = GmailService.extractEmailContent(email)
    
    // Classify the email
    const classification = await this.classifier!.classifyEmail({
      from: emailContent.from,
      subject: emailContent.subject,
      content: emailContent.content
    })

    // Only save feedback emails to the database
    if (!classification.isFeedback || classification.confidence < 0.3) {
      console.log(`Email ${email.id} classified as non-feedback:`, {
        subject: emailContent.subject,
        from: emailContent.from,
        isFeedback: classification.isFeedback,
        confidence: classification.confidence,
        category: classification.category,
        summary: classification.summary
      })
      
      // Mark as read in Gmail
      await gmailService.markAsRead(email.id)
      
      // Return a dummy processed email (won't be saved)
      return {
        id: '',
        user_id: userId,
        gmail_message_id: email.id,
        gmail_thread_id: email.threadId,
        from_email: emailContent.from,
        from_name: emailContent.fromName,
        subject: emailContent.subject,
        content: emailContent.content,
        received_at: emailContent.date.toISOString(),
        is_feedback: false,
        feedback_type: undefined,
        confidence_score: classification.confidence,
        ai_summary: undefined,
        processed_at: new Date().toISOString(),
        task_id: undefined,
        created_at: new Date().toISOString()
      }
    }

    // Instead of creating a task, we'll create a notification for review
    let notificationId: string | undefined

    // Save processed email first
    const { data: processedEmail, error } = await supabase
      .from('processed_emails')
      .insert({
        user_id: userId,
        gmail_message_id: email.id,
        gmail_thread_id: email.threadId,
        from_email: emailContent.from,
        from_name: emailContent.fromName,
        subject: emailContent.subject,
        content: emailContent.content,
        received_at: emailContent.date.toISOString(),
        is_feedback: true,
        feedback_type: classification.category,
        confidence_score: classification.confidence,
        ai_summary: classification.summary
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save processed email: ${error.message}`)
    }

    // Create notification for user review
    if (processedEmail && classification.category) {
      console.log('Creating notification for feedback email:', {
        subject: emailContent.subject,
        category: classification.category,
        confidence: classification.confidence,
        title: classification.suggestedTitle || emailContent.subject
      })
      
      const { data: notification, error: notifError } = await supabase
        .from('feedback_notifications')
        .insert({
          user_id: userId,
          processed_email_id: processedEmail.id,
          title: classification.suggestedTitle || emailContent.subject,
          summary: emailContent.content, // Use full email content
          feedback_type: classification.category,
          suggested_priority: classification.suggestedPriority,
          confidence_score: classification.confidence
        })
        .select()
        .single()

      if (notification && !notifError) {
        notificationId = notification.id
        console.log('Notification created successfully:', notification.id)
        
        // Update processed email with notification reference
        await supabase
          .from('processed_emails')
          .update({ notification_id: notification.id })
          .eq('id', processedEmail.id)
      } else {
        console.error('Failed to create notification:', notifError)
      }
    } else {
      console.log('Not creating notification - missing processedEmail or category:', {
        hasProcessedEmail: !!processedEmail,
        category: classification.category
      })
    }

    // Mark as read in Gmail
    await gmailService.markAsRead(email.id)

    return processedEmail
  }

  /**
   * Process emails for all active integrations
   */
  async processAllActiveIntegrations(): Promise<{
    integrations: number
    totalProcessed: number
    totalFeedback: number
    totalTasks: number
  }> {
    const supabase = await createClient()
    
    const stats = {
      integrations: 0,
      totalProcessed: 0,
      totalFeedback: 0,
      totalTasks: 0
    }

    try {
      // Get all active integrations
      const { data: integrations, error } = await supabase
        .from('gmail_integrations')
        .select('user_id')
        .eq('is_active', true)

      if (error || !integrations) {
        throw new Error('Failed to fetch active integrations')
      }

      console.log(`Processing ${integrations.length} active integrations`)

      // Process each user's emails
      for (const integration of integrations) {
        try {
          const userStats = await this.processUserEmails(integration.user_id)
          stats.integrations++
          stats.totalProcessed += userStats.processed
          stats.totalFeedback += userStats.feedbackFound
          stats.totalTasks += userStats.tasksCreated
        } catch (error) {
          console.error(`Failed to process emails for user ${integration.user_id}:`, error)
        }
      }

      return stats
    } catch (error) {
      console.error('Error processing all integrations:', error)
      throw error
    }
  }
}