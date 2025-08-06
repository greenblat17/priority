import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TaskStatus } from '@/types/task'

export async function POST(request: NextRequest) {
  try {
    const { notificationId } = await request.json()
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get notification details
    const { data: notification, error: notifError } = await supabase
      .from('feedback_notifications')
      .select(`
        *,
        processed_email:processed_emails(
          from_email,
          from_name,
          subject,
          content,
          received_at
        )
      `)
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .single()

    if (notifError || !notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.status !== 'pending') {
      return NextResponse.json(
        { error: 'Notification already reviewed' },
        { status: 400 }
      )
    }

    // Determine task status based on feedback type
    let status: TaskStatus = TaskStatus.BACKLOG
    if (notification.feedback_type === 'bug_report' && (notification.suggested_priority || 5) >= 7) {
      status = TaskStatus.TODO
    } else if (notification.feedback_type === 'question') {
      status = TaskStatus.TODO
    }

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: notification.title,
        description: notification.summary,
        status,
        source: 'mail', // Set source to 'mail' for Gmail feedback
        customer_info: notification.processed_email?.from_email || null, // Set customer info to sender's email
        source_type: 'gmail',
        original_email_id: notification.processed_email_id,
        metadata: {
          feedback_type: notification.feedback_type,
          from_email: notification.processed_email?.from_email,
          from_name: notification.processed_email?.from_name,
          original_subject: notification.processed_email?.subject,
          suggested_priority: notification.suggested_priority,
          confidence_score: notification.confidence_score
        }
      })
      .select()
      .single()

    if (taskError) {
      console.error('Failed to create task:', taskError)
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      )
    }

    // Update notification status
    const { error: updateError } = await supabase
      .from('feedback_notifications')
      .update({
        status: 'accepted',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', notificationId)

    if (updateError) {
      console.error('Failed to update notification:', updateError)
      // Still return success since task was created
    }

    // Update processed email with task reference
    if (task) {
      await supabase
        .from('processed_emails')
        .update({ task_id: task.id })
        .eq('id', notification.processed_email_id)
        
      // Trigger AI analysis for the new task
      // We already have AI-generated info from email classification, so let's use that
      try {
        // Create analysis record using data from the notification
        const { error: analysisError } = await supabase
          .from('task_analyses')
          .insert({
            task_id: task.id,
            category: notification.feedback_type === 'bug_report' ? 'bug' : 
                     notification.feedback_type === 'feature_request' ? 'feature' :
                     notification.feedback_type === 'complaint' ? 'business' :
                     notification.feedback_type === 'praise' ? 'business' : 'other',
            priority: notification.suggested_priority || 5,
            complexity: 'medium', // Default since we don't analyze complexity from emails
            estimated_hours: null,
            confidence_score: Math.round((notification.confidence_score || 0.8) * 100),
            implementation_spec: null, // Will be generated if needed
            ice_impact: null,
            ice_confidence: null, 
            ice_ease: null,
            ice_reasoning: null
          })
          .select()
          .single()
          
        if (analysisError) {
          console.error('Failed to create task analysis:', analysisError)
        } else {
          console.log('Task analysis created for task:', task.id)
        }
      } catch (error) {
        console.error('Error creating task analysis:', error)
        // Don't fail the request if analysis fails
      }
    }

    return NextResponse.json({
      success: true,
      task
    })
  } catch (error) {
    console.error('Accept notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}